import { api } from "../../../../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import { ReviewQueue, type PendingRow } from "./ReviewQueue";
import { RecentlyReviewed, type ReviewedRow } from "./RecentlyReviewed";

/** The query's own row, which still carries the path rather than a full URL. */
type ReviewedQueryRow =
  (typeof api.admin.listRecentlyReviewed)["_returnType"][number];

export const metadata = { title: "Review payments" };

/**
 * A receipt link is only worth sending a tenant if it resolves from their
 * phone. Without a real production origin there is nothing to send, so the
 * message goes out without one rather than carrying a localhost address.
 */
function productionOrigin(): string | null {
  const raw = process.env.APP_BASE_URL?.trim();
  if (!raw || !raw.startsWith("https://")) return null;
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\.local(?::|$)/i.test(raw)) return null;
  return raw.replace(/\/+$/, "");
}

export default async function ReviewPage() {
  const { client, secret } = adminClient();

  let rows: PendingRow[];
  let reviewed: ReviewedQueryRow[];
  try {
    [rows, reviewed] = await Promise.all([
      client.query(api.admin.listPending, { secret }),
      client
        .query(api.admin.listRecentlyReviewed, { secret })
        // The queue is the page; the notify list is a convenience beside it,
        // and it must not take the page down with it.
        .catch((): ReviewedQueryRow[] => []),
    ]);
  } catch {
    return (
      <p role="alert" className="card border-bad/30 bg-bad-soft p-4 text-sm text-[#991b1b]">
        Could not load the queue. Check that <code>npx convex dev</code> is
        running and <code>ADMIN_API_SECRET</code> matches on both sides.
      </p>
    );
  }

  // The door token reaches the browser only inside this one link, which is
  // the link the tenant is sent. Nothing hands the bare token to a component.
  const origin = productionOrigin();
  const reviewedRows: ReviewedRow[] = reviewed.map((r) => ({
    submissionId: r.submissionId,
    unitNumber: r.unitNumber,
    tenantName: r.tenantName,
    tenantPhone: r.tenantPhone,
    month: r.month,
    type: r.type,
    claimedAmount: r.claimedAmount,
    status: r.status,
    adminNote: r.adminNote,
    decidedAt: r.decidedAt,
    receiptUrl: origin && r.receiptPath ? `${origin}${r.receiptPath}` : null,
  }));

  return (
    <div className="space-y-5">
      {rows.length === 0 ? (
        <p className="card border-ok/30 bg-ok-soft p-4 text-base text-[#166534]">
          Nothing waiting. Every screenshot has been reviewed.
        </p>
      ) : (
        <ReviewQueue rows={rows} />
      )}
      <RecentlyReviewed rows={reviewedRows} />
    </div>
  );
}
