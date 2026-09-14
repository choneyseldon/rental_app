"use client";

import { useActionState, useState } from "react";
import { Avatar, Card, Pill, buttonStyles, money } from "@/components/ui";
import { IconAlert } from "@/components/icons";
import { reviewSubmission } from "../../actions";

export type PendingRow = {
  submissionId: string;
  unitNumber: string;
  tenantName: string;
  month: string;
  type: "rent" | "water";
  claimedAmount: number;
  expectedAmount: number | null;
  imageUrl: string | null;
  submittedAt: number;
};

function SubmissionCard({ row }: { row: PendingRow }) {
  const [state, submit, pending] = useActionState(reviewSubmission, null);
  const [note, setNote] = useState("");

  // Flagged rather than blocked: a tenant may legitimately pay a different
  // amount, but the admin should not have to spot the mismatch themselves.
  const mismatch =
    row.expectedAmount !== null && row.expectedAmount !== row.claimedAmount;

  return (
    <Card as="li" className="!p-0">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* The screenshot leads: it is the thing being judged. */}
        <div className="border-b border-line bg-brand-tint p-4 lg:border-b-0 lg:border-r">
          {row.imageUrl ? (
            <a href={row.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
              {/* Convex storage URLs are external; next/image would need host config. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.imageUrl}
                alt={`Payment screenshot for unit ${row.unitNumber}`}
                className="mx-auto max-h-72 w-full rounded-xl border border-line bg-white object-contain"
              />
              <span className="mt-2 block text-center text-sm text-muted underline">Open full size</span>
            </a>
          ) : (
            <p className="py-10 text-center text-sm font-medium text-bad">Image missing.</p>
          )}
        </div>

        <div className="flex flex-col p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Avatar name={row.tenantName || `#${row.unitNumber}`} className="!bg-brand-soft !text-brand" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold leading-tight">
                Unit {row.unitNumber} · <span className="capitalize">{row.type}</span>
              </h2>
              <p className="truncate text-sm text-muted">
                {row.tenantName || "No name recorded"} · {row.month}
              </p>
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">
            {money(row.claimedAmount)}
          </p>
          {mismatch ? (
            <div className="mt-2">
              <Pill tone="warn">
                <IconAlert className="h-3.5 w-3.5" />
                Rent on file is {money(row.expectedAmount!)}
              </Pill>
            </div>
          ) : null}

          <form action={submit} className="mt-auto pt-5">
            <input type="hidden" name="submissionId" value={row.submissionId} />
            <label htmlFor={`note-${row.submissionId}`} className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Note to tenant <span className="normal-case text-muted/70">(required to reject)</span>
            </label>
            <input
              id={`note-${row.submissionId}`}
              name="adminNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. This screenshot is for last month"
              className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-base outline-none focus:border-brand"
            />

            {state?.error ? (
              <p role="alert" className="mt-2 text-sm font-medium text-bad">{state.error}</p>
            ) : null}

            <div className="mt-4 flex gap-3">
              <button type="submit" name="decision" value="approved" disabled={pending}
                className={`${buttonStyles.ok} flex-1`}>
                {pending ? "Saving…" : "Approve"}
              </button>
              <button type="submit" name="decision" value="rejected" disabled={pending || !note.trim()}
                title={!note.trim() ? "Add a note first" : undefined}
                className={`${buttonStyles.danger} flex-1`}>
                Reject
              </button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}

export function ReviewQueue({ rows }: { rows: PendingRow[] }) {
  return (
    <ul className="space-y-5">
      {rows.map((row) => <SubmissionCard key={row.submissionId} row={row} />)}
    </ul>
  );
}
