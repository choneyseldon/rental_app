import { notFound } from "next/navigation";
import { AdminShell } from "../../admin/(protected)/AdminShell";
import { ReviewQueue, type PendingRow } from "../../admin/(protected)/review/ReviewQueue";
import { RecentlyReviewed, type ReviewedRow } from "../../admin/(protected)/review/RecentlyReviewed";

/** Layout proofing for the review queue. See ../page.tsx for why this exists. */
export const dynamic = "force-dynamic";

const SLIP = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAJYCAYAAADYJts/AAAG+0lEQVR4Ae3BUW0dQAADsDQ6AIVxIIak6IZkOA7DALzfDUck21/fP7/+BWBAAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMw4vz9/ScACxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzDivPcCsKABGNEAjGgARjQAIxqAEQ3AiAZgRAMw4tx7A7CgARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCI894LwIIGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiHPvDcCCBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjznsvAAsagBENwIgGYEQDMKIBGNEAjGgARjQAI869NwALGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiPP5fAKwoAEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAIxqAEQ3AiAZgRAMwogEY0QCMaABGNAAjGoARDcCIBmBEAzCiARjRAIxoAEY0ACMagBENwIgGYEQDMKIBGNEAjGgARjQAI/4DX1gUjy/qQGYAAAAASUVORK5CYII=";

const rows: PendingRow[] = [
  {
    submissionId: "s1",
    unitNumber: "2B",
    tenantName: "Pema Wangmo",
    month: "2026-09",
    type: "rent",
    claimedAmount: 8500,
    expectedAmount: 8500,
    imageUrl: SLIP,
    referenceUrl: null,
    submittedAt: 1,
  },
  {
    submissionId: "s2",
    unitNumber: "4A",
    tenantName: "Sonam Dorji",
    month: "2026-09",
    type: "rent",
    claimedAmount: 8000,
    expectedAmount: 8500,
    imageUrl: SLIP,
    referenceUrl: null,
    submittedAt: 2,
  },
  {
    submissionId: "s3",
    unitNumber: "1B",
    tenantName: "",
    month: "2026-09",
    type: "water",
    claimedAmount: 412,
    expectedAmount: 400,
    imageUrl: SLIP,
    referenceUrl: SLIP,
    submittedAt: 3,
  },
];

const reviewed: ReviewedRow[] = [
  { submissionId: "r1", unitNumber: "3A", tenantName: "Dechen Zangmo", tenantPhone: "17332753",
    month: "2026-09", type: "rent", claimedAmount: 8500, status: "approved", adminNote: null,
    decidedAt: 4, receiptUrl: "https://chimbill.vercel.app/u/tok/receipt/r1" },
  { submissionId: "r2", unitNumber: "6B", tenantName: "Ugyen Tshering", tenantPhone: "17679994",
    month: "2026-09", type: "water", claimedAmount: 315.05, status: "rejected",
    adminNote: "The screenshot shows last month's transfer.", decidedAt: 3, receiptUrl: null },
  { submissionId: "r3", unitNumber: "4B", tenantName: "", tenantPhone: "", month: "2026-09",
    type: "rent", claimedAmount: 8500, status: "approved", adminNote: null, decidedAt: 2,
    receiptUrl: "https://chimbill.vercel.app/u/tok/receipt/r3" },
];

export default function ReviewPreviewPage() {
  if (process.env.ENABLE_PREVIEW !== "1") notFound();
  return (
    <AdminShell pending={2}>
      <div>
      <ReviewQueue rows={rows} />
      <div className="mt-5"><RecentlyReviewed rows={reviewed} /></div>
      </div>
    </AdminShell>
  );
}
