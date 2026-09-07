import { v } from "convex/values";
import { nanoid } from "nanoid";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { currentMonthKey, deriveStatus } from "./tenant";

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

/**
 * Splits a total into `n` shares that sum back to exactly the total.
 *
 * Done in chhertum as integers: dividing Ngultrum as floats leaves shares that
 * do not add up to the bill, which is the kind of discrepancy an owner
 * reconciling against the Thromde bill will notice. The remainder is handed
 * out one chhertum at a time, so shares differ by at most Ch. 1.
 */
export function splitEvenly(total: number, n: number): number[] {
  if (n <= 0) return [];
  const chhertum = Math.round(total * 100);
  const base = Math.floor(chhertum / n);
  const remainder = chhertum - base * n;
  return Array.from(
    { length: n },
    (_, i) => (base + (i < remainder ? 1 : 0)) / 100,
  );
}

/** Upload URL for the photo of the paper Thromde bill. */
export const generateBillUploadUrl = mutation({
  args: secretArg,
  handler: async (ctx, { secret }) => {
    assertAdmin(ctx, secret);
    return ctx.storage.generateUploadUrl();
  },
});

/**
 * The water bill for one month, plus who the split would fall on.
 *
 * Returns the prospective split for unpublished months so the admin sees who
 * is about to be charged before committing — the last chance to catch a wrong
 * occupancy flag. For published months it returns the stored shares, which are
 * the record and are not recomputed on read.
 */
export const getWaterBill = query({
  args: { ...secretArg, month: v.optional(v.string()) },
  handler: async (ctx, { secret, month: requested }) => {
    assertAdmin(ctx, secret);
    const month = requested ?? currentMonthKey();

    const period = await ctx.db
      .query("periods")
      .withIndex("by_month", (q) => q.eq("month", month))
      .unique();

    const units = await ctx.db.query("units").collect();
    const occupied = units
      .filter((u) => u.isOccupied)
      .sort((a, b) => Number(a.unitNumber) - Number(b.unitNumber));

    const published = period?.isPublished === true;

    let shares: { unitNumber: string; tenantName: string; amount: number }[];
    if (published && period) {
      const stored = await ctx.db
        .query("waterShares")
        .withIndex("by_period", (q) => q.eq("periodId", period._id))
        .collect();
      shares = stored.map((s) => {
        const unit = units.find((u) => u._id === s.unitId);
        return {
          unitNumber: unit?.unitNumber ?? "?",
          tenantName: unit?.tenantName ?? "",
          amount: s.amount,
        };
      });
      shares.sort((a, b) => Number(a.unitNumber) - Number(b.unitNumber));
    } else {
      const amounts = splitEvenly(period?.waterTotal ?? 0, occupied.length);
      shares = occupied.map((u, i) => ({
        unitNumber: u.unitNumber,
        tenantName: u.tenantName,
        amount: amounts[i],
      }));
    }

    return {
      month,
      total: period?.waterTotal ?? null,
      billImageUrl: period?.waterBillImage
        ? await ctx.storage.getUrl(period.waterBillImage)
        : null,
      published,
      occupiedCount: occupied.length,
      shares,
    };
  },
});

/** Saves the total and the bill photo. Publishing stays a separate step. */
export const setWaterBill = mutation({
  args: {
    ...secretArg,
    month: v.optional(v.string()),
    total: v.number(),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { secret, month: requested, total, image }) => {
    assertAdmin(ctx, secret);
    const month = requested ?? currentMonthKey();
    if (!Number.isFinite(total) || total <= 0) {
      throw new Error("Enter the bill total.");
    }

    const period = await ctx.db
      .query("periods")
      .withIndex("by_month", (q) => q.eq("month", month))
      .unique();

    if (period) {
      await ctx.db.patch(period._id, {
        waterTotal: total,
        ...(image ? { waterBillImage: image } : {}),
      });
    } else {
      await ctx.db.insert("periods", {
        month,
        waterTotal: total,
        ...(image ? { waterBillImage: image } : {}),
        isPublished: false,
      });
    }
  },
});

/**
 * Freezes the split and makes it visible to tenants.
 *
 * Shares are written as rows rather than derived on read, so a tenant moving
 * out later cannot retroactively change what anyone was charged for a month
 * already published. Re-publishing recomputes deliberately, for the case where
 * an occupancy flag or the total was wrong; the admin is warned because tenant
 * pages change under them.
 */
