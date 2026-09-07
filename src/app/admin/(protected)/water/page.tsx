import { api } from "../../../../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import { WaterBillForm, type WaterBill } from "./WaterBillForm";

export const metadata = { title: "Water bill" };

export default async function WaterPage() {
  const { client, secret } = adminClient();

  let bill: WaterBill;
  try {
    bill = await client.query(api.admin.getWaterBill, { secret });
  } catch {
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
        Could not load the water bill. Check that <code>npx convex dev</code> is
        running and <code>ADMIN_API_SECRET</code> matches on both sides.
      </p>
    );
  }

  return <WaterBillForm bill={bill} />;
}
