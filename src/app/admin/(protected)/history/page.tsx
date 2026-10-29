import { api } from "../../../../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import { HistoryView, MonthPicker, type HistoryData } from "./HistoryView";

export const metadata = { title: "History" };

export default async function HistoryPage({ searchParams }: PageProps<"/admin/history">) {
  const { month: requested } = await searchParams;
  const { client, secret } = adminClient();

  let months: string[];
  let data: HistoryData | null;
  let selected: string;
  try {
    months = await client.query(api.admin.historyMonths, { secret });
    // Anything not in the list — a typo, an old bookmark, a month past the
    // window — falls back to the latest month rather than an error page.
    selected =
      typeof requested === "string" && months.includes(requested) ? requested : months[0];
    data = await client.query(api.admin.historyMonth, { secret, month: selected });
  } catch {
    return (
      <p role="alert" className="card border-bad/30 bg-bad-soft p-4 text-sm text-[#991b1b]">
        Could not load the history. Check that <code>npx convex dev</code> is running and
        that the latest functions have been deployed with <code>npx convex deploy</code>.
      </p>
    );
  }

  return (
    <div>
      <MonthPicker months={months} selected={selected} />
      {data ? <HistoryView data={data} /> : null}
    </div>
  );
}
