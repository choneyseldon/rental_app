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
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
        Could not load the queue. Check that <code>npx convex dev</code> is
        running and <code>ADMIN_API_SECRET</code> matches on both sides.
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-lg bg-green-50 p-4 text-base text-green-900">
        Nothing waiting. Every screenshot has been reviewed.
      </p>
    );
  }

  return <ReviewQueue rows={rows} />;
}
