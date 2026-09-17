"use client";

import { Card } from "@/components/ui";
import { IconBolt } from "@/components/icons";
import {
  CopyButton, InvalidCode, Loading, SectionHeader, useTenant, type TenantData,
} from "../shared";

/** Resolves the token; the rendering lives in PowerCards so a fixture can drive it. */
export function PowerView({ token }: { token: string }) {
  const data = useTenant(token);
  if (data === undefined) return <Loading />;
  if (data === null) return <InvalidCode />;
  return <PowerCards data={data} />;
}

/**
 * Electricity is the one bill that does not pass through the owner: the tenant
 * pays BPC directly. So this page hands over the consumer number and nothing
 * else — there is no amount here to know and no screenshot to send.
 */
export function PowerCards({ data }: { data: TenantData }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <SectionHeader
          icon={<IconBolt />}
          tone="warn"
          title="Electricity"
          note="Paid to BPC directly, not to the owner."
        />

        {data.bpcConsumerNumber ? (
          <>
            <div className="mt-5 border-t border-line pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Your BPC consumer number
              </p>
              <div className="mt-2 rounded-xl bg-brand-tint p-4">
                <p className="select-all break-all font-mono text-2xl font-bold tabular-nums">
                  {data.bpcConsumerNumber}
                </p>
                <div className="mt-3">
                  <CopyButton value={data.bpcConsumerNumber} />
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Use this number in your bank app, at a BPC counter or on the BPC website. The
              owner does not see your electricity bill and nothing needs to be sent here.
            </p>
          </>
        ) : (
          <p className="mt-5 border-t border-line pt-5 text-muted">
            No consumer number recorded for your unit yet. Ask the owner to add it.
          </p>
        )}
      </Card>
    </div>
  );
}
