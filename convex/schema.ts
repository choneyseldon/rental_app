import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // One row per rental unit. `token` is the tenant's only credential:
  // it lives in the printed QR at the door and is looked up on every
  // tenant page load, hence the index.
  units: defineTable({
    unitNumber: v.string(),
    token: v.string(),
    tenantName: v.string(),
    tenantPhone: v.string(),
    rentAmount: v.number(),
    bpcConsumerNumber: v.string(),
    isOccupied: v.boolean(),
  }).index("by_token", ["token"]),

  // One row per month. `month` is "YYYY-MM" so it sorts lexicographically.
  // The water bill stays unpublished until the admin splits it.
  periods: defineTable({
    month: v.string(),
    waterTotal: v.optional(v.number()),
    waterBillImage: v.optional(v.id("_storage")),
    isPublished: v.boolean(),
  }).index("by_month", ["month"]),

  // Computed when a water bill is published: the total split across
  // occupied units. Stored rather than derived so a later change in
  // occupancy cannot retroactively alter a published bill.
  waterShares: defineTable({
    unitId: v.id("units"),
    periodId: v.id("periods"),
    amount: v.number(),
  })
    .index("by_period", ["periodId"])
    .index("by_unit_and_period", ["unitId", "periodId"]),

  // Every uploaded payment screenshot, awaiting admin review.
  submissions: defineTable({
    unitId: v.id("units"),
    periodId: v.id("periods"),
    type: v.union(v.literal("rent"), v.literal("water")),
    image: v.id("_storage"),
    claimedAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    adminNote: v.optional(v.string()),
  })
    .index("by_unit_and_period", ["unitId", "periodId"])
    .index("by_status", ["status"]),
});
