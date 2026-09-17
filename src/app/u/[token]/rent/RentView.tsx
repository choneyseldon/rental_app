"use client";

import { PaymentUpload } from "../PaymentUpload";
import { Card } from "@/components/ui";
import { IconCamera, IconCash } from "@/components/icons";
import {
  HistoryCard, InvalidCode, Loading, SectionHeader, StatusPill, TransferPanel,
  money, monthName, useTenant, type TenantData,
} from "../shared";

/** Resolves the token; the rendering lives in RentCards so a fixture can drive it. */
export function RentView({ token }: { token: string }) {
  const data = useTenant(token);
  if (data === undefined) return <Loading />;
  if (data === null) return <InvalidCode />;
  return <RentCards data={data} token={token} />;
}

export function RentCards({
  data,
  token,
}: {
  data: TenantData;
  /** Omitted in layout previews, where uploading is not wired up. */
  token?: string;
}) {
  const rentHistory = data.history.filter((h) => h.type === "rent");
  const due =
    !data.isOwner && data.rent.status !== "approved" && data.rent.status !== "pending";

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <SectionHeader
            icon={<IconCash />}
            title={`Rent for ${monthName(data.month)}`}
            note={data.isOwner ? "The owners' own flat pays no rent." : "Agreed monthly rent for your unit."}
          />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-5">
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {data.isOwner ? "—" : money(data.rent.amount)}
            </p>
            {data.isOwner ? null : <StatusPill status={data.rent.status} />}
          </div>
        </Card>

        {due ? (
          <Card>
            <SectionHeader
              icon={<IconCamera />}
              title="Send this month's rent"
              note="Pay the owner, then add a screenshot here. This page updates on its own."
            />
            <div className="mt-5">
              <TransferPanel />
            </div>
            {token ? (
              <div className="mt-5">
                <PaymentUpload token={token} type="rent" suggestedAmount={data.rent.amount} />
              </div>
            ) : null}
          </Card>
        ) : data.isOwner ? null : (
          <Card>
            <SectionHeader
              icon={<IconCamera />}
              title={data.rent.status === "pending" ? "With the owner" : "Nothing to send"}
              note={
                data.rent.status === "pending"
                  ? "Your screenshot is waiting to be checked. You will see it change here."
                  : `Rent for ${monthName(data.month)} has been accepted.`
              }
              tone={data.rent.status === "pending" ? "warn" : "ok"}
            />
          </Card>
        )}
      </div>

      <div className="lg:col-span-1">
        <HistoryCard
          rows={rentHistory}
          title="Rent history"
          empty="No rent payments recorded yet."
          showType={false}
        />
      </div>
    </div>
  );
}
