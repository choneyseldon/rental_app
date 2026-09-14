import { redirect } from "next/navigation";

/**
 * Nothing lives at the root: tenants arrive on /u/<token> from the QR on their
 * door, and the owner wants the admin. Landing on framework boilerplate just
 * looks broken.
 */
export default function RootPage() {
  redirect("/admin");
}
