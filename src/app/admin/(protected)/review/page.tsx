import { api } from "../../../../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import { ReviewQueue, type PendingRow } from "./ReviewQueue";

export const metadata = { title: "Review payments" };

export default async function ReviewPage() {
  const { client, secret } = adminClient();

  let rows: PendingRow[];
  try {
    rows = await client.query(api.admin.listPending, { secret });
  } catch {
    return (
      <p role="alert" className="card border-bad/30 bg-bad-soft p-4 text-sm text-[#991b1b]">
        Could not load the queue. Check that <code>npx convex dev</code> is
        running and <code>ADMIN_API_SECRET</code> matches on both sides.
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="card border-ok/30 bg-ok-soft p-4 text-base text-[#166534]">
        Nothing waiting. Every screenshot has been reviewed.
      </p>
    );
  }

  return <ReviewQueue rows={rows} />;
}
