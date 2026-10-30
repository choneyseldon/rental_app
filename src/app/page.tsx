import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Brand, buttonStyles } from "@/components/ui";
import {
  IconBolt,
  IconCamera,
  IconCheck,
  IconChevron,
  IconDrop,
  IconQr,
  IconReceipt,
  IconSend,
} from "@/components/icons";
import { ContactForm } from "./_landing/ContactForm";
import { SiteHeader } from "./_landing/SiteHeader";

export const metadata: Metadata = {
  title: "ChimBill — rent and utility management for property owners",
  description:
    "A QR code on every door. Tenants see what they owe and send proof of payment; you approve it in one tap. Rent, shared water bills and receipts, without the phone calls.",
};

// Active on press: a button that gives no feedback feels broken on a phone.
const press = "active:scale-[0.97] motion-safe:transition-transform";

const featureCards = [
  {
    icon: <IconQr className="size-6" />,
    title: "A QR code on every door",
    description:
      "Tenants scan it and land on a page that is only theirs. No app to install, no account, no password to forget.",
  },
  {
    icon: <IconCamera className="size-6" />,
    title: "Proof of payment, reviewed by you",
    description:
      "Tenants upload a screenshot of what they paid. You see it beside the amount, then approve it or send it back with a reason.",
  },
  {
    icon: <IconDrop className="size-6" />,
    title: "Shared water bills, split fairly",
    description:
      "Upload the bill once. ChimBill splits it across the occupied flats, and the owner's own flat can share the cost too. Once published, each share stays fixed.",
  },
  {
    icon: <IconBolt className="size-6" />,
    title: "Electricity, one tap away",
    description:
      "Each flat's consumer number sits on its page, so tenants pay the power company directly without asking you for it.",
  },
  {
    icon: <IconReceipt className="size-6" />,
    title: "Receipts and a clear record",
    description:
      "Every approved payment gets a receipt the tenant can open, and twelve months of history are always a tap away.",
  },
  {
    icon: <IconSend className="size-6" />,
    title: "Reminders that write themselves",
    description:
      "See who has not paid at a glance, then nudge them on WhatsApp with the message already written.",
  },
];

const steps = [
  {
    title: "Set up your building",
    detail: "Add your flats, tenants and rents. ChimBill makes a private code for each door, ready to print.",
  },
  {
    title: "Tenants scan and pay",
    detail: "They see rent and their water share, pay you the way they already do, and upload a screenshot.",
  },
  {
    title: "You approve, and you are done",
    detail: "Check the screenshot, tap approve, and the tenant sees it turn green straight away.",
  },
];

const highlights = [
  { value: "No app", label: "for tenants to install" },
  { value: "1 QR code", label: "on every door" },
  { value: "1 tap", label: "to approve a payment" },
];

const audiences = [
  {
    title: "For tenants",
    points: [
      "See rent and your water share the moment you scan",
      "Upload one screenshot and see its status change",
      "Open a receipt for anything that has been approved",
      "Works on any phone, in daylight, with large buttons",
    ],
  },
  {
    title: "For owners",
    points: [
      "One screen shows who has paid and who has not",
      "Approve or reject with a note, from your phone or laptop",
      "Publish the water bill once and every share is worked out",
      "Print the door codes and replace one when a tenant leaves",
    ],
  },
];

