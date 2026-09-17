"use client";

import { Card, buttonStyles } from "@/components/ui";
import { IconPin, IconSend } from "@/components/icons";
import {
  CopyButton, InvalidCode, Loading, OwnerContacts, PROPERTY, RENT_ACCOUNT, SectionHeader,
  useTenant, type TenantData,
} from "../shared";

/** Resolves the token; the rendering lives in LocationCards so a fixture can drive it. */
export function LocationView({ token }: { token: string }) {
  const data = useTenant(token);
  if (data === undefined) return <Loading />;
  if (data === null) return <InvalidCode />;
  return <LocationCards data={data} />;
}

export function LocationCards({ data }: { data: TenantData }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <SectionHeader icon={<IconPin />} title={PROPERTY.name} note={`Owner · ${PROPERTY.owner}`} />

        <div className="mt-5 border-t border-line pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Address</p>
          <p className="mt-1 leading-relaxed">{PROPERTY.address}</p>
          <a
            href={PROPERTY.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonStyles.ghost} mt-3 w-full sm:w-auto`}
          >
            Open in Maps
          </a>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Rent transfer account
          </p>
          <p className="mt-1 font-semibold">{RENT_ACCOUNT.holder}</p>
          <p className="text-sm text-muted">{RENT_ACCOUNT.bank}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="select-all font-mono text-xl font-bold tabular-nums">
              {RENT_ACCOUNT.number}
            </span>
            <CopyButton value={RENT_ACCOUNT.number} />
          </div>
        </div>

        <p className="mt-5 border-t border-line pt-5 text-sm text-muted">
          There is no account to recover and no password to reset — the code on your door is all
          you need. Your unit is <b>{data.unitNumber}</b>.
        </p>
      </Card>

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
  );
}
