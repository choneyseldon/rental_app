import { ReceiptView } from "./ReceiptView";

export default async function TenantReceiptPage({
  params,
}: PageProps<"/u/[token]/receipt/[id]">) {
  const { token, id } = await params;
  return <ReceiptView token={token} submissionId={id} />;
}
