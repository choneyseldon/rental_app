"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { PaymentUpload } from "./PaymentUpload";

type Status = "approved" | "pending" | "rejected" | "none";

const money = (n: number) =>
  `Nu. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const monthName = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

/**
 * Status is the one thing that must be readable at arm's length, outdoors, so
 * it is carried by text and a solid colour block rather than a subtle tint.
 */
function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { label: string; className: string }> = {
    approved: { label: "Paid", className: "bg-green-700 text-white" },
    pending: { label: "Checking your payment", className: "bg-amber-500 text-black" },
    rejected: { label: "Not accepted", className: "bg-red-700 text-white" },
    none: { label: "Not paid yet", className: "bg-neutral-800 text-white" },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-block rounded-lg px-3 py-1.5 text-base font-bold ${className}`}>
      {label}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      // touch-action: manipulation removes the 300ms tap delay.
      className="min-h-12 touch-manipulation rounded-lg border-2 border-neutral-900 px-4 text-base font-semibold active:bg-neutral-200"
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
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border-2 border-neutral-300 bg-white p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-600">
        {title}
      </h2>
      {children}
    </section>
  );
}

export type TenantData = NonNullable<
  (typeof api.tenant.getByToken)["_returnType"]
>;

export function TenantView({ token }: { token: string }) {
  const data = useQuery(api.tenant.getByToken, { token });

  if (data === undefined) {
    return (
      <main className="p-5">
        <p className="text-lg">Loading…</p>
      </main>
    );
  }

  if (data === null) {
    return (
      <main className="mx-auto max-w-md p-5">
        <h1 className="mb-2 text-2xl font-bold">This code is no longer valid</h1>
        <p className="text-lg text-neutral-700">
          Please ask the owner for an up-to-date code for your door.
        </p>
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
  return (
    <main className="mx-auto max-w-md space-y-4 p-4 pb-16">
      <header className="pt-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
          Unit {data.unitNumber} · {monthName(data.month)}
        </p>
        {data.tenantName ? (
          <h1 className="text-2xl font-bold">{data.tenantName}</h1>
        ) : null}
      </header>

      <Card title="Rent">
        <p className="mb-3 text-4xl font-bold tabular-nums">
          {money(data.rent.amount)}
        </p>
        <StatusPill status={data.rent.status} />
        {token && data.rent.status !== "approved" && data.rent.status !== "pending" ? (
          <PaymentUpload
            token={token}
            type="rent"
            suggestedAmount={data.rent.amount}
          />
        ) : null}
      </Card>

      <Card title="Water">
        {data.water.published ? (
          <>
            <p className="mb-3 text-4xl font-bold tabular-nums">
              {data.water.amount === null ? "—" : money(data.water.amount)}
            </p>
            <StatusPill status={data.water.status} />
            {data.water.billImageUrl ? (
              <a
                href={data.water.billImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex min-h-12 items-center justify-center rounded-lg border-2 border-neutral-900 px-4 text-base font-semibold"
              >
                See the Thromde bill
              </a>
            ) : null}
            {token &&
            data.water.status !== "approved" &&
            data.water.status !== "pending" ? (
              <PaymentUpload
                token={token}
                type="water"
                suggestedAmount={data.water.amount}
              />
            ) : null}
          </>
        ) : (
          <p className="text-lg text-neutral-700">
            This month&rsquo;s bill has not come yet.
          </p>
        )}
      </Card>

      <Card title="Electricity">
        <p className="mb-1 text-lg text-neutral-700">
          Pay BPC directly with this consumer number.
        </p>
        {data.bpcConsumerNumber ? (
          <div className="mt-2 flex items-center gap-3">
            <span className="flex-1 select-all font-mono text-2xl font-bold tabular-nums">
              {data.bpcConsumerNumber}
            </span>
            <CopyButton value={data.bpcConsumerNumber} />
          </div>
        ) : (
          <p className="text-lg">Not recorded yet.</p>
        )}
      </Card>

      {data.history.length > 0 ? (
        <Card title="Your past payments">
          <ul className="divide-y divide-neutral-200">
            {data.history.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold capitalize">
                    {h.type} · {monthName(h.month)}
                  </p>
                  <p className="tabular-nums text-neutral-700">
                    {money(h.claimedAmount)}
                  </p>
                  {h.adminNote ? (
                    <p className="mt-1 text-sm text-neutral-600">{h.adminNote}</p>
                  ) : null}
                </div>
                <StatusPill status={h.status as Status} />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </main>
  );
}
