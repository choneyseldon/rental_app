import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Bhutan is UTC+06:00 with no daylight saving. Deriving the month in UTC
 * would roll the billing period over at 6am local time, so a tenant checking
 * their rent early in the morning on the 1st would see the wrong month.
 */
const BHUTAN_OFFSET_MS = 6 * 60 * 60 * 1000;

export function currentMonthKey(now = Date.now()): string {
  const local = new Date(now + BHUTAN_OFFSET_MS);
  const month = String(local.getUTCMonth() + 1).padStart(2, "0");
  return `${local.getUTCFullYear()}-${month}`;
}

type Status = "approved" | "pending" | "rejected" | "none";

/** An approved submission wins; otherwise pending, then rejected. */
function deriveStatus(submissions: Doc<"submissions">[]): Status {
  if (submissions.some((s) => s.status === "approved")) return "approved";
  if (submissions.some((s) => s.status === "pending")) return "pending";
  if (submissions.some((s) => s.status === "rejected")) return "rejected";
  return "none";
}

async function submissionsForPeriod(
  ctx: QueryCtx,
  unitId: Id<"units">,
  periodId: Id<"periods">,
) {
  return ctx.db
    .query("submissions")
    .withIndex("by_unit_and_period", (q) =>
      q.eq("unitId", unitId).eq("periodId", periodId),
    )
    .collect();
}

/**
 * The only query the tenant page needs, and the only credential it takes.
 *
 * The token arrives from the URL in the printed QR; the unit is resolved here,
 * server-side, via the by_token index. Nothing that identifies the unit as a
 * database row is returned, so the browser has no id it could send back.
 */
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const unit = await ctx.db
      .query("units")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!unit) return null;

    const month = currentMonthKey();
    const period = await ctx.db
      .query("periods")
      .withIndex("by_month", (q) => q.eq("month", month))
      .unique();

    let rentStatus: Status = "none";
    let water: {
      published: boolean;
      amount: number | null;
      billImageUrl: string | null;
      status: Status;
    } = { published: false, amount: null, billImageUrl: null, status: "none" };

    if (period) {
      const submissions = await submissionsForPeriod(ctx, unit._id, period._id);
      rentStatus = deriveStatus(submissions.filter((s) => s.type === "rent"));

      if (period.isPublished) {
        const share = await ctx.db
          .query("waterShares")
          .withIndex("by_unit_and_period", (q) =>
            q.eq("unitId", unit._id).eq("periodId", period._id),
          )
          .unique();

        water = {
          published: true,
          amount: share?.amount ?? null,
          billImageUrl: period.waterBillImage
            ? await ctx.storage.getUrl(period.waterBillImage)
            : null,
          status: deriveStatus(submissions.filter((s) => s.type === "water")),
        };
      }
    }

    // Everything this unit has ever submitted, newest first, with the month
    // resolved so the page needs no second lookup.
    const all = await ctx.db
      .query("submissions")
      .withIndex("by_unit_and_period", (q) => q.eq("unitId", unit._id))
      .collect();

    const months = new Map<string, string>();
    const history = [];
    for (const s of all) {
      let m = months.get(s.periodId);
      if (m === undefined) {
        m = (await ctx.db.get(s.periodId))?.month ?? "";
        months.set(s.periodId, m);
      }
      history.push({
        month: m,
        type: s.type,
        claimedAmount: s.claimedAmount,
        status: s.status,
        adminNote: s.adminNote ?? null,
        submittedAt: s._creationTime,
      });
    }
    history.sort((a, b) => b.submittedAt - a.submittedAt);

    return {
      unitNumber: unit.unitNumber,
      tenantName: unit.tenantName,
      bpcConsumerNumber: unit.bpcConsumerNumber,
      month,
      rent: { amount: unit.rentAmount, status: rentStatus },
      water,
      history,
    };
  },
});
