"use client";

import { PaymentUpload } from "../PaymentUpload";
import { Card, buttonStyles } from "@/components/ui";
import { IconCamera, IconDoc, IconDrop } from "@/components/icons";
import {
  HistoryCard, InvalidCode, Loading, SectionHeader, StatusPill, TransferPanel,
  money, monthName, useTenant, type TenantData,
} from "../shared";

/** Resolves the token; the rendering lives in WaterCards so a fixture can drive it. */
export function WaterView({ token }: { token: string }) {
  const data = useTenant(token);
  if (data === undefined) return <Loading />;
  if (data === null) return <InvalidCode />;
  return <WaterCards data={data} token={token} />;
}

export function WaterCards({
  data,
  token,
}: {
  data: TenantData;
  /** Omitted in layout previews, where uploading is not wired up. */
  token?: string;
}) {
  const waterHistory = data.history.filter((h) => h.type === "water");
  const due =
    !data.isOwner &&
    data.water.published &&
    data.water.status !== "approved" &&
    data.water.status !== "pending";

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <SectionHeader
            icon={<IconDrop />}
            title={`Water for ${monthName(data.month)}`}
            note={
              data.water.published
                ? "The Thromde bill, split equally between the flats."
                : "The owner has not published this month's bill yet."
            }
          />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-5">
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {data.water.published && data.water.amount !== null
                ? money(data.water.amount)
                : "—"}
            </p>
            {data.water.published && !data.isOwner ? (
              <StatusPill status={data.water.status} />
            ) : null}
          </div>
          {data.water.published && data.isOwner ? (
            <p className="mt-3 text-sm text-muted">
              Your flat counts as one share of the bill, but sends no proof of payment.
            </p>
          ) : null}
        </Card>

        {due ? (
          <Card>
            <SectionHeader
              icon={<IconCamera />}
              title="Send this month's water"
              note="Pay the owner, then add a screenshot here. This page updates on its own."
            />
            <div className="mt-5">
              <TransferPanel />
            </div>
            {token ? (
              <div className="mt-5">
                <PaymentUpload token={token} type="water" suggestedAmount={data.water.amount} />
              </div>
            ) : null}
          </Card>
        ) : data.water.published && !data.isOwner ? (
          <Card>
            <SectionHeader
              icon={<IconCamera />}
              title={data.water.status === "pending" ? "With the owner" : "Nothing to send"}
              note={
                data.water.status === "pending"
                  ? "Your screenshot is waiting to be checked. You will see it change here."
                  : `Water for ${monthName(data.month)} has been accepted.`
              }
              tone={data.water.status === "pending" ? "warn" : "ok"}
            />
          </Card>
        ) : null}

        {data.water.billImageUrl ? (
          <Card>
            <SectionHeader
              icon={<IconDoc />}
              title="Thromde bill"
              note="The bill your share was worked out from."
            />
            <a
              href={data.water.billImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonStyles.ghost} mt-4 w-full`}
            >
              View the bill
            </a>
          </Card>
        ) : null}
      </div>

      <div className="lg:col-span-1">
        <HistoryCard
          rows={waterHistory}
          title="Water history"
          empty="No water payments recorded yet."
          showType={false}
        />
      </div>
    </div>
  );
}
