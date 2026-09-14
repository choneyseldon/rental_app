"use client";

import { useActionState } from "react";
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
  "min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base outline-none focus:border-brand";
const label = "block text-xs font-semibold text-muted";

function UnitCard({ unit }: { unit: UnitRow }) {
  const [saveState, save, saving] = useActionState(saveUnit, null);
  const [rotateState, rotate, rotating] = useActionState(rotateToken, null);

  return (
    <li className="card p-4 sm:p-5">
      <form action={save} className="space-y-3">
        <input type="hidden" name="unitId" value={unit._id} />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Unit {unit.unitNumber}</h2>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isOccupied"
              defaultChecked={unit.isOccupied}
              className="size-5"
            />
            Occupied
          </label>
        </div>

        <div>
          <label className={label} htmlFor={`name-${unit._id}`}>
            Tenant name
          </label>
          <input
            id={`name-${unit._id}`}
            name="tenantName"
            defaultValue={unit.tenantName}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor={`phone-${unit._id}`}>
            Phone
          </label>
          <input
            id={`phone-${unit._id}`}
            name="tenantPhone"
            type="tel"
            inputMode="tel"
            defaultValue={unit.tenantPhone}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor={`rent-${unit._id}`}>
            Rent (Nu.)
          </label>
          <input
            id={`rent-${unit._id}`}
            name="rentAmount"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            defaultValue={unit.rentAmount}
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor={`bpc-${unit._id}`}>
            BPC consumer number
          </label>
          <input
            id={`bpc-${unit._id}`}
            name="bpcConsumerNumber"
            inputMode="numeric"
            defaultValue={unit.bpcConsumerNumber}
            className={field}
          />
        </div>

        {saveState?.error ? (
          <p role="alert" className="text-sm font-medium text-bad">
            {saveState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-brand px-4 font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <form
        action={rotate}
        className="mt-4 border-t border-line pt-4"
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Issue a new token for unit ${unit.unitNumber}? The QR currently ` +
                `mounted at that door will stop working immediately.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="unitId" value={unit._id} />
        {rotateState?.error ? (
          <p role="alert" className="mb-2 text-sm font-medium text-bad">
            {rotateState.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={rotating}
          className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl border border-bad/40 bg-white px-4 text-sm font-semibold text-bad transition-colors hover:bg-bad-soft disabled:opacity-50"
        >
          {rotating ? "Rotating…" : "Rotate token (tenant moved out)"}
        </button>
      </form>
    </li>
  );
}

export function UnitsEditor({ units }: { units: UnitRow[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {units.map((unit) => (
        <UnitCard key={unit._id} unit={unit} />
      ))}
    </ul>
  );
}
