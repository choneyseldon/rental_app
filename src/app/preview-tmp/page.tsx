import { notFound } from "next/navigation";
import { TenantCards, type TenantData } from "../u/[token]/TenantView";

/**
 * Layout proofing for the tenant page without a Convex deployment. The fixture
 * is typed as the query's own return type, so it cannot drift from the real
 * contract. Not reachable in production.
 */
const fixture: TenantData = {
  unitNumber: "4",
  tenantName: "Pema Wangmo",
  bpcConsumerNumber: "1043872210",
  month: "2026-09",
  rent: { amount: 8500, status: "none" },
  water: {
    published: true,
    amount: 412,
    billImageUrl: "https://example.invalid/bill.jpg",
    status: "pending",
  },
  history: [
    { month: "2026-08", type: "rent", claimedAmount: 8500, status: "approved", adminNote: null, submittedAt: 1 },
    { month: "2026-08", type: "water", claimedAmount: 390, status: "approved", adminNote: null, submittedAt: 2 },
    { month: "2026-07", type: "rent", claimedAmount: 8000, status: "rejected", adminNote: "Screenshot was for July, not August.", submittedAt: 3 },
  ],
};

export default function PreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TenantCards data={fixture} />;
}
