import { PROPERTY, UNIT_NUMBERS } from "../../../../../convex/property";
import { Card, IconTile } from "@/components/ui";
import { IconBuilding, IconHome, IconQr } from "@/components/icons";

export const metadata = { title: "House details" };

/**
 * Reference only — everything here is fixed in convex/property.ts rather than
 * editable, because there is one building and it does not change.
 *
 * The rent account is deliberately absent. The owner knows it, and the fewer
 * screens that carry bank details behind a passcode, the better.
 */
export default function HousePage() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="flex items-start gap-3">
          <IconTile><IconBuilding /></IconTile>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight">{PROPERTY.name}</h2>
            <p className="text-sm text-muted">Owner · {PROPERTY.owner}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-4 border-t border-line pt-5">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Address</dt>
            <dd className="mt-1 leading-relaxed">{PROPERTY.address}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Map</dt>
            <dd className="mt-1">
              <a
                href={PROPERTY.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-semibold text-brand underline"
              >
                Open in Google Maps
              </a>
            </dd>
          </div>
        </dl>
      </Card>

      <div className="space-y-5">
        <Card>
          <div className="flex items-start gap-3">
            <IconTile><IconHome /></IconTile>
            <div>
              <h3 className="font-bold">{UNIT_NUMBERS.length} doors</h3>
              <p className="text-sm text-muted">Numbering skips 5.</p>
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-5 gap-2">
            {UNIT_NUMBERS.map((u) => (
              <li
                key={u}
                className="rounded-lg bg-brand-tint py-2 text-center text-sm font-bold tabular-nums"
              >
                {u}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <IconTile><IconQr /></IconTile>
            <div>
              <h3 className="font-bold">Door codes</h3>
              <p className="mt-1 text-sm text-muted">
                Each door has its own code. A tenant needs no account and no password — scanning
                is the whole login. Rotate a code from the Units page when someone moves out; the
                old sticker stops working immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