const faq = [
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

/**
 * The owner's overview in a macOS window, with a tenant's home screen on an
 * iPhone in front of it. Both are real screenshots of the app, with sample data.
 * The phone's bezel is an image laid over the screenshot; the
 * percentages place the screenshot inside its transparent screen cut-out.
 */
function HeroDevices() {
  return (
    <div className="relative flex items-center justify-center pb-12 lg:pb-16">
      <div className="absolute inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-brand/20 via-sky-200/50 to-violet-200/40 blur-3xl" />

      <div className="relative w-full max-w-2xl lg:max-w-[36rem] xl:max-w-[40rem]">
        {/* Window */}
        <div className="overflow-hidden rounded-[0.9rem] border border-slate-900/10 bg-white shadow-[0_40px_100px_-20px_rgba(30,64,175,0.35),0_12px_30px_-12px_rgba(15,23,42,0.25)]">
          <div className="relative flex h-7 items-center border-b border-slate-200/80 bg-white px-3 sm:h-8">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="absolute left-1/2 flex h-[19px] w-[52%] -translate-x-1/2 items-center justify-center gap-1 rounded-full bg-slate-100 text-[9px] text-slate-500 sm:text-[10px]">
              <svg viewBox="0 0 16 16" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" />
                <path d="m10.5 10.5 3.5 3.5" strokeLinecap="round" />
              </svg>
              chimbill.vercel.app/admin
            </span>
          </div>
          <Image
            src="/mockups/owner-overview-full.webp"
            alt="ChimBill's owner overview: rent and water status for every flat, and who still has to pay"
            width={1600}
            height={887}
            priority
            sizes="(min-width: 1024px) 640px, 90vw"
            className="block h-auto w-full"
          />
        </div>

        {/* Phone */}
        <div className="absolute -bottom-8 -right-2 w-[32%] min-w-[110px] drop-shadow-[0_24px_40px_rgba(15,23,42,0.35)] sm:-right-5 lg:-bottom-12 lg:-right-4">
          <div className="relative aspect-[1/2]">
            <div
              className="absolute overflow-hidden bg-white"
              style={{ left: "5.94%", top: "2.66%", width: "87.2%", height: "94.4%" }}
            >
              <Image
                src="/mockups/tenant-home-ios-full.webp"
                alt="A tenant's home screen after scanning their door's QR code: their unit, rent, water bill and electricity"
                fill
                sizes="(min-width: 1024px) 230px, 30vw"
                className="object-cover object-top"
              />
            </div>
            <Image
              src="/mockups/iphone-frame.png"
              alt=""
              aria-hidden="true"
              width={320}
              height={640}
              className="pointer-events-none absolute inset-0 size-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
      {/* One wash for header and hero, fading out into the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[52rem] bg-[radial-gradient(70rem_30rem_at_50%_-6rem,rgba(37,99,235,0.2),transparent_70%),radial-gradient(40rem_28rem_at_90%_14rem,rgba(125,211,252,0.28),transparent_70%)] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      />
      <SiteHeader />

      <main>
        <section className="relative">
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 xl:gap-24 lg:px-8 lg:pb-28 lg:pt-20">
            <div className="flex flex-col justify-center">
              <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-brand-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                For landlords and building owners
              </span>

              <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl [text-wrap:balance]">
                Rent and utility bills, sorted at the door.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Put a QR code on every flat. Tenants scan it to see what they owe and send proof of payment, and you
                approve it in one tap. No more phone calls, WhatsApp screenshots or keeping the ledger in your head.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#contact" className={`${buttonStyles.primary} ${press}`}>
                  Get in touch
                </a>
                <a href="#workflow" className={`${buttonStyles.ghost} ${press}`}>
                  See how it works
                </a>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                Already a ChimBill owner?{" "}
                <Link href="/admin/login" className="font-semibold text-brand underline">
                  Owner login
                </Link>
              </p>

              <dl className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-slate-300/60 border-t border-slate-300/60 pt-6">
                {highlights.map((item) => (
                  <div key={item.label} className="px-3 first:pl-0 last:pr-0 sm:px-5">
                    <dt className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{item.value}</dt>
                    <dd className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{item.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <HeroDevices />
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Features</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl [text-wrap:balance]">
              Everything a small building needs, and nothing it does not.
            </h2>
            <p className="mt-4 text-slate-600 sm:text-lg">
              Built for owners who run a building themselves, not property companies.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => (
              <li
                key={feature.title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm motion-safe:transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="workflow" className="scroll-mt-20 bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">How it works</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
                From set-up to your first approved payment in three steps.
              </h2>
            </div>

            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <span className="mb-6 inline-flex size-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Both sides of the door</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl [text-wrap:balance]">
              Simple for tenants, quick for owners.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {audiences.map((group) => (
              <div key={group.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">{group.title}</h3>
                <ul className="mt-5 space-y-3 text-slate-600">
                  {group.points.map((point) => (
                    <li key={point} className="flex gap-3 leading-7">
                      <IconCheck className="mt-1 size-5 shrink-0 text-brand" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 border-y border-slate-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">FAQ</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl [text-wrap:balance]">
                Questions owners ask first.
              </h2>
            </div>

            <div className="mt-12 space-y-3">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-[1.25rem] border border-slate-200 bg-slate-50 open:bg-white open:shadow-sm"
                >
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <IconChevron className="size-5 shrink-0 text-slate-400 motion-safe:transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-5 pb-5 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2rem] bg-slate-900 px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:px-10 sm:py-12">
            <div className="grid gap-10 lg:grid-cols-5 lg:items-start">
              <div className="lg:col-span-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Get in touch</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl [text-wrap:balance]">
                  Tell us about your building.
                </h2>
                <p className="mt-4 text-slate-300 sm:text-lg">
                  Share a few details and we will email you to talk it through and show you ChimBill.
                </p>
                <ul className="mt-8 space-y-4 text-slate-200">
                  {[
                    "We reply by email within a couple of working days",
                    "No payment details are asked for here",
                    "Your details are only used to reply to you",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-400/15 text-sky-300">
                        <IconCheck className="size-4" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-slate-900 lg:col-span-3">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Brand tagline="Rent & utility management" />
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5">
            <Link href="/admin/login" className="flex min-h-11 items-center font-semibold text-brand">
              Owner login
            </Link>
            <a href="#contact" className="flex min-h-11 items-center transition hover:text-slate-900">
              Contact us
            </a>
            <a href="#faq" className="flex min-h-11 items-center transition hover:text-slate-900">
              FAQ
            </a>
          </nav>
          <p className="text-xs text-slate-500">Tenants: scan the QR code on your door.</p>
        </div>
      </footer>
    </div>
  );
}
