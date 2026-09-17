import { OWNER_CONTACTS, OWNER_UNIT, PROPERTY, UNIT_NUMBERS } from "../../../../../convex/property";
import { Card, IconTile, buttonStyles } from "@/components/ui";
import { IconBuilding, IconHome, IconQr, IconSend } from "@/components/icons";
import { whatsAppLink } from "@/lib/phone";

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

        {/* The owners themselves, so whoever is covering the review queue can
            reach them without leaving the screen. */}
        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Owners</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {OWNER_CONTACTS.map((c) => {
              const chat = whatsAppLink(c.phone, `Kuzuzangpo, about ${PROPERTY.name}.`);
              return (
                <li
                  key={c.phone}
                  className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-line p-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{c.name}</span>
                    <a href={`tel:${c.phone}`} className="block text-sm text-muted underline">
                      {c.phone}
                    </a>
                  </span>
                  {chat ? (
                    <a
                      href={chat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${buttonStyles.ghost} shrink-0 !min-h-10 !px-3 !text-brand`}
                    >
                      <IconSend className="h-4 w-4" />
                      Message
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      <div className="space-y-5">
        <Card>
          <div className="flex items-start gap-3">
            <IconTile><IconHome /></IconTile>
            <div>
              <h3 className="font-bold">{UNIT_NUMBERS.length} rented doors</h3>
              <p className="text-sm text-muted">
                Floor {OWNER_UNIT} is the owners&rsquo; own flat. It shares the water bill but
                never appears in a review queue.
              </p>
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
