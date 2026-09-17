"use client";

import { Card } from "@/components/ui";
import { IconBolt, IconCash, IconDrop, IconHome, IconSend } from "@/components/icons";
import {
  HistoryCard, InvalidCode, Loading, OwnerContacts, SectionHeader, Stat, StatusPill,
  money, useTenant, type TenantData,
} from "./shared";

/** Resolves the token; the rendering lives in HomeCards so a fixture can drive it. */
export function HomeView({ token }: { token: string }) {
  const data = useTenant(token);
  if (data === undefined) return <Loading />;
  if (data === null) return <InvalidCode />;
  return <HomeCards data={data} token={token} />;
}

/**
 * The overview, and only the overview. Rent, water, power and the house each
 * have their own page now; the tiles are the way in.
 */
export function HomeCards({
  data,
  token,
}: {
  data: TenantData;
  /** Omitted in layout previews, which are not inside a token's route. */
  token?: string;
}) {
  const base = token ? `/u/${token}` : undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<IconHome />} label="My Unit" value={data.unitNumber} meta="Your door" />
        <Stat
          icon={<IconCash />}
          label={data.isOwner ? "Rent" : "Current Rent"}
          value={data.isOwner ? "—" : money(data.rent.amount)}
          meta={data.isOwner ? "Owner's flat" : <StatusPill status={data.rent.status} />}
          tone={data.rent.status === "approved" && !data.isOwner ? "ok" : "brand"}
          href={base ? `${base}/rent` : undefined}
        />
        <Stat
          icon={<IconDrop />}
          label="Water Bill"
          value={
            data.water.published && data.water.amount !== null ? money(data.water.amount) : "—"
          }
          meta={
            !data.water.published
              ? "Not published yet"
              : data.isOwner
                ? "Your share of the bill"
                : <StatusPill status={data.water.status} />
          }
          href={base ? `${base}/water` : undefined}
        />
        <Stat
          icon={<IconBolt />}
          label="Electricity"
          value={data.bpcConsumerNumber ? "Pay BPC" : "—"}
          meta={data.bpcConsumerNumber ? "Consumer number inside" : "Not recorded yet"}
          tone="warn"
          href={base ? `${base}/power` : undefined}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HistoryCard
            rows={data.history}
            title="Recent payments"
            empty="Nothing yet."
          />
        </div>

        <Card className="lg:self-start">
          <SectionHeader
            icon={<IconSend />}
            title="Contact the owners"
            note="Call, or message on WhatsApp."
          />
          <div className="mt-5 border-t border-line pt-5">
            <OwnerContacts unitNumber={data.unitNumber} />
          </div>
        </Card>
      </div>
    </div>
  );
}
