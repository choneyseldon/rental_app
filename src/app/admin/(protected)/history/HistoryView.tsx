import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { Avatar, Card, Pill, money } from "@/components/ui";
import { IconAlert, IconCheck } from "@/components/icons";

export type HistoryData = NonNullable<(typeof api.admin.historyMonth)["_returnType"]>;
type Row = HistoryData["rows"][number];
type Status = "approved" | "pending" | "rejected" | "none";

const monthLong = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
};
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthShort = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return `${SHORT[m - 1]} ${y}`;
};
/** Phone-width label: the year shrinks to two digits so four chips fit a row. */
const monthTiny = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return `${SHORT[m - 1]} \u2019${String(y).slice(2)}`;
};

function StatusBadge({ status }: { status: Status }) {
  if (status === "approved") return <Pill tone="ok"><IconCheck className="h-3.5 w-3.5" />Paid</Pill>;
  if (status === "pending") return <Pill tone="warn">Checking</Pill>;
  if (status === "rejected") return <Pill tone="bad"><IconAlert className="h-3.5 w-3.5" />Rejected</Pill>;
  return <Pill tone="bad"><IconAlert className="h-3.5 w-3.5" />Not paid</Pill>;
}

function Proof({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-block text-xs font-semibold text-brand underline"
    >
      Screenshot
    </a>
  );
}

/** One side of a flat's month: rent or water, with what was paid and its proof. */
function Cell({
  status, amount, note, proofUrl, owed,
}: {
  status: Status;
  amount: number | null;
  note: string | null;
  proofUrl: string | null;
  /** Water only: the frozen share this flat owed. */
  owed?: number | null;
}) {
  return (
    <div className="min-w-0">
      {owed !== undefined && owed !== null ? (
        <p className="text-xs text-muted">Share {money(owed)}</p>
      ) : null}
      <div className="mt-0.5 flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {amount !== null ? (
          <span className="font-semibold tabular-nums">{money(amount)}</span>
        ) : null}
      </div>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
      <Proof url={proofUrl} />
    </div>
  );
}

function OwnerNote({ label }: { label: string }) {
  return <p className="text-sm text-muted">{label}</p>;
}

function WaterCell({ row, published }: { row: Row; published: boolean }) {
  if (row.isOwner) {
    return row.water.share !== null ? (
      <OwnerNote label={`Share ${money(row.water.share)} · owners' flat`} />
    ) : (
      <OwnerNote label="—" />
    );
  }
  if (!published && row.water.share === null && row.water.status === "none") {
    return <Pill tone="neutral">— No bill</Pill>;
  }
  return (
    <Cell
      status={row.water.status}
      amount={row.water.amount}
      note={row.water.note}
      proofUrl={row.water.proofUrl}
      owed={row.water.share}
    />
  );
}

function RentCell({ row }: { row: Row }) {
  if (!row.rent) return <OwnerNote label="Owners' flat" />;
  return (
    <Cell
      status={row.rent.status}
      amount={row.rent.amount}
      note={row.rent.note}
      proofUrl={row.rent.proofUrl}
    />
  );
}

function Tile({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 whitespace-nowrap text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted">{meta}</p>
    </div>
  );
}

/**
 * The picker is links, not state: each month is its own URL, so it works
 * without script, survives a reload and can be shared or bookmarked.
 */
export function MonthPicker({ months, selected }: { months: string[]; selected: string }) {
  return (
    <nav aria-label="Month" className="mb-5 grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
      {months.map((m) => (
        <Link
          key={m}
          href={`/admin/history?month=${m}`}
          aria-current={m === selected ? "page" : undefined}
          className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-2 text-sm font-semibold transition-colors sm:px-3.5 ${
            m === selected
              ? "border-brand bg-brand text-white"
              : "border-line bg-white text-slate-600 hover:bg-brand-tint"
          }`}
        >
          <span className="sm:hidden">{monthTiny(m)}</span>
          <span className="hidden sm:inline">{monthShort(m)}</span>
        </Link>
      ))}
    </nav>
  );
}

export function HistoryView({ data }: { data: HistoryData }) {
  const s = data.summary;

  if (!data.hasRecord) {
    return (
      <Card>
        <h2 className="text-lg font-bold">Nothing recorded for {monthLong(data.month)}</h2>
        <p className="mt-1 text-muted">
          No water bill was saved and no payment was sent that month.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile
          label="Rent collected"
          value={money(s.rentCollected)}
          meta={`${s.rentPaid} of ${s.rentFlats} flats paid`}
        />
        <Tile
          label="Water bill"
          value={s.waterTotal !== null ? money(s.waterTotal) : "—"}
          meta={s.waterPublished ? "Published to tenants" : "Not published"}
        />
        <Tile
          label="Water collected"
          value={money(s.waterCollected)}
          meta={s.waterFlats > 0 ? `${s.waterPaid} of ${s.waterFlats} flats paid` : "No shares"}
        />
        <div className="card flex flex-col justify-between p-4 sm:p-5">
          <p className="text-sm text-muted">Thromde bill</p>
          {s.waterBillUrl ? (
            <a
              href={s.waterBillUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex min-h-11 items-center text-base font-semibold text-brand underline"
            >
              View the photo
            </a>
          ) : (
            <p className="mt-1 text-base text-muted">No photo saved</p>
          )}
        </div>
      </div>

      <Card className="!p-0">
        <div className="px-4 py-4 sm:px-5">
          <h2 className="text-lg font-bold">{monthLong(data.month)}</h2>
          <p className="text-sm text-muted">What each flat paid, and the screenshot behind it.</p>
        </div>

        {/* Desktop: table. Mobile: cards. Same rows, no horizontal scrolling. */}
        <table className="hidden w-full text-sm md:table">
          <thead>
            <tr className="border-y border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-semibold">Flat</th>
              <th className="px-3 py-3 font-semibold">Rent</th>
              <th className="px-5 py-3 font-semibold">Water</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.unitNumber} className="border-b border-line align-top last:border-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={row.tenantName || `#${row.unitNumber}`}
                      className="!size-8 !bg-brand-soft !text-brand"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold">Unit {row.unitNumber}</p>
                      <p className="truncate text-xs text-muted">
                        {row.isOwner ? "Owners" : row.tenantName || "No name recorded"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4"><RentCell row={row} /></td>
                <td className="px-5 py-4"><WaterCell row={row} published={s.waterPublished} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="divide-y divide-line border-t border-line md:hidden">
          {data.rows.map((row) => (
            <li key={row.unitNumber} className="px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <Avatar
                  name={row.tenantName || `#${row.unitNumber}`}
                  className="!size-9 !bg-brand-soft !text-brand"
                />
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">Unit {row.unitNumber}</p>
                  <p className="truncate text-sm text-muted">
                    {row.isOwner ? "Owners" : row.tenantName || "No name recorded"}
                  </p>
                </div>
              </div>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Rent</dt>
                  <dd className="mt-1"><RentCell row={row} /></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Water</dt>
                  <dd className="mt-1"><WaterCell row={row} published={s.waterPublished} /></dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
