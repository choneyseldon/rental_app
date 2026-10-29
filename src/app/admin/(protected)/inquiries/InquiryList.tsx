"use client";

import { useActionState } from "react";
import { format } from "date-fns";
import { Card, Pill, buttonStyles } from "@/components/ui";
import { whatsAppLink } from "@/lib/phone";
import { setInquiryHandled } from "../../actions";

export type InquiryRow = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  buildingName: string;
  location: string;
  unitCount: number;
  message: string | null;
  isHandled: boolean;
  receivedAt: number;
};

function HandledForm({ row }: { row: InquiryRow }) {
  const [state, action, pending] = useActionState(setInquiryHandled, null);
  return (
    <form action={action}>
      <input type="hidden" name="inquiryId" value={row._id} />
      <input type="hidden" name="isHandled" value={String(!row.isHandled)} />
      <button type="submit" disabled={pending} className={buttonStyles.ghost}>
        {row.isHandled ? "Mark as new" : "Mark as handled"}
      </button>
      {state?.error ? (
        <p role="alert" className="mt-1 text-sm font-medium text-bad">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function InquiryList({ rows }: { rows: InquiryRow[] }) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {rows.map((r) => {
        const wa = whatsAppLink(r.phone, `Hello ${r.name}, thank you for your interest in ChimBill for ${r.buildingName}.`);
        return (
          <Card as="li" key={r._id} className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight">{r.buildingName}</h2>
                <p className="text-sm text-muted">
                  {r.location} &middot; {r.unitCount} {r.unitCount === 1 ? "unit" : "units"}
                </p>
              </div>
              <Pill tone={r.isHandled ? "ok" : "warn"}>{r.isHandled ? "Handled" : "New"}</Pill>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Contact</dt>
                <dd className="break-words">{r.name}</dd>
              </div>
              <div>
                <dt className="sr-only">Email</dt>
                <dd>
                  <a href={`mailto:${encodeURIComponent(r.email).replace(/%40/g, "@")}`} className="break-all font-semibold text-brand underline">
                    {r.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-brand underline">
                    {r.phone}
                  </a>
                </dd>
              </div>
              {r.message ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Message</dt>
                  <dd className="whitespace-pre-wrap break-words">{r.message}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonStyles.primary}>
                  Message on WhatsApp
                </a>
              ) : null}
              <HandledForm row={r} />
              <span className="ml-auto text-xs text-muted">
                {format(new Date(r.receivedAt), "d MMM yyyy, h:mm a")}
              </span>
            </div>
          </Card>
        );
      })}
    </ul>
  );
}
