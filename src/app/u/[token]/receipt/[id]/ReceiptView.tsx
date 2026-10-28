"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, ChimBillMark, buttonStyles, money } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { Loading, PROPERTY, monthName } from "../../shared";
import "../receipt.css";

const dateTime = (ms: number) =>
  new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

export type ReceiptData = NonNullable<(typeof api.tenant.getReceipt)["_returnType"]>;

/** Resolves the id; the slip itself is ReceiptCard, so a fixture can drive it. */
export function ReceiptView({
  token,
  submissionId,
}: {
  token: string;
  submissionId: string;
}) {
  const data = useQuery(api.tenant.getReceipt, {
    token,
    submissionId: submissionId as Id<"submissions">,
  });

  if (data === undefined) return <Loading />;

  // Null covers all three refusals at once — unknown code, a submission from
  // another flat, and one that has not been approved. None of them is worth
  // telling apart on screen, and separating them would say whether an id
  // exists.
  if (data === null) {
    return (
      <Card className="max-w-lg">
        <h1 className="text-xl font-bold">No receipt here</h1>
        <p className="mt-2 text-muted">
          A receipt exists only once the owner has accepted a payment. If yours is still
          being checked, it will appear in your payment list when it is accepted.
        </p>
        <Link href={`/u/${token}`} className={`${buttonStyles.ghost} mt-5 w-full`}>
          Back to your page
        </Link>
      </Card>
    );
  }

  return <ReceiptCard data={data} token={token} />;
}

export function ReceiptCard({
  data,
  token,
}: {
  data: ReceiptData;
  /** Omitted in layout previews, which are not inside a token's route. */
  token?: string;
}) {
  return (
    <div>
      <Card className="receipt">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <ChimBillMark className="size-11 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold leading-tight">{PROPERTY.name}</p>
              <p className="text-sm text-muted">Owner · {PROPERTY.owner}</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ok-soft px-2.5 py-1 text-xs font-semibold text-[#166534]">
            <IconCheck className="h-3.5 w-3.5" />
            Paid
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Payment receipt
          </p>
          <p className="receipt-no mt-1 font-mono text-sm font-semibold">{data.receiptNo}</p>
        </div>

        <p className="mt-5 text-4xl font-bold tracking-tight tabular-nums">
          {money(data.amount)}
        </p>
        <p className="mt-1 capitalize text-muted">
          {data.type} · {monthName(data.month)}
        </p>

        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Unit</dt>
            <dd className="font-semibold">{data.unitNumber}</dd>
          </div>
          {data.tenantName ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Tenant</dt>
              <dd className="min-w-0 text-right font-semibold">{data.tenantName}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Sent</dt>
            <dd className="font-semibold">{dateTime(data.paidOn)}</dd>
          </div>
          {data.hasApprovalDate ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Accepted</dt>
              <dd className="font-semibold">{dateTime(data.approvedOn)}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-muted">
          Issued by {PROPERTY.name}, {PROPERTY.address}. This receipt records a payment the
          owner has checked and accepted.
        </p>
      </Card>

      <div className="receipt-no-print mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className={`${buttonStyles.primary} flex-1`}
        >
          Print or save as PDF
        </button>
        {token ? (
          <Link href={`/u/${token}`} className={`${buttonStyles.ghost} flex-1`}>
            Back to your page
          </Link>
        ) : null}
      </div>
    </div>
  );
}
