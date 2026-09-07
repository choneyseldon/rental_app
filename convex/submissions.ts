import { v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { currentMonthKey } from "./tenant";

const submissionType = v.union(v.literal("rent"), v.literal("water"));

/** Resolves the unit from the token. Rule 2: the client never sends an id. */
async function unitFromToken(
  ctx: MutationCtx,
  token: string,
): Promise<Doc<"units">> {
  const unit = await ctx.db
    .query("units")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
  if (!unit) throw new Error("Unknown code. Ask the owner for a new one.");
  return unit;
}

/**
 * The month's row, created unpublished if it does not exist yet.
 *
 * Rent does not wait for a water bill, so the first rent submission of a month
 * may well be the thing that brings the period into existence. Publishing
 * stays the admin's move.
 */
async function ensurePeriod(
  ctx: MutationCtx,
  month: string,
): Promise<Id<"periods">> {
  const existing = await ctx.db
    .query("periods")
    .withIndex("by_month", (q) => q.eq("month", month))
    .unique();
  if (existing) return existing._id;
  return ctx.db.insert("periods", { month, isPublished: false });
}

/**
 * Refuses a submission that would duplicate work for the admin. Rejected
 * submissions are deliberately not blocking: a tenant told "not accepted"
 * has to be able to send a corrected screenshot.
 */
async function assertNotAlreadySubmitted(
  ctx: MutationCtx,
  unitId: Id<"units">,
  periodId: Id<"periods">,
  type: "rent" | "water",
) {
  const existing = await ctx.db
    .query("submissions")
    .withIndex("by_unit_and_period", (q) =>
      q.eq("unitId", unitId).eq("periodId", periodId),
    )
    .collect();

  const mine = existing.filter((s) => s.type === type);
  if (mine.some((s) => s.status === "approved")) {
    throw new Error(`Your ${type} for this month is already recorded as paid.`);
  }
  if (mine.some((s) => s.status === "pending")) {
    throw new Error(
      `You have already sent a ${type} screenshot for this month. ` +
        `It is still being checked.`,
    );
  }
}

/**
 * Short-lived upload URL for one screenshot.
 *
 * Gated on the token: without that check this would be an open endpoint for
 * writing arbitrary files into the property's storage. The duplicate check
 * runs here too, so a tenant is told no before spending their data on an
 * upload that would be refused anyway.
 */
export const generateUploadUrl = mutation({
  args: { token: v.string(), type: submissionType },
  handler: async (ctx, { token, type }) => {
    const unit = await unitFromToken(ctx, token);
    const periodId = await ensurePeriod(ctx, currentMonthKey());
    await assertNotAlreadySubmitted(ctx, unit._id, periodId, type);
    return ctx.storage.generateUploadUrl();
  },
});

/** Records an uploaded screenshot as pending review. */
export const recordSubmission = mutation({
  args: {
    token: v.string(),
    type: submissionType,
    image: v.id("_storage"),
    claimedAmount: v.number(),
  },
  handler: async (ctx, { token, type, image, claimedAmount }) => {
    const unit = await unitFromToken(ctx, token);

    if (!Number.isFinite(claimedAmount) || claimedAmount <= 0) {
      throw new Error("Enter the amount you paid.");
    }

    const periodId = await ensurePeriod(ctx, currentMonthKey());
    // Re-checked here as well as in generateUploadUrl: that check was a
    // courtesy to save an upload, this one is the one that must hold.
    await assertNotAlreadySubmitted(ctx, unit._id, periodId, type);

    await ctx.db.insert("submissions", {
      unitId: unit._id,
      periodId,
      type,
      image,
      claimedAmount,
      status: "pending",
    });

    return { ok: true as const };
  },
});
