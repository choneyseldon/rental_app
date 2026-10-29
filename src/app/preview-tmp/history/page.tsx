import { notFound } from "next/navigation";
import { AdminShell } from "../../admin/(protected)/AdminShell";
import {
  HistoryView, MonthPicker, type HistoryData,
} from "../../admin/(protected)/history/HistoryView";

/** Layout proofing for the History page. See ../page.tsx for why this exists. */
export const dynamic = "force-dynamic";

const months = ["2026-10", "2026-09", "2026-08", "2026-07", "2026-06", "2026-05", "2026-04",
  "2026-03", "2026-02", "2026-01", "2025-12", "2025-11"];

const proof = "https://example.invalid/shot.png";

const data: HistoryData = {
  month: "2026-09",
  hasRecord: true,
  rows: [
    { unitNumber: "1A", tenantName: "Pema Wangmo", isOwner: false,
      rent: { status: "approved", amount: 8500, note: null, proofUrl: proof },
      water: { share: 315.05, status: "approved", amount: 315.05, note: null, proofUrl: proof } },
    { unitNumber: "1B", tenantName: "Sonam Dorji", isOwner: false,
      rent: { status: "rejected", amount: 7000, note: "Screenshot was for August, not September.", proofUrl: proof },
      water: { share: 315.05, status: "none", amount: null, note: null, proofUrl: null } },
    { unitNumber: "2A", tenantName: "Karma Lhamo With A Rather Long Name Indeed", isOwner: false,
      rent: { status: "pending", amount: 8500, note: null, proofUrl: proof },
      water: { share: 315.05, status: "pending", amount: 315.05, note: null, proofUrl: proof } },
    { unitNumber: "2B", tenantName: "", isOwner: false,
      rent: { status: "none", amount: null, note: null, proofUrl: null },
      water: { share: 315.05, status: "none", amount: null, note: null, proofUrl: null } },
    { unitNumber: "5", tenantName: "Owner", isOwner: true, rent: null,
      water: { share: 315.04, status: "none", amount: null, note: null, proofUrl: null } },
  ],
  summary: {
    rentFlats: 4, rentPaid: 1, rentCollected: 8500,
    waterPublished: true, waterTotal: 1575.24, waterFlats: 4, waterPaid: 1, waterCollected: 315.05,
    waterBillUrl: proof,
  },
};

export default function HistoryPreviewPage() {
  if (process.env.ENABLE_PREVIEW !== "1") notFound();
  return (
    <AdminShell pending={2}>
      <div>
        <MonthPicker months={months} selected="2026-09" />
        <HistoryView data={data} />
      </div>
    </AdminShell>
  );
}
