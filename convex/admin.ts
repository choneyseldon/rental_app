import { v } from "convex/values";
import { nanoid } from "nanoid";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";

/**
 * Convex functions are public HTTP endpoints, and the units table holds the
 * tokens that act as tenant credentials. So every admin function here takes a
 * shared secret and refuses to run without it. The secret lives in the Convex
 * deployment's environment (ADMIN_API_SECRET) and is only ever sent from our
 * own server, never from a browser.
 */
function assertAdmin(ctx: QueryCtx | MutationCtx, secret: string) {
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected) {
    throw new Error(
      "ADMIN_API_SECRET is not set on the Convex deployment. Set it with " +
        "`npx convex env set ADMIN_API_SECRET <value>`.",
    );
  }
  if (secret.length !== expected.length || secret !== expected) {
    throw new Error("Unauthorized");
  }
}

const secretArg = { secret: v.string() };

/** Every unit, ordered by unit number, for the admin list. */
export const listUnits = query({
  args: secretArg,
  handler: async (ctx, { secret }) => {
    assertAdmin(ctx, secret);
    const units = await ctx.db.query("units").collect();
    return units.sort(
      (a, b) => Number(a.unitNumber) - Number(b.unitNumber),
    );
  },
});

/** Updates the editable details of one unit. Never touches the token. */
export const updateUnit = mutation({
  args: {
    ...secretArg,
    unitId: v.id("units"),
    tenantName: v.string(),
    tenantPhone: v.string(),
    rentAmount: v.number(),
    bpcConsumerNumber: v.string(),
    isOccupied: v.boolean(),
  },
  handler: async (ctx, { secret, unitId, ...fields }) => {
    assertAdmin(ctx, secret);
    if (!Number.isFinite(fields.rentAmount) || fields.rentAmount < 0) {
      throw new Error("Rent must be zero or more.");
    }
    await ctx.db.patch(unitId, fields);
  },
});

/**
 * Issues a fresh token, which immediately invalidates the QR mounted at that
 * door. Used when a tenant moves out.
 */
export const rotateToken = mutation({
  args: { ...secretArg, unitId: v.id("units") },
  handler: async (ctx, { secret, unitId }) => {
    assertAdmin(ctx, secret);
    const token = nanoid(21);
    await ctx.db.patch(unitId, { token });
    return { token };
  },
});

/** Count for the nav badge. Cheap enough to run on every admin page. */
export const pendingCount = query({
  args: secretArg,
  handler: async (ctx, { secret }) => {
    assertAdmin(ctx, secret);
    const pending = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});

/**
 * The review queue: every pending screenshot with the context needed to judge
 * it, so the admin page needs no follow-up lookups. Oldest first, because a
 * tenant who submitted first has been waiting longest.
 */
export const listPending = query({
  args: secretArg,
  handler: async (ctx, { secret }) => {
    assertAdmin(ctx, secret);

    const pending = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const rows = await Promise.all(
      pending.map(async (s) => {
        const unit = await ctx.db.get(s.unitId);
        const period = await ctx.db.get(s.periodId);
        return {
          submissionId: s._id,
          unitNumber: unit?.unitNumber ?? "?",
          tenantName: unit?.tenantName ?? "",
          month: period?.month ?? "",
          type: s.type,
          claimedAmount: s.claimedAmount,
          expectedAmount:
            s.type === "rent" ? (unit?.rentAmount ?? null) : null,
          imageUrl: await ctx.storage.getUrl(s.image),
          submittedAt: s._creationTime,
        };
      }),
    );

    return rows.sort((a, b) => a.submittedAt - b.submittedAt);
  },
});

/**
 * Approves or rejects one screenshot.
 *
 * Refuses a submission that has already been decided, so two taps on a slow
 * connection cannot silently overwrite the first decision. A rejection must
 * carry a note: the tenant sees the outcome and needs to know what to fix.
 */
export const reviewSubmission = mutation({
  args: {
    ...secretArg,
    submissionId: v.id("submissions"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, { secret, submissionId, decision, adminNote }) => {
    assertAdmin(ctx, secret);

    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new Error("That submission no longer exists.");
    if (submission.status !== "pending") {
      throw new Error(
        `Already ${submission.status}. Reload the queue to see the current state.`,
      );
    }

    const note = adminNote?.trim();
    if (decision === "rejected" && !note) {
      throw new Error("Say why it was rejected, so the tenant can fix it.");
    }

    await ctx.db.patch(submissionId, {
      status: decision,
      ...(note ? { adminNote: note } : {}),
    });
  },
});
