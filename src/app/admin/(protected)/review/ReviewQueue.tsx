"use client";

import { useActionState, useState } from "react";
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

const money = (n: number) =>
  `Nu. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function SubmissionCard({ row }: { row: PendingRow }) {
  const [state, submit, pending] = useActionState(reviewSubmission, null);
  const [note, setNote] = useState("");

  // Flagged rather than blocked: a tenant may legitimately pay a different
  // amount, but the admin should not have to spot the mismatch themselves.
  const mismatch =
    row.expectedAmount !== null && row.expectedAmount !== row.claimedAmount;

  return (
    <li className="card p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">
          Unit {row.unitNumber} · <span className="capitalize">{row.type}</span>
        </h2>
        <p className="text-sm text-muted">
          {row.tenantName || "No name recorded"} · {row.month}
        </p>
      </div>

      <p className="text-2xl font-bold tabular-nums">
        {money(row.claimedAmount)}
      </p>
      {mismatch ? (
        <p className="mt-1 inline-block rounded-lg bg-warn-soft px-2 py-1 text-sm font-semibold text-[#92400e]">
          Rent on file is {money(row.expectedAmount!)}
        </p>
      ) : null}

      {row.imageUrl ? (
        <a
          href={row.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block"
        >
          {/* Convex storage URLs are external; next/image would need host config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.imageUrl}
            alt={`Payment screenshot for unit ${row.unitNumber}`}
            className="max-h-80 w-full rounded-xl border border-line bg-brand-tint object-contain"
          />
          <span className="mt-1 block text-sm text-muted underline">
            Open full size
          </span>
        </a>
      ) : (
        <p className="mt-3 text-sm font-medium text-bad">Image missing.</p>
      )}

      <form action={submit} className="mt-4 space-y-3">
        <input type="hidden" name="submissionId" value={row.submissionId} />

        <div>
          <label
            htmlFor={`note-${row.submissionId}`}
            className="block text-sm font-semibold text-muted"
          >
            Note to tenant{" "}
            <span className="text-muted">(required to reject)</span>
          </label>
          <input
            id={`note-${row.submissionId}`}
            name="adminNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. This screenshot is for last month"
            className="mt-1 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base outline-none focus:border-brand"
          />
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm font-medium text-bad">
            {state.error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            name="decision"
            value="approved"
            disabled={pending}
            className="inline-flex min-h-12 flex-1 touch-manipulation items-center justify-center rounded-xl bg-ok font-bold text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Approve"}
          </button>
          <button
            type="submit"
            name="decision"
            value="rejected"
            disabled={pending || !note.trim()}
            title={!note.trim() ? "Add a note first" : undefined}
            className="inline-flex min-h-12 flex-1 touch-manipulation items-center justify-center rounded-xl border border-bad/50 bg-white font-bold text-bad transition hover:bg-bad-soft disabled:opacity-40"
          >
            Reject
          </button>
        </div>
      </form>
    </li>
  );
}

export function ReviewQueue({ rows }: { rows: PendingRow[] }) {
  return (
    <ul className="grid gap-4 xl:grid-cols-2">
      {rows.map((row) => (
        <SubmissionCard key={row.submissionId} row={row} />
      ))}
    </ul>
  );
}
