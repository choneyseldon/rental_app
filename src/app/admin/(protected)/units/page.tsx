import { api } from "../../../../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import { UnitsEditor, type UnitRow } from "./UnitsEditor";

export default async function AdminUnitsPage() {
  const { client, secret } = adminClient();

  let units: UnitRow[];
  try {
    const rows = await client.query(api.admin.listUnits, { secret });
    // Deliberately drops `token`: it is a tenant credential and the browser
    // has no need for it. Rotation is addressed by unit id instead.
    units = rows.map((u) => ({
      _id: u._id,
      unitNumber: u.unitNumber,
      tenantName: u.tenantName,
      tenantPhone: u.tenantPhone,
      rentAmount: u.rentAmount,
      bpcConsumerNumber: u.bpcConsumerNumber,
      isOccupied: u.isOccupied,
      isOwner: u.isOwner === true,
    }));
  } catch {
    return (
      <p role="alert" className="card border-bad/30 bg-bad-soft p-4 text-sm text-[#991b1b]">
        Could not load units. Check that <code>npx convex dev</code> is running
        and that <code>ADMIN_API_SECRET</code> is set both locally and on the
        Convex deployment.
      </p>
    );
  }

  if (units.length === 0) {
    return (
      <p className="card p-4 text-sm">
        No units yet. Run <code>npx convex run seed:seedUnits</code>.
      </p>
    );
  }

  return <UnitsEditor units={units} />;
}
