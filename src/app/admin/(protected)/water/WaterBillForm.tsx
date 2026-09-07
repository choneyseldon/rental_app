"use client";

import { useActionState, useRef, useState } from "react";
import { publishWaterBill, saveWaterBill } from "../../actions";

export type WaterBill = {
  month: string;
  total: number | null;
  billImageUrl: string | null;
  published: boolean;
  occupiedCount: number;
  shares: { unitNumber: string; tenantName: string; amount: number }[];
};

const money = (n: number) =>
  `Nu. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function WaterBillForm({ bill }: { bill: WaterBill }) {
  const [saveState, save, saving] = useActionState(saveWaterBill, null);
  const [publishState, publish, publishing] = useActionState(
    publishWaterBill,
    null,
  );
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
      const small = await compress(picked, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
      });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{bill.month}</h2>
        <p className="text-sm text-neutral-600">
          {bill.published
            ? "Published. Tenants can see their share."
            : "Not published yet. Tenants cannot see this."}
        </p>
      </div>

      <form action={save} className="space-y-4">
        <div>
          <label htmlFor="total" className="block text-sm font-medium">
            Total on the Thromde bill (Nu.)
          </label>
          <input
            id="total"
            name="total"
            type="number"
            inputMode="decimal"
            min={0.01}
            step={0.01}
            defaultValue={bill.total ?? ""}
            required
            className="min-h-12 w-full rounded-lg border border-neutral-400 px-3 text-lg tabular-nums"
          />
        </div>

        <div>
          <label
            htmlFor="photo"
            className="block text-sm font-medium"
          >
            Photo of the bill
          </label>
          <input
            ref={photoRef}
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            onChange={onPickPhoto}
            className="min-h-12 w-full text-sm"
          />
          {preparing ? (
            <p className="text-sm text-neutral-600">Getting it ready…</p>
          ) : photoName ? (
            <p className="text-sm text-green-800">Ready: {photoName}</p>
          ) : bill.billImageUrl ? (
            <a
              href={bill.billImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              A photo is already saved — view it
            </a>
          ) : null}
        </div>

        {saveState?.error ? (
          <p role="alert" className="text-sm font-medium text-red-700">
            {saveState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving || preparing}
          className="min-h-12 w-full touch-manipulation rounded-lg bg-neutral-900 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save total and photo"}
        </button>
      </form>

      <section className="rounded-xl border border-neutral-300 p-4">
        <h3 className="font-semibold">
          {bill.published ? "The split" : "How it would split"}
        </h3>
        <p className="mb-3 text-sm text-neutral-600">
          Split equally across the {bill.occupiedCount} unit
          {bill.occupiedCount === 1 ? "" : "s"} marked occupied.
        </p>

        {bill.shares.length === 0 ? (
          <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900">
            No units are marked occupied, so there is nobody to split between.
            Fix the occupancy flags on the Units page first.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-neutral-200">
              {bill.shares.map((s) => (
                <li
                  key={s.unitNumber}
                  className="flex items-center justify-between py-2"
                >
                  <span>
                    Unit {s.unitNumber}
                    {s.tenantName ? (
                      <span className="text-neutral-600"> · {s.tenantName}</span>
                    ) : null}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {money(s.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between border-t border-neutral-300 pt-3 text-sm">
              <span className="text-neutral-600">Adds up to</span>
              <span className="font-semibold tabular-nums">
                {money(sharesTotal)}
              </span>
            </p>
          </>
        )}
      </section>

      <form
        action={publish}
        onSubmit={(event) => {
          const message = bill.published
            ? `Re-publish ${bill.month}? Every tenant's share will be recalculated ` +
              `from the current occupancy and total, and their pages will change.`
            : `Publish ${bill.month}? All ${bill.occupiedCount} occupied units ` +
              `will see their share straight away.`;
          if (!window.confirm(message)) event.preventDefault();
        }}
      >
        {publishState?.error ? (
          <p role="alert" className="mb-2 text-sm font-medium text-red-700">
            {publishState.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={publishing || bill.total == null || bill.shares.length === 0}
          className="min-h-14 w-full touch-manipulation rounded-lg bg-green-700 text-lg font-bold text-white disabled:opacity-40"
        >
          {publishing
            ? "Publishing…"
            : bill.published
              ? "Re-publish with today's occupancy"
              : "Publish to tenants"}
        </button>
      </form>
    </div>
  );
}
