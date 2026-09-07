import { TenantView } from "./TenantView";

export const metadata = {
  title: "Your rent & water",
  // A door card is not something search engines should be indexing.
  robots: { index: false, follow: false },
};

/**
 * The token comes straight from the URL in the printed QR and is handed to the
 * client as the only credential. Resolving it to a unit happens inside Convex,
 * so no database id is ever exposed to the browser.
 */
export default async function TenantPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <TenantView token={token} />;
}
