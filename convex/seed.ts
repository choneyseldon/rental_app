import { nanoid } from "nanoid";
import { internalMutation } from "./_generated/server";

const UNIT_COUNT = 10;

/**
 * Creates the 10 units with random tokens.
 *
 * Run once with `npx convex run seed:seedUnits`. Idempotent: it tops up to
 * UNIT_COUNT rather than duplicating, so re-running after a partial failure
 * is safe and will never issue a second token for a unit that has one.
 *
 * Tenant details are placeholders — Phase 2's admin UI is where the real
 * names, rents and BPC numbers get entered.
 */
export const seedUnits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("units").collect();
    const have = new Set(existing.map((u) => u.unitNumber));

    const created: string[] = [];
    for (let i = 1; i <= UNIT_COUNT; i++) {
      const unitNumber = `${i}`;
      if (have.has(unitNumber)) continue;

      await ctx.db.insert("units", {
        unitNumber,
        token: nanoid(21),
        tenantName: "",
        tenantPhone: "",
        rentAmount: 0,
        bpcConsumerNumber: "",
        isOccupied: false,
      });
      created.push(unitNumber);
    }

    return {
      created: created.length,
      skipped: existing.length,
      units: created,
    };
  },
});
