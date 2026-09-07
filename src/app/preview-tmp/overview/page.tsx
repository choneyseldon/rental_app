import { notFound } from "next/navigation";
import { Overview, type DashboardData } from "../../admin/(protected)/Overview";

/** Layout proofing for the overview. See ../page.tsx for why. */
export const dynamic = "force-dynamic";

const data: DashboardData = {
  month: "2026-09",
  waterPublished: true,
  occupiedCount: 6,
  rent: { paid: 2, pending: 1, missing: 3 },
  water: { paid: 1, pending: 1, missing: 4 },
  rows: [
    { unitNumber: "1", tenantName: "Pema Wangmo", tenantPhone: "17123456", rentAmount: 8500, rentStatus: "approved", waterAmount: 530, waterStatus: "approved", arrears: 0 },
    { unitNumber: "2", tenantName: "Sonam Dorji", tenantPhone: "+975 77123456", rentAmount: 8500, rentStatus: "pending", waterAmount: 530, waterStatus: "none", arrears: 0 },
    { unitNumber: "3", tenantName: "Karma Lhamo", tenantPhone: "02-322222", rentAmount: 9000, rentStatus: "none", waterAmount: 530, waterStatus: "none", arrears: 17500 },
    { unitNumber: "4", tenantName: "Tashi Phuntsho", tenantPhone: "", rentAmount: 8000, rentStatus: "rejected", waterAmount: 530, waterStatus: "none", arrears: 8000 },
    { unitNumber: "6", tenantName: "", tenantPhone: "17998877", rentAmount: 7500, rentStatus: "none", waterAmount: 530, waterStatus: "pending", arrears: 0 },
    { unitNumber: "9", tenantName: "Ugyen Tshering", tenantPhone: "17555000", rentAmount: 8500, rentStatus: "approved", waterAmount: 530, waterStatus: "none", arrears: 0 },
  ],
};

export default function OverviewPreviewPage() {
  if (process.env.ENABLE_PREVIEW !== "1") notFound();
  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <Overview data={data} />
    </div>
  );
}
