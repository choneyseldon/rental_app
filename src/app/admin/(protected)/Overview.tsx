import Link from "next/link";
import { whatsAppLink } from "@/lib/phone";
import { Avatar, Card, IconTile, Pill, Tally, buttonStyles, money } from "@/components/ui";
import { IconAlert, IconCalendar, IconCheck, IconChevron, IconDrop, IconHome, IconSend } from "@/components/icons";

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

function TallyCard({
  icon,
  title,
  note,
  counts,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
  counts: { paid: number; pending: number; missing: number };
  href: string;
}) {
  return (
    <Card className="min-w-0">
      <Link href={href} className="flex items-start gap-3">
        <IconTile>{icon}</IconTile>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold uppercase tracking-wide">{title}</h2>
          <p className="truncate text-sm text-muted">{note}</p>
        </div>
        <IconChevron className="h-4 w-4 shrink-0 text-slate-300" />
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-4 sm:gap-x-6">
        <Tally value={counts.paid} label="paid" tone="ok" />
        <Tally value={counts.pending} label="checking" tone="warn" />
        <Tally value={counts.missing} label="not paid" tone="bad" />
      </div>
    </Card>
  );
}

function statusPill(s: Status, kind: "Rent" | "Water", published = true) {
  if (kind === "Water" && !published) return <Pill tone="neutral">— No bill</Pill>;
  if (s === "approved") return <Pill tone="ok"><IconCheck className="h-3.5 w-3.5" />Paid</Pill>;
  if (s === "pending") return <Pill tone="warn">Checking</Pill>;
  if (s === "rejected") return <Pill tone="bad"><IconAlert className="h-3.5 w-3.5" />Rejected</Pill>;
  return <Pill tone="bad"><IconAlert className="h-3.5 w-3.5" />Not paid</Pill>;
}

export function Overview({ data }: { data: DashboardData }) {
  if (data.occupiedCount === 0) {
    return (
      <Card>
        <p className="text-sm">
          No units are marked occupied. Set occupancy on the{" "}
          <Link href="/admin/units" className="font-semibold text-brand underline">
            Units page
          </Link>
          .
        </p>
      </Card>
    );
  }

  // A nudge asks only for what is genuinely outstanding: a pending item has
  // already been sent and is waiting on review, so chasing it would be asking
  // a tenant to pay twice.
  const outstanding = (s: Status) => s === "none" || s === "rejected";

  const rows = data.rows.map((row) => {
    const parts: string[] = [];
    if (outstanding(row.rentStatus)) parts.push(`rent ${money(row.rentAmount)}`);
    if (data.waterPublished && row.waterAmount !== null && outstanding(row.waterStatus)) {
      parts.push(`water ${money(row.waterAmount)}`);
    }
    const nudge =
      parts.length > 0
        ? whatsAppLink(
            row.tenantPhone,
            `Kuzuzangpo${row.tenantName ? " " + row.tenantName : ""}, a reminder for unit ` +
              `${row.unitNumber} for ${data.month}: ${parts.join(" and ")}. Thank you.`,
          )
        : null;
    const settled =
      row.rentStatus === "approved" &&
      (!data.waterPublished || row.waterStatus === "approved");
    return { ...row, nudge, needsChasing: parts.length > 0, settled };
  });

  const unsettled = rows.filter((r) => !r.settled);

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-2 text-sm text-muted">
        <IconCalendar className="h-4 w-4" />
        {data.month} · {data.occupiedCount} occupied
      </p>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <TallyCard
          icon={<IconHome />}
          title="Rent"
          note="Total rent status across all units"
          counts={data.rent}
          href="/admin/review"
        />
        <TallyCard
          icon={<IconDrop />}
          title="Water"
          note={data.waterPublished ? "Bill published" : "Bill not published yet"}
          counts={data.water}
          href="/admin/water"
        />
      </div>

      <Card className="!p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 sm:p-5">
          <h2 className="text-lg font-bold">
            {unsettled.length === 0
              ? "Everyone is up to date"
              : `${unsettled.length} still to settle`}
          </h2>
        </div>

        {/* Desktop: table. Mobile: cards. Same rows, no horizontal scrolling. */}
        <table className="hidden w-full text-sm md:table">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-semibold">#</th>
              <th className="px-3 py-3 font-semibold">Tenant</th>
              <th className="px-3 py-3 font-semibold">Unit</th>
              <th className="px-3 py-3 font-semibold">Rent</th>
              <th className="px-3 py-3 font-semibold">Water</th>
              <th className="px-3 py-3 font-semibold">Arrears</th>
              <th className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.unitNumber} className="border-t border-line align-middle">
                <td className="px-5 py-4 font-semibold tabular-nums text-muted">{i + 1}</td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={row.tenantName || "?"} className="!size-8 !bg-brand-soft !text-brand" />
                    <span className="font-semibold">
                      {row.tenantName || <span className="text-muted">No name</span>}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 font-semibold tabular-nums">{row.unitNumber}</td>
                <td className="px-3 py-4">{statusPill(row.rentStatus, "Rent")}</td>
                <td className="px-3 py-4">{statusPill(row.waterStatus, "Water", data.waterPublished)}</td>
                <td className="px-3 py-4">
                  {row.arrears > 0 ? (
                    <span
                      title="Estimate: past rent is valued at today's rent, which the schema does not version"
                      className="font-semibold tabular-nums text-bad"
                    >
                      ~{money(row.arrears)}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  {row.nudge ? (
                    <a href={row.nudge} target="_blank" rel="noopener noreferrer" className={buttonStyles.primary}>
                      <IconSend className="h-4 w-4" />
                      Nudge
                    </a>
                  ) : row.needsChasing ? (
                    <span className="text-xs text-muted" title="No usable mobile number on file">
                      No number
                    </span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="divide-y divide-line md:hidden">
          {rows.map((row) => (
            <li key={row.unitNumber} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={row.tenantName || "?"} className="!size-9 !bg-brand-soft !text-brand" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {row.tenantName || <span className="text-muted">No name</span>}
                  </p>
                  <p className="text-xs text-muted">Unit {row.unitNumber}</p>
                </div>
                {row.nudge ? (
                  <a href={row.nudge} target="_blank" rel="noopener noreferrer" className={`${buttonStyles.primary} !px-3`}>
                    <IconSend className="h-4 w-4" />
                    Nudge
                  </a>
                ) : row.needsChasing ? (
                  <span className="text-xs text-muted">No number</span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {statusPill(row.rentStatus, "Rent")}
                {statusPill(row.waterStatus, "Water", data.waterPublished)}
                {row.arrears > 0 ? (
                  <Pill tone="bad">owes ~{money(row.arrears)}</Pill>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
