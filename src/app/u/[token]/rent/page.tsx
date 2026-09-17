import { RentView } from "./RentView";

export default async function TenantRentPage({ params }: PageProps<"/u/[token]/rent">) {
  const { token } = await params;
  return <RentView token={token} />;
}
