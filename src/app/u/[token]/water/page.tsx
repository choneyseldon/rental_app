import { WaterView } from "./WaterView";

export default async function TenantWaterPage({ params }: PageProps<"/u/[token]/water">) {
  const { token } = await params;
  return <WaterView token={token} />;
}
