"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { OWNER_CONTACTS, PROPERTY, RENT_ACCOUNT } from "../../../../convex/property";
import { Card, IconTile, Pill, buttonStyles, money, type Tone } from "@/components/ui";
import {
  IconCheck, IconChevron, IconCopy, IconSend,
} from "@/components/icons";
import { whatsAppLink } from "@/lib/phone";

export type TenantData = NonNullable<(typeof api.tenant.getByToken)["_returnType"]>;
export type Status = "approved" | "pending" | "rejected" | "none";
export type HistoryRow = TenantData["history"][number];

/**
 * Every tenant page subscribes to the same query with the same argument, so
 * Convex serves them all from one subscription rather than one per page.
 */
export function useTenant(token: string) {
  return useQuery(api.tenant.getByToken, { token });
}

export const monthName = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
};

const STATUS: Record<Status, { label: string; tone: Tone }> = {
  approved: { label: "Paid", tone: "ok" },
  pending: { label: "Checking", tone: "warn" },
  rejected: { label: "Not accepted", tone: "bad" },
  none: { label: "Not paid yet", tone: "bad" },
};

export function StatusPill({ status }: { status: Status }) {
  const { label, tone } = STATUS[status];
  return (
    <Pill tone={tone}>
      {status === "approved" ? <IconCheck className="h-3.5 w-3.5" /> : null}
      {label}
    </Pill>
  );
}

/**
 * A summary tile. Two up on a phone, four across on a laptop. The chevron was
 * decoration when everything lived on one page; now each tile is the way into
 * the page that owns it, so it links.
 */
export function Stat({
  icon, label, value, meta, tone = "brand", href,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  tone?: "brand" | "ok" | "warn";
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <IconTile tone={tone}>{icon}</IconTile>
        {href ? <IconChevron className="h-4 w-4 text-slate-300" /> : null}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
        {meta ? <div className="mt-1.5 text-xs text-muted">{meta}</div> : null}
      </div>
    </>
  );
  const shell = "card flex flex-col gap-3 p-4 sm:p-5";
  return href ? (
    <Link href={href} className={`${shell} transition-colors hover:border-brand/40`}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={buttonStyles.ghost}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      <IconCopy className="h-4 w-4" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** Where the money goes. Shown on whichever page is asking for a payment. */
export function TransferPanel() {
  return (
    <div className="rounded-xl bg-brand-tint p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Transfer to</p>
      <p className="mt-1 font-semibold">{RENT_ACCOUNT.holder}</p>
      <p className="text-sm text-muted">{RENT_ACCOUNT.bank}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="select-all font-mono text-xl font-bold tabular-nums">
          {RENT_ACCOUNT.number}
        </span>
        <CopyButton value={RENT_ACCOUNT.number} />
      </div>
    </div>
  );
}

/**
 * The payment record. Filtered by type on the rent and water pages, and shown
 * whole on the home page.
 */
export function HistoryCard({
  rows,
  title,
  empty,
  showType = true,
}: {
  rows: HistoryRow[];
  title: string;
  empty: string;
  showType?: boolean;
}) {
  return (
    <Card className="!p-0">
      <h2 className="px-5 py-4 text-lg font-bold sm:px-6">{title}</h2>
      {rows.length === 0 ? (
        <p className="px-5 pb-6 text-muted sm:px-6">{empty}</p>
      ) : (
        <>
          <table className="hidden w-full text-sm sm:table">
            <thead>
              <tr className="border-y border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-semibold">Month</th>
                {showType ? <th className="px-3 py-3 font-semibold">Type</th> : null}
                <th className="px-3 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-6 py-4">
                    {monthName(h.month)}
                    {h.adminNote ? (
                      <span className="mt-1 block text-xs text-muted">{h.adminNote}</span>
                    ) : null}
                  </td>
                  {showType ? <td className="px-3 py-4 capitalize">{h.type}</td> : null}
                  <td className="px-3 py-4 font-semibold tabular-nums">{money(h.claimedAmount)}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusPill status={h.status as Status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y divide-line border-t border-line sm:hidden">
            {rows.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold capitalize">{showType ? h.type : monthName(h.month)}</p>
                  {showType ? <p className="text-xs text-muted">{monthName(h.month)}</p> : null}
                  {h.adminNote ? <p className="mt-1 text-xs text-muted">{h.adminNote}</p> : null}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums">{money(h.claimedAmount)}</p>
                  <div className="mt-1"><StatusPill status={h.status as Status} /></div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

/** The owners, with a WhatsApp button per number. */
export function OwnerContacts({ unitNumber }: { unitNumber: string }) {
  return (
    <ul className="space-y-3">
      {OWNER_CONTACTS.map((c) => {
        const chat = whatsAppLink(c.phone, `Kuzuzangpo, about unit ${unitNumber}.`);
        return (
          <li key={c.phone} className="flex flex-wrap items-center gap-3">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{c.name}</span>
              <a href={`tel:${c.phone}`} className="block text-sm text-muted underline">
                {c.phone}
              </a>
            </span>
            {chat ? (
              <a
                href={chat}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonStyles.ghost} shrink-0 !min-h-10 !px-3 !text-brand`}
              >
                <IconSend className="h-4 w-4" />
                Message
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Heading for a page that is about one thing. */
export function SectionHeader({
  icon, title, note, tone = "brand",
}: {
  icon: React.ReactNode;
  title: string;
  note?: React.ReactNode;
  tone?: "brand" | "ok" | "warn";
}) {
  return (
    <div className="flex items-start gap-3">
      <IconTile tone={tone}>{icon}</IconTile>
      <div className="min-w-0">
        <h2 className="text-lg font-bold">{title}</h2>
        {note ? <p className="text-sm text-muted">{note}</p> : null}
      </div>
    </div>
  );
}

export function Loading() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <p className="text-muted">Loading…</p>
    </main>
  );
}

export function InvalidCode() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="max-w-sm text-center">
        <h1 className="text-xl font-bold">This code is no longer valid</h1>
        <p className="mt-2 text-muted">
          Please ask the owner for an up-to-date code for your door.
        </p>
      </Card>
    </main>
  );
}

export { PROPERTY, RENT_ACCOUNT, money };
