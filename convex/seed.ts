import { nanoid } from "nanoid";
import { internalMutation } from "./_generated/server";
import { OWNER_UNIT, UNIT_NUMBERS } from "./property";

/**
 * Creates the property's units with random tokens.
 *
 * Run once with `npx convex run seed:seedUnits`. Idempotent: it tops up to
 * UNIT_NUMBERS rather than duplicating, so re-running after a partial failure
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
    for (const unitNumber of UNIT_NUMBERS) {
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

    // The owner's flat: occupied from the start, so it is in the water split
    // the first time a bill is published.
    if (!have.has(OWNER_UNIT)) {
      await ctx.db.insert("units", {
        unitNumber: OWNER_UNIT,
        token: nanoid(21),
        tenantName: "Owner",
        tenantPhone: "",
        rentAmount: 0,
        bpcConsumerNumber: "",
        isOccupied: true,
        isOwner: true,
      });
      created.push(OWNER_UNIT);
    }

    return {
      created: created.length,
      skipped: existing.length,
      units: created,
    };
  },
});
