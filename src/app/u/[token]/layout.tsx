import { TenantShell } from "./TenantShell";

export const metadata = {
  title: "ChimBill — your rent & water",
  // A door card is not something search engines should be indexing.
  robots: { index: false, follow: false },
};

/**
 * The token comes straight from the URL in the printed QR and is handed to the
 * client as the only credential. Resolving it to a unit happens inside Convex,
 * so no database id is ever exposed to the browser.
 *
 * The shell lives here rather than in each page so the nav and the header do
 * not remount on every tab change.
 */
export default async function TenantLayout({
  params,
  children,
}: LayoutProps<"/u/[token]">) {
  const { token } = await params;
  return <TenantShell token={token}>{children}</TenantShell>;
}
