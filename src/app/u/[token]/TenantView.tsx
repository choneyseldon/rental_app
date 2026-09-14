"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { PaymentUpload } from "./PaymentUpload";
import { AppShell, type NavItem } from "@/components/AppShell";
import { Card, IconTile, Pill, buttonStyles, money, type Tone } from "@/components/ui";
import {
  IconBolt, IconCamera, IconCash, IconCheck, IconChevron, IconCopy,
  IconDoc, IconDrop, IconHelp, IconHome, IconReceipt,
} from "@/components/icons";

type Status = "approved" | "pending" | "rejected" | "none";

export type TenantData = NonNullable<(typeof api.tenant.getByToken)["_returnType"]>;

const monthName = (key: string) => {
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

function StatusPill({ status }: { status: Status }) {
  const { label, tone } = STATUS[status];
  return (
    <Pill tone={tone}>
      {status === "approved" ? <IconCheck className="h-3.5 w-3.5" /> : null}
      {label}
    </Pill>
  );
}

/**
 * The four summary tiles. These are the only place rent and water amounts
 * appear — repeating them in full cards below is what made the first pass feel
 * like an endless chain of boxes.
 */
function Stat({
  icon, label, value, meta, tone = "brand",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  tone?: "brand" | "ok" | "warn";
}) {
  return (
    <div className="card flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <IconTile tone={tone}>{icon}</IconTile>
        <IconChevron className="h-4 w-4 text-slate-200" />
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
        {meta ? <div className="mt-1.5 text-xs text-muted">{meta}</div> : null}
      </div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
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

export function TenantView({ token }: { token: string }) {
  const data = useQuery(api.tenant.getByToken, { token });

  if (data === undefined) {
    return <main className="grid min-h-screen place-items-center p-6"><p className="text-muted">Loading…</p></main>;
  }
  if (data === null) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <Card className="max-w-sm text-center">
          <h1 className="text-xl font-bold">This code is no longer valid</h1>
          <p className="mt-2 text-muted">Please ask the owner for an up-to-date code for your door.</p>
        </Card>
      </main>
    );
  }
  return <TenantCards data={data} token={token} />;
}

export function TenantCards({
  data,
  token,
}: {
  data: TenantData;
  /** Omitted in layout previews, where uploading is not wired up. */
  token?: string;
}) {
  const nav: NavItem[] = [
    { href: "#home", label: "Home", icon: <IconHome /> },
    { href: "#pay", label: "Pay", icon: <IconCash /> },
    { href: "#payments", label: "Payments", icon: <IconReceipt /> },
    { href: "#electricity", label: "Power", icon: <IconBolt /> },
    { href: "#help", label: "Help", icon: <IconHelp /> },
  ];

  const dueRent = data.rent.status !== "approved" && data.rent.status !== "pending";
  const dueWater =
    data.water.published && data.water.status !== "approved" && data.water.status !== "pending";

  return (
    <AppShell
      nav={nav}
      user={data.tenantName || "Tenant"}
      greeting={`Kuzuzangpo${data.tenantName ? `, ${data.tenantName}` : ""} 👋`}
      subtitle={`Here's your rental account for ${monthName(data.month)}.`}
    >
      <div className="space-y-6" id="home">
        {/* Two up on a phone, four across on a laptop. */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={<IconHome />} label="My Unit" value={data.unitNumber} meta="Your door" />
          <Stat
            icon={<IconCash />}
            label="Current Rent"
            value={money(data.rent.amount)}
            meta={<StatusPill status={data.rent.status} />}
            tone={data.rent.status === "approved" ? "ok" : "brand"}
          />
          <Stat
            icon={<IconDrop />}
            label="Water Bill"
            value={data.water.published && data.water.amount !== null ? money(data.water.amount) : "—"}
            meta={
              data.water.published ? (
                <StatusPill status={data.water.status} />
              ) : (
                "Not published yet"
              )
            }
          />
          <Stat
            icon={<IconBolt />}
            label="Electricity"
            value={data.bpcConsumerNumber ? "Pay BPC" : "—"}
            meta={data.bpcConsumerNumber ? "Consumer no. below" : "Not recorded yet"}
            tone="warn"
          />
        </div>

        {/* One place to pay, listing only what is actually outstanding. */}
        {token && (dueRent || dueWater) ? (
          <Card id="pay">
            <div className="flex items-start gap-3">
              <IconTile><IconCamera /></IconTile>
              <div>
                <h2 className="text-lg font-bold">Send a payment</h2>
                <p className="text-sm text-muted">
                  Pay the owner, then add a screenshot here. This page updates on its own.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-6">
              {dueRent ? (
                <div>
                  <p className="mb-2 font-semibold">Rent · {money(data.rent.amount)}</p>
                  <PaymentUpload token={token} type="rent" suggestedAmount={data.rent.amount} />
                </div>
              ) : null}
              {dueWater ? (
                <div className={dueRent ? "border-t border-line pt-6" : ""}>
                  <p className="mb-2 font-semibold">
                    Water · {data.water.amount === null ? "—" : money(data.water.amount)}
                  </p>
                  <PaymentUpload token={token} type="water" suggestedAmount={data.water.amount} />
                </div>
              ) : null}
            </div>
          </Card>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2" id="payments">
            <Card className="!p-0">
              <h2 className="px-5 py-4 text-lg font-bold sm:px-6">Recent payments</h2>
              {data.history.length === 0 ? (
                <p className="px-5 pb-6 text-muted sm:px-6">Nothing yet.</p>
              ) : (
                <>
                  <table className="hidden w-full text-sm sm:table">
                    <thead>
                      <tr className="border-y border-line text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-6 py-3 font-semibold">Month</th>
                        <th className="px-3 py-3 font-semibold">Type</th>
                        <th className="px-3 py-3 font-semibold">Amount</th>
                        <th className="px-6 py-3 text-right font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.history.map((h, i) => (
                        <tr key={i} className="border-b border-line last:border-0">
                          <td className="px-6 py-4">{monthName(h.month)}</td>
                          <td className="px-3 py-4 capitalize">{h.type}</td>
                          <td className="px-3 py-4 font-semibold tabular-nums">{money(h.claimedAmount)}</td>
                          <td className="px-6 py-4 text-right"><StatusPill status={h.status as Status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ul className="divide-y divide-line border-t border-line sm:hidden">
                    {data.history.map((h, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-semibold capitalize">{h.type}</p>
                          <p className="text-xs text-muted">{monthName(h.month)}</p>
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
          </div>

          <div className="space-y-5">
            <Card id="electricity">
              <div className="flex items-start gap-3">
                <IconTile tone="warn"><IconBolt /></IconTile>
                <div>
                  <h2 className="font-bold">Electricity</h2>
                  <p className="text-sm text-muted">Pay BPC directly with this consumer number.</p>
                </div>
              </div>
              {data.bpcConsumerNumber ? (
                <div className="mt-4 rounded-xl bg-brand-tint p-4">
                  <p className="select-all break-all font-mono text-2xl font-bold tabular-nums">
                    {data.bpcConsumerNumber}
                  </p>
                  <div className="mt-3"><CopyButton value={data.bpcConsumerNumber} /></div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">Not recorded yet.</p>
              )}
            </Card>

            {data.water.billImageUrl ? (
              <Card>
                <div className="flex items-start gap-3">
                  <IconTile><IconDoc /></IconTile>
                  <div>
                    <h2 className="font-bold">Thromde bill</h2>
                    <p className="text-sm text-muted">The bill your share was worked out from.</p>
                  </div>
                </div>
                <a
                  href={data.water.billImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonStyles.ghost} mt-4 w-full`}
                >
                  View the bill
                </a>
              </Card>
            ) : null}

            <Card id="help">
              <h2 className="font-bold">Need help?</h2>
              <p className="mt-1 text-sm text-muted">
                Ask the owner directly. There is no account to recover and no password to reset —
                the code on your door is all you need.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
