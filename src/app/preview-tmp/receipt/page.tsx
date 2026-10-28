import { notFound } from "next/navigation";
import { AppShell, type NavItem } from "@/components/AppShell";
import { IconHome } from "@/components/icons";
import { ReceiptCard, type ReceiptData } from "../../u/[token]/receipt/[id]/ReceiptView";

/** Layout proofing for the receipt. See ../page.tsx for why this exists. */
export const dynamic = "force-dynamic";

const fixture: ReceiptData = {
  receiptNo: "CB-202609-2B-R",
  unitNumber: "2B",
  tenantName: "Pema Wangmo",
  month: "2026-09",
  type: "rent",
  amount: 8500,
  paidOn: Date.UTC(2026, 8, 3, 4, 12),
  approvedOn: Date.UTC(2026, 8, 3, 9, 40),
  hasApprovalDate: true,
};

const nav: NavItem[] = [{ href: "/preview-tmp/receipt", label: "Home", icon: <IconHome /> }];

export default function ReceiptPreviewPage() {
  if (process.env.ENABLE_PREVIEW !== "1") notFound();
  return (
    <AppShell
      nav={nav}
      user={fixture.tenantName}
      greeting="Receipt"
      subtitle="Proof of a payment the owner has accepted."
    >
      <ReceiptCard data={fixture} />
    </AppShell>
  );
}
