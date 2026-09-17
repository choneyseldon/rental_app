import { HomeView } from "./HomeView";

export default async function TenantHomePage({ params }: PageProps<"/u/[token]">) {
  const { token } = await params;
  return <HomeView token={token} />;
}
