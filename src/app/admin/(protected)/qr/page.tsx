import QRCode from "qrcode";
import { notoSerifTibetan } from "@/app/fonts";
import { api } from "../../../../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import { DZONGKHA_REVIEWED, qrLabels } from "@/lib/qr-labels";
import "./print.css";

/**
 * Resolves the origin the QR codes will point at. Getting this wrong is the
 * one mistake in this project that costs real money: a printed, mounted
 * sticker encoding localhost has to be reprinted and re-mounted. So the page
 * decides for itself whether the codes are safe to print, rather than relying
 * on whoever hits Cmd-P to remember.
 */
function resolveBaseUrl(): { baseUrl: string; safeToPrint: boolean; reason?: string } {
  const raw = process.env.APP_BASE_URL?.trim();

  if (!raw) {
    return {
      baseUrl: "http://localhost:3000",
      safeToPrint: false,
      reason: "APP_BASE_URL is not set, so these codes point at localhost.",
    };
  }
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\.local(?::|$)/i.test(raw)) {
    return {
      baseUrl: raw,
      safeToPrint: false,
      reason: `APP_BASE_URL is a local address (${raw}).`,
    };
  }
  if (!raw.startsWith("https://")) {
    return {
      baseUrl: raw,
      safeToPrint: false,
      reason: "APP_BASE_URL is not https, so scans would not reach production.",
    };
  }
  return { baseUrl: raw.replace(/\/+$/, ""), safeToPrint: true };
}

export const metadata = { title: "Print QR codes" };

export default async function QrSheetPage() {
  const { baseUrl, safeToPrint, reason } = resolveBaseUrl();
  const { client, secret } = adminClient();

  let units: { _id: string; unitNumber: string; token: string }[];
  try {
    units = await client.query(api.admin.listUnits, { secret });
  } catch {
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
        Could not load units. Check <code>npx convex dev</code> is running.
      </p>
    );
  }

  if (units.length === 0) {
    return (
      <p className="rounded-lg bg-neutral-100 p-4 text-sm">
        No units yet. Run <code>npx convex run seed:seedUnits</code>.
      </p>
    );
  }

  // Error correction H: a door sticker gets scuffed, rained on and thumbed.
  // The URL is short enough that the denser matrix costs nothing in scannability.
  const cards = await Promise.all(
    units.map(async (unit) => ({
      id: unit._id,
      unitNumber: unit.unitNumber,
      svg: await QRCode.toString(`${baseUrl}/u/${unit.token}`, {
        type: "svg",
        errorCorrectionLevel: "H",
        margin: 1,
      }),
    })),
  );

  const blocked = !safeToPrint || !DZONGKHA_REVIEWED;

  return (
    <div className={notoSerifTibetan.variable}>
      {blocked ? (
        <div
          role="alert"
          className="qr-no-print mb-4 space-y-2 rounded-lg border-2 border-red-600 bg-red-50 p-4 text-sm text-red-900"
        >
          <p className="text-base font-bold">Proof only — do not mount these.</p>
          <ul className="list-disc space-y-1 pl-5">
            {!safeToPrint ? <li>{reason}</li> : null}
            {!DZONGKHA_REVIEWED ? (
              <li>
                The Dzongkha wording in <code>src/lib/qr-labels.ts</code> is an
                unreviewed placeholder. Have a Dzongkha speaker check it, then
                set <code>DZONGKHA_REVIEWED</code> to <code>true</code>.
              </li>
            ) : null}
          </ul>
        </div>
      ) : (
        <p className="qr-no-print mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-900">
          Codes point at <code>{baseUrl}</code> and the Dzongkha has been
          reviewed. Safe to print and mount.
        </p>
      )}

      <div className="qr-no-print mb-4 text-sm text-neutral-600">
        {cards.length} cards. Print at 100% scale — any &ldquo;fit to page&rdquo;
        shrink changes the physical size of the codes.
      </div>

      <div className="qr-sheet">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`qr-card relative ${blocked ? "qr-proof" : ""}`}
          >
            <div dangerouslySetInnerHTML={{ __html: card.svg }} />
            <div>
              <p className="qr-unit">
                {qrLabels.unitPrefix.en} {card.unitNumber}
              </p>
              <p className="qr-dz" style={{ fontFamily: "var(--font-noto-tibetan)" }}>
                {qrLabels.instruction.dz}
              </p>
              <p className="qr-en font-semibold">{qrLabels.instruction.en}</p>
              <p className="qr-en text-neutral-700">{qrLabels.noLogin.en}</p>
            </div>
            {blocked ? <span className="qr-proof-stamp">PROOF — DO NOT MOUNT</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
