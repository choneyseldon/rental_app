"use client";

import { useActionState, useRef, useState } from "react";
import { Card, IconTile, Pill, buttonStyles } from "@/components/ui";
import { IconAlert, IconCheck, IconDoc, IconDrop } from "@/components/icons";
import { publishWaterBill, saveWaterBill } from "../../actions";

export type WaterBill = {
  month: string;
  total: number | null;
  billImageUrl: string | null;
  published: boolean;
  occupiedCount: number;
  shares: { unitNumber: string; tenantName: string; amount: number }[];
};

const money2 = (n: number) =>
  `Nu. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function WaterBillForm({ bill }: { bill: WaterBill }) {
  const [saveState, save, saving] = useActionState(saveWaterBill, null);
  const [publishState, publish, publishing] = useActionState(publishWaterBill, null);
  const [preparing, setPreparing] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Compressed before it enters the server action, whose body limit counts
  // multipart overhead as well as the file.
  async function onPickPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    if (!picked) return;
    setPreparing(true);
    try {
      const { default: compress } = await import("browser-image-compression");
      const small = await compress(picked, { maxSizeMB: 0.8, maxWidthOrHeight: 2000, useWebWorker: true });
      const dt = new DataTransfer();
      dt.items.add(new File([small], picked.name, { type: small.type }));
      if (photoRef.current) photoRef.current.files = dt.files;
      setPhotoName(picked.name);
    } catch {
      setPhotoName(null);
    } finally {
      setPreparing(false);
    }
  }

  const sharesTotal = bill.shares.reduce((a, s) => a + s.amount, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="flex items-start gap-3">
          <IconTile><IconDrop /></IconTile>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{bill.month}</h2>
            <div className="mt-1">
              {bill.published ? (
                <Pill tone="ok"><IconCheck className="h-3.5 w-3.5" />Published — tenants can see their share</Pill>
              ) : (
                <Pill tone="warn"><IconAlert className="h-3.5 w-3.5" />Not published — tenants cannot see this</Pill>
              )}
            </div>
          </div>
        </div>

        <form action={save} className="mt-5 space-y-4">
          <div>
            <label htmlFor="total" className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Total on the Thromde bill (Nu.)
            </label>
            <input id="total" name="total" type="number" inputMode="decimal" min={0.01} step={0.01}
              defaultValue={bill.total ?? ""} required
              className="mt-1 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-lg tabular-nums outline-none focus:border-brand" />
          </div>

          <div>
            <label htmlFor="photo" className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Photo of the bill
            </label>
            <input ref={photoRef} id="photo" name="photo" type="file" accept="image/*" onChange={onPickPhoto}
              className="mt-1 block w-full rounded-xl border border-line bg-white p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand" />
            {preparing ? (
              <p className="mt-1 text-sm text-muted">Getting it ready…</p>
            ) : photoName ? (
              <p className="mt-1 text-sm text-ok">Ready: {photoName}</p>
            ) : bill.billImageUrl ? (
              <a href={bill.billImageUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand underline">
                <IconDoc className="h-4 w-4" />
                A photo is already saved — view it
              </a>
            ) : null}
          </div>

          {saveState?.error ? (
            <p role="alert" className="text-sm font-medium text-bad">{saveState.error}</p>
          ) : null}

          <button type="submit" disabled={saving || preparing} className={`${buttonStyles.primary} w-full`}>
            {saving ? "Saving…" : "Save total and photo"}
          </button>
        </form>
      </Card>

      <div className="space-y-5">
        <Card className="!p-0">
          <div className="p-5 pb-3">
            <h3 className="text-lg font-bold">{bill.published ? "The split" : "How it would split"}</h3>
            <p className="text-sm text-muted">
              Split equally across the {bill.occupiedCount} unit{bill.occupiedCount === 1 ? "" : "s"} marked occupied.
            </p>
          </div>

          {bill.shares.length === 0 ? (
            <p className="mx-5 mb-5 rounded-xl bg-warn-soft p-3 text-sm text-[#92400e]">
              No units are marked occupied, so there is nobody to split between. Fix the occupancy
              flags on the Units page first.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-line border-t border-line">
                {bill.shares.map((s) => (
                  <li key={s.unitNumber} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="min-w-0 truncate">
                      <span className="font-semibold">Unit {s.unitNumber}</span>
                      {s.tenantName ? <span className="text-muted"> · {s.tenantName}</span> : null}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{money2(s.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-line bg-brand-tint px-5 py-3 text-sm">
                <span className="font-semibold text-muted">Adds up to</span>
                <span className="font-bold tabular-nums">{money2(sharesTotal)}</span>
              </div>
            </>
          )}
        </Card>

        <form
          action={publish}
          onSubmit={(event) => {
            const message = bill.published
              ? `Re-publish ${bill.month}? Every tenant's share will be recalculated from the ` +
                `current occupancy and total, and their pages will change.`
              : `Publish ${bill.month}? All ${bill.occupiedCount} occupied units will see their ` +
                `share straight away.`;
            if (!window.confirm(message)) event.preventDefault();
          }}
        >
          {publishState?.error ? (
            <p role="alert" className="mb-2 text-sm font-medium text-bad">{publishState.error}</p>
          ) : null}
          <button type="submit"
            disabled={publishing || bill.total == null || bill.shares.length === 0}
            className={`${buttonStyles.ok} w-full !min-h-14 !text-base`}>
            {publishing ? "Publishing…" : bill.published ? "Re-publish with today's occupancy" : "Publish to tenants"}
          </button>
        </form>
      </div>
    </div>
  );
}