export const publishWaterBill = mutation({
  args: { ...secretArg, month: v.optional(v.string()) },
  handler: async (ctx, { secret, month: requested }) => {
    assertAdmin(ctx, secret);
    const month = requested ?? currentMonthKey();

    const period = await ctx.db
      .query("periods")
      .withIndex("by_month", (q) => q.eq("month", month))
      .unique();

    if (!period || period.waterTotal == null) {
      throw new Error("Save the bill total first.");
    }

    const occupied = (await ctx.db.query("units").collect())
      .filter((u) => u.isOccupied)
      .sort((a, b) => Number(a.unitNumber) - Number(b.unitNumber));

    if (occupied.length === 0) {
      throw new Error(
        "No units are marked occupied, so there is nobody to split between.",
      );
    }

    // Clear any previous split for this month before rewriting it.
    const existing = await ctx.db
      .query("waterShares")
      .withIndex("by_period", (q) => q.eq("periodId", period._id))
      .collect();
    for (const row of existing) await ctx.db.delete(row._id);

    const amounts = splitEvenly(period.waterTotal, occupied.length);
    for (let i = 0; i < occupied.length; i++) {
      await ctx.db.insert("waterShares", {
        unitId: occupied[i]._id,
        periodId: period._id,
        amount: amounts[i],
      });
    }

    await ctx.db.patch(period._id, { isPublished: true });
    return { units: occupied.length, total: period.waterTotal };
  },
});

/**
 * Everything needed to answer "who has not paid?" without a second look.
 *
 * Arrears carry a known limitation. Water arrears are exact, because
 * waterShares stores the amount that was charged. Rent arrears are computed
 * from the unit's *current* rent, since the schema keeps no rent history, so a
 * unit whose rent changed will show past months valued at today's figure. The
 * page labels the number as an estimate for that reason.
 */
export const dashboard = query({
  args: secretArg,
  handler: async (ctx, { secret }) => {
    assertAdmin(ctx, secret);

    const month = currentMonthKey();
    const units = (await ctx.db.query("units").collect())
      .filter((u) => u.isOccupied)
      .sort((a, b) => Number(a.unitNumber) - Number(b.unitNumber));

    const periods = await ctx.db.query("periods").collect();
    const thisPeriod = periods.find((p) => p.month === month) ?? null;
    const pastPeriods = periods.filter((p) => p.month < month);

    const rows = await Promise.all(
      units.map(async (unit) => {
        const all = await ctx.db
          .query("submissions")
          .withIndex("by_unit_and_period", (q) => q.eq("unitId", unit._id))
          .collect();

        const forPeriod = (periodId: Id<"periods">, type: "rent" | "water") =>
          all.filter((s) => s.periodId === periodId && s.type === type);

        const rentStatus = thisPeriod
          ? deriveStatus(forPeriod(thisPeriod._id, "rent"))
          : ("none" as const);

        let waterAmount: number | null = null;
        let waterStatus: ReturnType<typeof deriveStatus> = "none";
        if (thisPeriod?.isPublished) {
          const share = await ctx.db
            .query("waterShares")
            .withIndex("by_unit_and_period", (q) =>
              q.eq("unitId", unit._id).eq("periodId", thisPeriod._id),
            )
            .unique();
          waterAmount = share?.amount ?? null;
          waterStatus = deriveStatus(forPeriod(thisPeriod._id, "water"));
        }

        let arrears = 0;
        for (const past of pastPeriods) {
          if (!forPeriod(past._id, "rent").some((s) => s.status === "approved")) {
            arrears += unit.rentAmount;
          }
          if (past.isPublished) {
            const share = await ctx.db
              .query("waterShares")
              .withIndex("by_unit_and_period", (q) =>
                q.eq("unitId", unit._id).eq("periodId", past._id),
              )
              .unique();
            if (
              share &&
              !forPeriod(past._id, "water").some((s) => s.status === "approved")
            ) {
              arrears += share.amount;
            }
          }
        }

        return {
          unitNumber: unit.unitNumber,
          tenantName: unit.tenantName,
          tenantPhone: unit.tenantPhone,
          rentAmount: unit.rentAmount,
          rentStatus,
          waterAmount,
          waterStatus,
          arrears: Math.round(arrears * 100) / 100,
        };
      }),
    );

    const count = (
      pick: (r: (typeof rows)[number]) => string,
      value: string,
    ) => rows.filter((r) => pick(r) === value).length;

    return {
      month,
      waterPublished: thisPeriod?.isPublished === true,
      occupiedCount: rows.length,
      rent: {
        paid: count((r) => r.rentStatus, "approved"),
        pending: count((r) => r.rentStatus, "pending"),
        missing: rows.filter(
          (r) => r.rentStatus !== "approved" && r.rentStatus !== "pending",
        ).length,
      },
      water: {
        paid: count((r) => r.waterStatus, "approved"),
        pending: count((r) => r.waterStatus, "pending"),
        missing: rows.filter(
          (r) => r.waterStatus !== "approved" && r.waterStatus !== "pending",
        ).length,
      },
      rows,
    };
  },
});
