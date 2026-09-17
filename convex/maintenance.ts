import { internalMutation } from "./_generated/server";

/**
 * Clearing test data before the property goes live.
 *
 * Neither of these touches the `units` table, so tenant names, rents, BPC
 * numbers and — most importantly — the door tokens survive. A token that
 * changed would invalidate the QR already mounted on that door.
 *
 * They are internalMutations, so they are reachable from `npx convex run` and
 * from nowhere on the public internet.
 */

/**
 * Deletes every payment screenshot: the rows in `submissions` and the image
 * files behind them.
 *
 * The files matter. Deleting only the rows, as the dashboard's "Clear table"
 * does, leaves the images in storage — still billable, and still fetchable by
 * anyone holding a URL that was handed out while they were on screen.
 *
 *     npx convex run maintenance:clearSubmissions --prod
 */
export const clearSubmissions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("submissions").collect();

    for (const row of rows) {
      // Storage first: if this throws, the row is still there to try again
      // from. The other order would lose the only pointer to the file.
      await ctx.storage.delete(row.image);
      await ctx.db.delete(row._id);
    }

    return { submissionsDeleted: rows.length };
  },
});

/**
 * Everything clearSubmissions does, plus the months themselves: the water
 * totals, the Thromde bill photos and the published per-unit shares.
 *
 * Use this one to start the property's billing history from scratch. Tenants
 * will see an empty payment record and no water bill until a new one is
 * published.
 *
 *     npx convex run maintenance:resetBilling --prod
 */
export const resetBilling = internalMutation({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();
    for (const row of submissions) {
      await ctx.storage.delete(row.image);
      await ctx.db.delete(row._id);
    }

    const shares = await ctx.db.query("waterShares").collect();
    for (const row of shares) await ctx.db.delete(row._id);

    const periods = await ctx.db.query("periods").collect();
    for (const row of periods) {
      if (row.waterBillImage) await ctx.storage.delete(row.waterBillImage);
      await ctx.db.delete(row._id);
    }

    return {
      submissionsDeleted: submissions.length,
      sharesDeleted: shares.length,
      periodsDeleted: periods.length,
    };
  },
});
