import Image from "next/image";
import Link from "next/link";
import { IconChevron } from "./icons";

/**
 * Rent is whole ngultrum, but a water share is one eleventh of a bill and
 * rarely is. Rounding it to Nu. 315 while the payment form is pre-filled with
 * 314.50 tells the tenant two different numbers, so the chhertum show whenever
 * there are any.
 */
export const money = (n: number, dp?: number) => {
  const places = dp ?? (Number.isInteger(n) ? 0 : 2);
  return `Nu. ${n.toLocaleString("en-IN", {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  })}`;
};

export function Card({
  children,
  className = "",
  id,
  as: As = "section",
}: {
  children: React.ReactNode;
  className?: string;
  /** Lets the tenant nav scroll to a section. */
  id?: string;
  as?: "section" | "div" | "li";
}) {
  return <As id={id} className={`card p-5 sm:p-6 ${className}`}>{children}</As>;
}

/** Soft square tile behind an icon — the motif the whole design leans on. */
export function IconTile({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "ok" | "warn" | "bad";
}) {
  const tones = {
    brand: "bg-brand-soft text-brand",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    bad: "bg-bad-soft text-bad",
  } as const;
  return (
    <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
      {children}
    </span>
  );
}

export type Tone = "ok" | "warn" | "bad" | "neutral";

export function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const tones = {
    ok: "bg-ok-soft text-[#166534]",
    warn: "bg-warn-soft text-[#92400e]",
    bad: "bg-bad-soft text-[#991b1b]",
    neutral: "bg-slate-100 text-slate-700",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** Big count used in the rent/water tallies. */
export function Tally({ value, label, tone }: { value: number; label: string; tone: Tone }) {
  const colors = { ok: "bg-ok", warn: "bg-warn", bad: "bg-bad", neutral: "bg-slate-400" } as const;
  return (
    <div className="flex items-center gap-2">
      <span className={`flex size-8 items-center justify-center rounded-full text-sm font-bold text-white ${colors[tone]}`}>
        {value}
      </span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

const buttonBase =
  "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-50";

export const buttonStyles = {
  primary: `${buttonBase} bg-brand text-white hover:bg-brand-strong`,
  ghost: `${buttonBase} border border-line bg-white text-foreground hover:bg-brand-tint`,
  danger: `${buttonBase} border border-bad/40 bg-white text-bad hover:bg-bad-soft`,
  ok: `${buttonBase} bg-ok text-white hover:brightness-95`,
};

export function StatCard({
  icon,
  label,
  value,
  meta,
  href,
  tone = "brand",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  meta?: string;
  href?: string;
  tone?: "brand" | "ok" | "warn" | "bad";
}) {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <IconTile tone={tone}>{icon}</IconTile>
        {href ? <IconChevron className="h-4 w-4 text-slate-300" /> : null}
      </div>
      <p className="mt-3 text-sm text-muted">{label}</p>
      <div className="mt-0.5 text-2xl font-bold tracking-tight">{value}</div>
      {meta ? <p className="mt-1 text-xs text-muted">{meta}</p> : null}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-5 transition-shadow hover:shadow-md">
      {body}
    </Link>
  ) : (
    <div className="card p-5">{body}</div>
  );
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
    </div>
  );
}

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";
  return (
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white ${className}`}>
      {initials}
    </span>
  );
}

export function Brand({ tagline }: { tagline?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <ChimBillMark className="size-10 shrink-0" />
      <span>
        {/* Tibetan script sits on a smaller em-box than Latin, so ཁྱིམ་ set at
            the same nominal size reads noticeably smaller than Bill beside it.
            The larger size is what makes the two halves match. */}
        <span className="flex items-baseline text-lg font-bold tracking-tight">
          {/* The vowel signs stack above the consonant, so the line box has to
              be taller than the Latin half or the glyph spills out of it. */}
          <span className="font-tibetan text-[1.45em] leading-[1.35]">ཁྱིམ་</span>
          <span className="leading-[1.35] text-brand">Bill</span>
        </span>
        {tagline ? <span className="block text-[11px] leading-tight text-muted">{tagline}</span> : null}
      </span>
    </div>
  );
}

/**
 * The house-and-QR mark, drawn rather than loaded, so it stays crisp at favicon
 * size and on a printed card and needs no image request. Swap in the supplied
 * artwork by dropping it at public/logo.png and using it here instead.
 */
/**
 * The mark, cut from the logo artwork in public/chimbill_logo.png. The artwork
 * is a lockup: the house sits above a wordmark, on white. At the 40px this
 * renders at, that wordmark comes out a few pixels tall and unreadable, so the
 * mark is cropped out of it and the name beside it is set in the UI font. The
 * crop is transparent, so it sits on the tinted sidebar as well as on white.
 */
export function ChimBillMark({ className = "size-10" }: { className?: string }) {
  return (
    <Image
      src="/chimbill-mark.png"
      alt="ChimBill"
      width={639}
      height={639}
      priority
      className={`${className} object-contain`}
    />
  );
}
