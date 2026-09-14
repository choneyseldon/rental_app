import { api } from "../../../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import { Overview, type DashboardData } from "./Overview";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const { client, secret } = adminClient();

  let data: DashboardData;
  try {
    data = await client.query(api.admin.dashboard, { secret });
  } catch {
    return (
      <p role="alert" className="card border-bad/30 bg-bad-soft p-4 text-sm text-[#991b1b]">
        Could not load the overview. Check that <code>npx convex dev</code> is
        running and <code>ADMIN_API_SECRET</code> matches on both sides.
      </p>
    );
  }

  return <Overview data={data} />;
}
