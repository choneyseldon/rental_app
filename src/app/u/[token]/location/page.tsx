import { LocationView } from "./LocationView";

export default async function TenantLocationPage({ params }: PageProps<"/u/[token]/location">) {
  const { token } = await params;
  return <LocationView token={token} />;
}
