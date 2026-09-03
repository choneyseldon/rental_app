"use client";

import { useActionState } from "react";
import { rotateToken, saveUnit } from "../actions";

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
  "min-h-12 w-full rounded-lg border border-neutral-400 px-3 text-base";
const label = "block text-xs font-medium text-neutral-600";

function UnitCard({ unit }: { unit: UnitRow }) {
  const [saveState, save, saving] = useActionState(saveUnit, null);
  const [rotateState, rotate, rotating] = useActionState(rotateToken, null);

  return (
    <li className="rounded-xl border border-neutral-300 p-4">
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
          <p role="alert" className="text-sm text-red-700">
            {saveState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="min-h-12 w-full rounded-lg bg-neutral-900 px-4 font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <form
        action={rotate}
        className="mt-3 border-t border-neutral-200 pt-3"
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
          <p role="alert" className="mb-2 text-sm text-red-700">
            {rotateState.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={rotating}
          className="min-h-11 w-full rounded-lg border border-red-400 px-4 text-sm font-medium text-red-700 disabled:opacity-60"
        >
          {rotating ? "Rotating…" : "Rotate token (tenant moved out)"}
        </button>
      </form>
    </li>
  );
}

export function UnitsEditor({ units }: { units: UnitRow[] }) {
  return (
    <ul className="space-y-4">
      {units.map((unit) => (
        <UnitCard key={unit._id} unit={unit} />
      ))}
    </ul>
  );
}
