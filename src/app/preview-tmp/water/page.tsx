import { notFound } from "next/navigation";
import { WaterBillForm, type WaterBill } from "../../admin/(protected)/water/WaterBillForm";

/** Layout proofing for the water bill page. See ../page.tsx for why. */
export const dynamic = "force-dynamic";

// Nu. 3,710.55 across 7 units does not divide evenly, so this exercises the
// remainder distribution and the "adds up to" reconciliation line.
const shares = [
  { unitNumber: "1", tenantName: "Pema Wangmo", amount: 530.08 },
  { unitNumber: "2", tenantName: "Sonam Dorji", amount: 530.08 },
  { unitNumber: "3", tenantName: "Karma Lhamo", amount: 530.08 },
  { unitNumber: "4", tenantName: "Tashi Phuntsho", amount: 530.08 },
  { unitNumber: "6", tenantName: "Dechen Zangmo", amount: 530.08 },
  { unitNumber: "8", tenantName: "", amount: 530.08 },
  { unitNumber: "9", tenantName: "Ugyen Tshering", amount: 530.07 },
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
    <div className="mx-auto w-full max-w-3xl p-4">
      <WaterBillForm bill={bill} />
    </div>
  );
}
