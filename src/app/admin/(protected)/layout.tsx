import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { hasAdminSession } from "@/lib/admin-session";
import { adminClient } from "@/lib/convex-admin";
import { AdminShell } from "./AdminShell";

/**
 * Deliberately swallows failure. The badge is a convenience, and this layout
 * wraps every admin page — letting a Convex outage throw here would take the
 * whole admin area down instead of just the count.
 */
async function pendingCount(): Promise<number> {
  try {
    const { client, secret } = adminClient();
    return await client.query(api.admin.pendingCount, { secret });
  } catch {
    return 0;
  }
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasAdminSession())) redirect("/admin/login");
  return <AdminShell pending={await pendingCount()}>{children}</AdminShell>;
}
