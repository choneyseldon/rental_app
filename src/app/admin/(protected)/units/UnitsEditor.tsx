"use client";

import { useActionState } from "react";
import { Avatar, Card, Pill, buttonStyles, money } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { rotateToken, saveUnit } from "../../actions";

export type UnitRow = {
  _id: string;
  unitNumber: string;
  tenantName: string;
  tenantPhone: string;
  rentAmount: number;
  bpcConsumerNumber: string;
  isOccupied: boolean;
};

const field =
  "mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-base outline-none focus:border-brand";
const label = "block text-xs font-semibold uppercase tracking-wide text-muted";

function UnitCard({ unit }: { unit: UnitRow }) {
  const [saveState, save, saving] = useActionState(saveUnit, null);
  const [rotateState, rotate, rotating] = useActionState(rotateToken, null);

  return (
    <Card as="li" className="!p-0">
      <div className="flex items-center gap-3 border-b border-line p-4 sm:p-5">
        <Avatar name={unit.tenantName || `#${unit.unitNumber}`} className="!bg-brand-soft !text-brand" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight">Unit {unit.unitNumber}</h2>
          <p className="truncate text-sm text-muted">
            {unit.tenantName || "No tenant recorded"}
            {unit.rentAmount > 0 ? ` · ${money(unit.rentAmount)}` : ""}
          </p>
        </div>
        {unit.isOccupied ? (
          <Pill tone="ok"><IconCheck className="h-3.5 w-3.5" />Occupied</Pill>
        ) : (
          <Pill tone="neutral">Vacant</Pill>
        )}
      </div>

      <form action={save} className="p-4 sm:p-5">
        <input type="hidden" name="unitId" value={unit._id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label} htmlFor={`name-${unit._id}`}>Tenant name</label>
            <input id={`name-${unit._id}`} name="tenantName" defaultValue={unit.tenantName} className={field} />
          </div>
          <div>
            <label className={label} htmlFor={`phone-${unit._id}`}>Phone</label>
            <input id={`phone-${unit._id}`} name="tenantPhone" type="tel" inputMode="tel"
              defaultValue={unit.tenantPhone} className={field} />
          </div>
          <div>
            <label className={label} htmlFor={`rent-${unit._id}`}>Rent (Nu.)</label>
            <input id={`rent-${unit._id}`} name="rentAmount" type="number" inputMode="numeric"
              min={0} step={1} defaultValue={unit.rentAmount} className={`${field} tabular-nums`} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor={`bpc-${unit._id}`}>BPC consumer number</label>
            <input id={`bpc-${unit._id}`} name="bpcConsumerNumber" inputMode="numeric"
              defaultValue={unit.bpcConsumerNumber} className={`${field} font-mono tabular-nums`} />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 rounded-xl bg-brand-tint px-3 text-sm font-semibold">
          <input type="checkbox" name="isOccupied" defaultChecked={unit.isOccupied} className="size-5 accent-[#2563eb]" />
          Occupied — include in the water split
        </label>

        {saveState?.error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-bad">{saveState.error}</p>
        ) : null}

        <button type="submit" disabled={saving} className={`${buttonStyles.primary} mt-4 w-full`}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <form
        action={rotate}
        className="border-t border-line px-4 py-3 sm:px-5"
        onSubmit={(event) => {
          if (!window.confirm(
            `Issue a new code for unit ${unit.unitNumber}? The QR currently mounted at that door ` +
            `will stop working immediately.`,
          )) event.preventDefault();
        }}
      >
        <input type="hidden" name="unitId" value={unit._id} />
        {rotateState?.error ? (
          <p role="alert" className="mb-2 text-sm font-medium text-bad">{rotateState.error}</p>
        ) : null}
        <button type="submit" disabled={rotating} className={`${buttonStyles.danger} w-full !min-h-10 !text-xs`}>
          {rotating ? "Rotating…" : "New door code (tenant moved out)"}
        </button>
      </form>
    </Card>
  );
}

export function UnitsEditor({ units }: { units: UnitRow[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {units.map((unit) => <UnitCard key={unit._id} unit={unit} />)}
    </ul>
  );
}
