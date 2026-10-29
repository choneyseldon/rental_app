import { api } from "../../../../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import { InquiryList, type InquiryRow } from "./InquiryList";

export const metadata = { title: "Inquiries" };

export default async function AdminInquiriesPage() {
  const { client, secret } = adminClient();

  let rows: InquiryRow[];
  try {
    const docs = await client.query(api.admin.listInquiries, { secret });
    rows = docs.map((d) => ({
      _id: d._id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      buildingName: d.buildingName,
      location: d.location,
      unitCount: d.unitCount,
      message: d.message ?? null,
      isHandled: d.isHandled,
      receivedAt: d._creationTime,
    }));
  } catch {
    return (
      <p role="alert" className="card border-bad/30 bg-bad-soft p-4 text-sm text-[#991b1b]">
        Could not load inquiries. If you have just updated the site, run{" "}
        <code>npx convex deploy</code> so the database has the new table.
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="card p-4 text-sm text-muted">
        No inquiries yet. They appear here when someone fills in the contact form on the home page.
      </p>
    );
  }

  return <InquiryList rows={rows} />;
}
