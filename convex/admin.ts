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
