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
    <li className="rounded-xl border border-neutral-300 p-4">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">
          Unit {row.unitNumber} · <span className="capitalize">{row.type}</span>
        </h2>
        <p className="text-sm text-neutral-600">
          {row.tenantName || "No name recorded"} · {row.month}
        </p>
      </div>

      <p className="text-2xl font-bold tabular-nums">
        {money(row.claimedAmount)}
      </p>
      {mismatch ? (
        <p className="mt-1 rounded-md bg-amber-100 px-2 py-1 text-sm font-medium text-amber-900">
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
            className="max-h-80 w-full rounded-lg border border-neutral-300 object-contain"
          />
          <span className="mt-1 block text-sm text-neutral-600 underline">
            Open full size
          </span>
        </a>
      ) : (
        <p className="mt-3 text-sm text-red-700">Image missing.</p>
      )}

      <form action={submit} className="mt-4 space-y-3">
        <input type="hidden" name="submissionId" value={row.submissionId} />

        <div>
          <label
            htmlFor={`note-${row.submissionId}`}
            className="block text-sm font-medium text-neutral-700"
          >
            Note to tenant{" "}
            <span className="text-neutral-500">(required to reject)</span>
          </label>
          <input
            id={`note-${row.submissionId}`}
            name="adminNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. This screenshot is for last month"
            className="min-h-12 w-full rounded-lg border border-neutral-400 px-3 text-base"
          />
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm font-medium text-red-700">
            {state.error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            name="decision"
            value="approved"
            disabled={pending}
            className="min-h-12 flex-1 touch-manipulation rounded-lg bg-green-700 font-bold text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Approve"}
          </button>
          <button
            type="submit"
            name="decision"
            value="rejected"
            disabled={pending || !note.trim()}
            title={!note.trim() ? "Add a note first" : undefined}
            className="min-h-12 flex-1 touch-manipulation rounded-lg border-2 border-red-600 font-bold text-red-700 disabled:opacity-40"
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
    <ul className="space-y-4">
      {rows.map((row) => (
        <SubmissionCard key={row.submissionId} row={row} />
      ))}
    </ul>
  );
}
