"use client";

import { Avatar, Card, Pill, buttonStyles, money } from "@/components/ui";
import { IconAlert, IconCheck, IconDoc, IconSend } from "@/components/icons";
import { whatsAppLink } from "@/lib/phone";

export type ReviewedRow = {
  submissionId: string;
  unitNumber: string;
  tenantName: string;
  tenantPhone: string;
  month: string;
  type: "rent" | "water";
  claimedAmount: number;
  status: "approved" | "rejected" | "pending";
  adminNote: string | null;
  decidedAt: number;
  /** Absolute, built on the server; null unless the payment was approved. */
  receiptUrl: string | null;
};

const monthName = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
};

/**
 * What to say. An approval carries the receipt so the tenant has something to
 * keep; a rejection carries the reason, because "not accepted" on its own
 * gives them nothing to act on.
 */
function message(row: ReviewedRow): string {
  const who = row.tenantName ? ` ${row.tenantName}` : "";
  const what = `${row.type} for ${monthName(row.month)}`;

  if (row.status === "approved") {
    const line = `Kuzuzangpo${who}, your ${what} (${money(row.claimedAmount)}) has been received. Thank you.`;
    return row.receiptUrl ? `${line}\nReceipt: ${row.receiptUrl}` : line;
  }
  return (
    `Kuzuzangpo${who}, your ${what} (${money(row.claimedAmount)}) could not be accepted.` +
    (row.adminNote ? ` ${row.adminNote}` : "") +
    ` Please send it again from the code on your door.`
  );
}

function ReviewedCard({ row }: { row: ReviewedRow }) {
  const chat = whatsAppLink(row.tenantPhone, message(row));

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
      <Avatar
        name={row.tenantName || `#${row.unitNumber}`}
        className="!bg-brand-soft !text-brand"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">
          Unit {row.unitNumber} · <span className="capitalize">{row.type}</span>
        </p>
        <p className="truncate text-sm text-muted">
          {money(row.claimedAmount)} · {monthName(row.month)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {row.status === "approved" ? (
          <Pill tone="ok"><IconCheck className="h-3.5 w-3.5" />Accepted</Pill>
        ) : (
          <Pill tone="bad"><IconAlert className="h-3.5 w-3.5" />Not accepted</Pill>
        )}
      </div>

      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        {row.receiptUrl ? (
          <a
            href={row.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonStyles.ghost} flex-1 !min-h-10 !px-3 sm:flex-none`}
          >
            <IconDoc className="h-4 w-4" />
            Receipt
          </a>
        ) : null}
        {chat ? (
          <a
            href={chat}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonStyles.ghost} flex-1 !min-h-10 !px-3 !text-brand sm:flex-none`}
          >
            <IconSend className="h-4 w-4" />
            Tell them
          </a>
        ) : (
          <span className="flex-1 self-center text-xs text-muted sm:flex-none">
            No WhatsApp number
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * Deciding removes a submission from the queue, so the button that tells the
 * tenant cannot live on the card that approved it. It lives here instead,
 * which also means a message can be sent an hour later rather than only in
 * the moment.
 */
export function RecentlyReviewed({ rows }: { rows: ReviewedRow[] }) {
  if (rows.length === 0) return null;

  return (
    <Card className="!p-0">
      <div className="px-4 py-4 sm:px-5">
        <h2 className="text-lg font-bold">Just decided</h2>
        <p className="text-sm text-muted">
          Nothing is sent automatically. Tap to tell the tenant on WhatsApp.
        </p>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {rows.map((row) => (
          <ReviewedCard key={row.submissionId} row={row} />
        ))}
      </ul>
    </Card>
  );
}
