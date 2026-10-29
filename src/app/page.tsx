import type { Metadata } from "next";
import Link from "next/link";
import { Brand, Card, IconTile, Pill, buttonStyles } from "@/components/ui";
import {
  IconBell,
  IconBolt,
  IconBuilding,
  IconCalendar,
  IconCamera,
  IconCash,
  IconCheck,
  IconChevron,
  IconDrop,
  IconQr,
  IconReceipt,
  IconSend,
} from "@/components/icons";
import { ContactForm } from "./_landing/ContactForm";

export const metadata: Metadata = {
  title: "ChimBill — rent and utility management for property owners",
  description:
    "A QR code on every door. Tenants see what they owe and send proof of payment; you approve it in one tap. Rent, shared water bills and receipts, without the phone calls.",
};

// Active on press: a button that gives no feedback feels broken on a phone.
const press = "active:scale-[0.97] motion-safe:transition-transform";

const FEATURES = [
  {
    icon: <IconQr />,
    title: "A QR code on every door",
    body: "Tenants scan it and land on a page that is only theirs. No app to install, no account, no password to forget.",
  },
  {
    icon: <IconCamera />,
    title: "Proof of payment, reviewed by you",
    body: "Tenants upload a screenshot of what they paid. You see it beside the amount, then approve it or send it back with a reason.",
  },
  {
    icon: <IconDrop />,
    title: "Shared water bills, split fairly",
    body: "Upload the bill once. ChimBill splits it across the occupied flats, and the owner's own flat can share the cost too. Once published, each share stays fixed.",
  },
  {
    icon: <IconBolt />,
    title: "Electricity, one tap away",
    body: "Each flat's consumer number sits on its page, so tenants pay the power company directly without asking you for it.",
  },
  {
    icon: <IconReceipt />,
    title: "Receipts and a clear record",
    body: "Every approved payment gets a receipt the tenant can open, and twelve months of history are always a tap away.",
  },
  {
    icon: <IconSend />,
    title: "Reminders that write themselves",
    body: "See who has not paid at a glance, then nudge them on WhatsApp with the message already written.",
  },
];

const STEPS = [
  {
    title: "Set up your building",
    body: "Add your flats, tenants and rents. ChimBill makes a private code for each door, ready to print.",
  },
  {
    title: "Tenants scan and pay",
    body: "They see rent and their water share, pay you the way they already do, and upload a screenshot.",
  },
  {
    title: "You approve, and you are done",
    body: "Check the screenshot, tap approve, and the tenant sees it turn green straight away.",
  },
];

const FAQ = [
  {
    q: "Do my tenants need to install anything?",
    a: "No. They scan the QR code on their door with their phone's camera. There is no app, no sign-up and no password.",
  },
  {
    q: "Does ChimBill take the rent money?",
    a: "No. Tenants pay you directly, exactly as they do today. ChimBill only keeps track of who has paid, so there is no payment gateway and nothing to reconcile.",
  },
  {
    q: "What stops someone seeing another flat's bills?",
    a: "Each door's code is long and random, and it opens only that flat's page. If a tenant moves out, you replace the code and the old one stops working at once.",
  },
  {
    q: "How is the water bill divided?",
    a: "Equally across the occupied flats, including your own if you live in the building. The split is saved when you publish it, so a later move-out cannot change a bill that is already out.",
  },
  {
    q: "Will it work for my building?",
    a: "ChimBill was built in Thimphu, so amounts are in ngultrum and it is set up for Thromde water and BPC electricity. If your building does things differently, tell us below and we will say honestly whether it fits.",
  },
  {
    q: "I am a tenant. Where do I log in?",
    a: "You do not. Scan the QR code on your door. If it does not work, ask your landlord for a new one.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl [text-wrap:balance]">{title}</h2>
      {children ? <p className="mt-3 text-muted sm:text-lg">{children}</p> : null}
    </div>
  );
}

/**
 * A picture of the tenant's page, built from the real components and fictional
 * data, so it can never drift from what the product actually looks like.
 */
