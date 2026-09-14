"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { PaymentUpload } from "./PaymentUpload";
import { Avatar, Card, IconTile, Pill, StatCard, buttonStyles, money, type Tone } from "@/components/ui";
import {
  IconBolt, IconCalendar, IconCamera, IconCash, IconCheck, IconCopy,
  IconDoc, IconDrop, IconHome, IconReceipt,
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
  pending: { label: "Checking your payment", tone: "warn" },
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
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <p className="text-lg text-muted">Loading…</p>
      </main>
    );
  }

  if (data === null) {
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

  return <TenantCards data={data} token={token} />;
}

/** Presentation only: no query, so it can be rendered from fixture data. */
export function TenantCards({
  data,
  token,
}: {
  data: TenantData;
  /** Omitted in layout previews, where uploading is not wired up. */
  token?: string;
}) {
  const canPayRent = data.rent.status !== "approved" && data.rent.status !== "pending";
  const canPayWater =
    data.water.published && data.water.status !== "approved" && data.water.status !== "pending";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
          <IconHome />
        </span>
        <span className="text-lg font-bold tracking-tight">Rentify</span>
        <Avatar name={data.tenantName || "Tenant"} className="ml-auto" />
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5 pb-16 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">
          Kuzuzangpo{data.tenantName ? `, ${data.tenantName}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Here&rsquo;s an overview of your rental account.
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <IconCalendar className="h-4 w-4" />
          {monthName(data.month)}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<IconHome />} label="My Unit" value={data.unitNumber} meta="Your door" />
          <StatCard
            icon={<IconCash />}
            label="Current Rent"
            value={money(data.rent.amount)}
            meta={STATUS[data.rent.status].label}
            tone={data.rent.status === "approved" ? "ok" : "brand"}
          />
          <StatCard
            icon={<IconDrop />}
            label="Water Bill"
            value={data.water.published && data.water.amount !== null ? money(data.water.amount) : "—"}
            meta={data.water.published ? STATUS[data.water.status].label : "Not published yet"}
            tone="brand"
          />
          <StatCard
            icon={<IconCheck />}
            label="Payment Status"
            value={<StatusPill status={data.rent.status} />}
            meta={`Rent for ${monthName(data.month)}`}
            tone={data.rent.status === "approved" ? "ok" : "warn"}
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <div className="flex items-start gap-3">
                <IconTile><IconCash /></IconTile>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">Rent</h2>
                  <p className="text-3xl font-bold tracking-tight">{money(data.rent.amount)}</p>
                  <div className="mt-2"><StatusPill status={data.rent.status} /></div>
                </div>
              </div>
              {token && canPayRent ? (
                <PaymentUpload token={token} type="rent" suggestedAmount={data.rent.amount} />
              ) : null}
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <IconTile><IconDrop /></IconTile>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">Water</h2>
                  {data.water.published ? (
                    <>
                      <p className="text-3xl font-bold tracking-tight">
                        {data.water.amount === null ? "—" : money(data.water.amount)}
                      </p>
                      <div className="mt-2"><StatusPill status={data.water.status} /></div>
                    </>
                  ) : (
                    <p className="mt-1 text-muted">This month&rsquo;s bill has not come yet.</p>
                  )}
                </div>
              </div>
              {data.water.billImageUrl ? (
                <a
                  href={data.water.billImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonStyles.ghost} mt-4 w-full`}
                >
                  <IconDoc className="h-4 w-4" />
                  See the Thromde bill
                </a>
              ) : null}
              {token && canPayWater ? (
                <PaymentUpload token={token} type="water" suggestedAmount={data.water.amount} />
              ) : null}
            </Card>

            {data.history.length > 0 ? (
              <Card className="!p-0">
                <h2 className="border-b border-line p-4 font-bold sm:p-5">Recent payments</h2>
                <table className="hidden w-full text-sm sm:table">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted">
                      <th className="px-5 py-3 font-semibold">Month</th>
                      <th className="px-3 py-3 font-semibold">Type</th>
                      <th className="px-3 py-3 font-semibold">Amount</th>
                      <th className="px-5 py-3 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.map((h, i) => (
                      <tr key={i} className="border-t border-line">
                        <td className="px-5 py-3">{monthName(h.month)}</td>
                        <td className="px-3 py-3 capitalize">{h.type}</td>
                        <td className="px-3 py-3 font-semibold tabular-nums">{money(h.claimedAmount)}</td>
                        <td className="px-5 py-3 text-right"><StatusPill status={h.status as Status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ul className="divide-y divide-line sm:hidden">
                  {data.history.map((h, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="font-semibold capitalize">{h.type}</p>
                        <p className="text-xs text-muted">{monthName(h.month)}</p>
                        {h.adminNote ? (
                          <p className="mt-1 text-xs text-muted">{h.adminNote}</p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums">{money(h.claimedAmount)}</p>
                        <div className="mt-1"><StatusPill status={h.status as Status} /></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card>
              <div className="flex items-start gap-3">
                <IconTile tone="warn"><IconBolt /></IconTile>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">Electricity</h2>
                  <p className="text-sm text-muted">
                    Pay BPC directly with this consumer number.
                  </p>
                </div>
              </div>
              {data.bpcConsumerNumber ? (
                <div className="mt-4">
                  <p className="select-all break-all font-mono text-2xl font-bold tabular-nums">
                    {data.bpcConsumerNumber}
                  </p>
                  <div className="mt-3"><CopyButton value={data.bpcConsumerNumber} /></div>
                </div>
              ) : (
                <p className="mt-3 text-sm">Not recorded yet.</p>
              )}
            </Card>

            <Card>
              <h2 className="font-bold">How this works</h2>
              <ul className="mt-3 space-y-3 text-sm text-muted">
                <li className="flex gap-3">
                  <IconTile><IconCamera /></IconTile>
                  <span>Pay the owner, then add a screenshot of the payment here.</span>
                </li>
                <li className="flex gap-3">
                  <IconTile><IconReceipt /></IconTile>
                  <span>The owner checks it. This page updates on its own.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
