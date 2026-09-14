import { notFound } from "next/navigation";
import { AdminShell } from "../../admin/(protected)/AdminShell";
import { WaterBillForm, type WaterBill } from "../../admin/(protected)/water/WaterBillForm";

/** Layout proofing for the water bill page. See ../page.tsx for why. */
export const dynamic = "force-dynamic";

// Nu. 3,710.55 across 7 units does not divide evenly, so this exercises the
// remainder distribution and the "adds up to" reconciliation line.
const shares = [
  { unitNumber: "1A", tenantName: "Pema Wangmo", amount: 530.08 },
  { unitNumber: "1B", tenantName: "Sonam Dorji", amount: 530.08 },
  { unitNumber: "2A", tenantName: "Karma Lhamo", amount: 530.08 },
  { unitNumber: "2B", tenantName: "Tashi Phuntsho", amount: 530.08 },
  { unitNumber: "3A", tenantName: "Dechen Zangmo", amount: 530.08 },
  { unitNumber: "4B", tenantName: "", amount: 530.08 },
  { unitNumber: "6B", tenantName: "Ugyen Tshering", amount: 530.07 },
];

const bill: WaterBill = {
  month: "2026-09",
  total: 3710.55,
  billImageUrl: "https://example.invalid/thromde.jpg",
  published: false,
  occupiedCount: 7,
  shares,
};

export default function WaterPreviewPage() {
  if (process.env.ENABLE_PREVIEW !== "1") notFound();
  return (
    <AdminShell pending={2}>
      <div>
      <WaterBillForm bill={bill} />
      </div>
    </AdminShell>
  );
}
