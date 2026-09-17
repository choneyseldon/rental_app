import { PowerView } from "./PowerView";

export default async function TenantPowerPage({ params }: PageProps<"/u/[token]/power">) {
  const { token } = await params;
  return <PowerView token={token} />;
}