function TenantPreview() {
  return (
    <div
      className="rise mx-auto w-full max-w-sm rounded-[2rem] border border-line bg-white p-3 shadow-lg shadow-slate-900/5"
      style={{ "--rise-delay": "120ms" } as React.CSSProperties}
      role="img"
      aria-label="Example of a tenant's page: rent due, water share and payment status"
    >
      <div className="rounded-[1.5rem] bg-background p-4">
        <p className="text-xs text-muted">Flat 2B &middot; June</p>
        <p className="mt-0.5 text-lg font-bold tracking-tight">Hello, Pema</p>

        <div className="card mt-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconTile><IconCash /></IconTile>
              <div>
                <p className="text-sm text-muted">Rent</p>
                <p className="text-xl font-bold tracking-tight">Nu. 12,000</p>
              </div>
            </div>
            <Pill tone="ok">
              <IconCheck className="size-3.5" /> Paid
            </Pill>
          </div>
        </div>

        <div className="card mt-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconTile><IconDrop /></IconTile>
              <div>
                <p className="text-sm text-muted">Your water share</p>
                <p className="text-xl font-bold tracking-tight">Nu. 314.50</p>
              </div>
            </div>
            <Pill tone="warn">Checking</Pill>
          </div>
          <p className="mt-3 rounded-xl bg-brand-tint px-3 py-2 text-xs text-muted">
            Screenshot sent. The owner will approve it shortly.
          </p>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted">Sample data</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="ChimBill home" className="flex min-h-11 items-center rounded-xl">
            <Brand />
          </Link>
          <nav aria-label="Sections" className="ml-6 hidden items-center gap-1 md:flex">
            {[
              ["Features", "#features"],
              ["How it works", "#how"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-brand-tint hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/admin/login" className={`${buttonStyles.ghost} ${press}`}>
              Owner login
            </Link>
            <a href="#contact" className={`${buttonStyles.primary} ${press} hidden sm:inline-flex`}>
              Get in touch
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-brand-tint to-background">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
            <div>
              <p className="rise inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
                <IconBuilding className="size-4" /> For landlords and building owners
              </p>
              <h1
                className="rise mt-4 text-4xl font-bold tracking-tight sm:text-5xl [text-wrap:balance]"
                style={{ "--rise-delay": "60ms" } as React.CSSProperties}
              >
                Rent and utility bills, <span className="text-brand">sorted at the door.</span>
              </h1>
              <p
                className="rise mt-4 max-w-xl text-lg text-muted"
                style={{ "--rise-delay": "120ms" } as React.CSSProperties}
              >
                Put a QR code on every flat. Tenants scan it to see what they owe and send proof of
                payment, and you approve it in one tap. No more phone calls, WhatsApp screenshots
                or keeping the ledger in your head.
              </p>
              <div
                className="rise mt-7 flex flex-col gap-3 sm:flex-row"
                style={{ "--rise-delay": "180ms" } as React.CSSProperties}
              >
                <a href="#contact" className={`${buttonStyles.primary} ${press} !min-h-12 !px-6 !text-base`}>
                  Get in touch
                </a>
                <a href="#how" className={`${buttonStyles.ghost} ${press} !min-h-12 !px-6 !text-base`}>
                  See how it works
                </a>
              </div>
              <p
                className="rise mt-5 text-sm text-muted"
                style={{ "--rise-delay": "240ms" } as React.CSSProperties}
              >
                Already a ChimBill owner?{" "}
                <Link href="/admin/login" className="font-semibold text-brand underline">
                  Log in
                </Link>
              </p>
            </div>
            <TenantPreview />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Features" title="Everything a small building needs, and nothing it does not">
              Built for owners who run a building themselves, not property companies.
            </SectionHeading>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card as="li" key={f.title}>
                  <IconTile>{f.icon}</IconTile>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-muted">{f.body}</p>
                </Card>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 bg-white px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="How it works" title="From set-up to your first approved payment in three steps" />
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-[1.25rem] border border-line bg-brand-tint p-5 sm:p-6">
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Two audiences */}
        <section className="px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
            <Card>
              <IconTile><IconQr /></IconTile>
              <h2 className="mt-4 text-xl font-bold tracking-tight">For tenants</h2>
              <ul className="mt-3 space-y-2.5 text-muted">
                {[
                  "See rent and your water share the moment you scan",
                  "Upload one screenshot and see its status change",
                  "Open a receipt for anything that has been approved",
                  "Works on any phone, in daylight, with large buttons",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <IconCheck className="mt-0.5 size-5 shrink-0 text-ok" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <IconTile><IconCalendar /></IconTile>
              <h2 className="mt-4 text-xl font-bold tracking-tight">For owners</h2>
              <ul className="mt-3 space-y-2.5 text-muted">
                {[
                  "One screen shows who has paid and who has not",
                  "Approve or reject with a note, from your phone or laptop",
                  "Publish the water bill once and every share is worked out",
                  "Print the door codes and replace one when a tenant leaves",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <IconCheck className="mt-0.5 size-5 shrink-0 text-ok" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 bg-white px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow="FAQ" title="Questions owners ask first" />
            <div className="mt-8 space-y-3">
              {FAQ.map((item) => (
                <details key={item.q} className="card group p-0 open:shadow-md">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <IconChevron className="size-5 shrink-0 text-slate-400 motion-safe:transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-5 pb-5 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-20 bg-gradient-to-b from-background to-brand-tint px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <SectionHeading eyebrow="Get in touch" title="Tell us about your building">
                Share a few details and we will email you to talk it through and show you ChimBill.
              </SectionHeading>
              <ul className="mt-6 space-y-3 text-muted">
                {[
                  { icon: <IconBuilding />, text: "Tell us the building and how many flats it has" },
                  { icon: <IconBell />, text: "We reply by email within a couple of working days" },
                  { icon: <IconReceipt />, text: "No payment details are asked for here" },
                ].map((r) => (
                  <li key={r.text} className="flex items-center gap-3">
                    <IconTile>{r.icon}</IconTile>
                    {r.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Brand tagline="Rent & utility management" />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 text-sm">
            <Link href="/admin/login" className="flex min-h-11 items-center font-semibold text-brand">
              Owner login
            </Link>
            <a href="#contact" className="flex min-h-11 items-center font-semibold text-slate-600">
              Contact us
            </a>
            <a href="#faq" className="flex min-h-11 items-center font-semibold text-slate-600">
              FAQ
            </a>
          </nav>
          <p className="text-xs text-muted">Tenants: scan the QR code on your door.</p>
        </div>
      </footer>
    </>
  );
}
