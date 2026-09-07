import Link from "next/link";
import { whatsAppLink } from "@/lib/phone";

type Status = "approved" | "pending" | "rejected" | "none";

export type DashboardData = {
  month: string;
  waterPublished: boolean;
  occupiedCount: number;
  rent: { paid: number; pending: number; missing: number };
  water: { paid: number; pending: number; missing: number };
  rows: {
    unitNumber: string;
    tenantName: string;
    tenantPhone: string;
    rentAmount: number;
    rentStatus: Status;
    waterAmount: number | null;
    waterStatus: Status;
    arrears: number;
  }[];
};

const money = (n: number) =>
  `Nu. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function Tally({
  label,
  counts,
  note,
}: {
  label: string;
  counts: { paid: number; pending: number; missing: number };
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-300 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-600">
        {label}
      </h2>
      {note ? <p className="mt-1 text-sm text-neutral-600">{note}</p> : null}
      <div className="mt-2 flex gap-4">
        <p className="tabular-nums">
          <span className="text-2xl font-bold text-green-800">{counts.paid}</span>
          <span className="ml-1 text-sm text-neutral-600">paid</span>
        </p>
        <p className="tabular-nums">
          <span className="text-2xl font-bold text-amber-700">
            {counts.pending}
          </span>
          <span className="ml-1 text-sm text-neutral-600">checking</span>
        </p>
        <p className="tabular-nums">
          <span className="text-2xl font-bold text-red-700">
            {counts.missing}
          </span>
          <span className="ml-1 text-sm text-neutral-600">not paid</span>
        </p>
      </div>
    </div>
  );
}

/** Compact enough that a whole row reads at a glance on a phone. */
function Chip({ status, label }: { status: Status; label: string }) {
  const tone: Record<Status, string> = {
    approved: "bg-green-700 text-white",
    pending: "bg-amber-500 text-black",
    rejected: "bg-red-700 text-white",
    none: "bg-neutral-300 text-neutral-900",
  };
  return (
    <span className={`rounded px-2 py-1 text-xs font-bold ${tone[status]}`}>
      {label}
    </span>
  );
}

export function Overview({ data }: { data: DashboardData }) {
  if (data.occupiedCount === 0) {
    return (
      <p className="rounded-lg bg-amber-100 p-4 text-sm text-amber-900">
        No units are marked occupied. Set occupancy on the{" "}
        <Link href="/admin/units" className="underline">
          Units page
        </Link>
        .
      </p>
    );
  }

  const owing = data.rows.filter(
    (r) =>
      r.rentStatus !== "approved" ||
      (data.waterPublished && r.waterStatus !== "approved"),
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-600">
        {data.month} · {data.occupiedCount} occupied
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Tally label="Rent" counts={data.rent} />
        <Tally
          label="Water"
          counts={data.water}
          note={data.waterPublished ? undefined : "Bill not published yet"}
        />
      </div>

      <section>
        <h2 className="mb-2 font-semibold">
          {owing.length === 0
            ? "Everyone is up to date"
            : `${owing.length} still to settle`}
        </h2>
        <ul className="space-y-2">
          {data.rows.map((row) => {
            // A nudge must only ask for what is genuinely outstanding. A
            // pending item has already been sent and is waiting on review, so
            // chasing it would be asking a tenant to pay twice — the exact
            // friction this is meant to remove. It still counts as unsettled
            // in the tallies above, which is the owner's view, not the ask.
            const outstanding = (s: Status) => s === "none" || s === "rejected";

            const parts: string[] = [];
            if (outstanding(row.rentStatus)) {
              parts.push(`rent ${money(row.rentAmount)}`);
            }
            if (
              data.waterPublished &&
              row.waterAmount !== null &&
              outstanding(row.waterStatus)
            ) {
              parts.push(`water ${money(row.waterAmount)}`);
            }

            const nudge =
              parts.length > 0
                ? whatsAppLink(
                    row.tenantPhone,
                    `Kuzuzangpo${row.tenantName ? " " + row.tenantName : ""}, ` +
                      `a reminder for unit ${row.unitNumber} for ${data.month}: ` +
                      `${parts.join(" and ")}. Thank you.`,
                  )
                : null;

            return (
              <li
                key={row.unitNumber}
                className="rounded-lg border border-neutral-300 p-3"
              >
                {/* Two rows on purpose: on a narrow phone a single flex row
                    squeezed the tenant name down to one letter, which is the
                    second thing the owner needs to read after the unit. */}
                <div className="flex items-center gap-2">
                  <span className="w-6 shrink-0 font-bold tabular-nums">
                    {row.unitNumber}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {row.tenantName || (
                      <span className="text-neutral-500">no name</span>
                    )}
                  </span>
                  {nudge ? (
                    <a
                      href={nudge}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 shrink-0 items-center rounded-lg border-2 border-green-700 px-3 text-sm font-bold text-green-800"
                    >
                      Nudge
                    </a>
                  ) : parts.length > 0 ? (
                    <span
                      className="shrink-0 text-xs text-neutral-500"
                      title="No usable mobile number on file for this unit"
                    >
                      no number
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 pl-8">
                  <Chip status={row.rentStatus} label="Rent" />
                  {data.waterPublished ? (
                    <Chip status={row.waterStatus} label="Water" />
                  ) : null}
                  {row.arrears > 0 ? (
                    <span
                      title="Estimate: past rent is valued at today's rent, which the schema does not version"
                      className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-900"
                    >
                      owes ~{money(row.arrears)}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
