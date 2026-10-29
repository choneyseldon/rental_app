import Link from "next/link";
import { Brand, buttonStyles } from "@/components/ui";

const featureCards = [
  {
    title: "Smart rent collection",
    description:
      "Track due dates, payment status, and reminders from one place without chasing tenants manually.",
    accent: "bg-brand-soft text-brand",
  },
  {
    title: "Utility billing made clear",
    description:
      "Split water, power, and shared costs with transparent calculations and tenant-ready receipts.",
    accent: "bg-sky-100 text-sky-700",
  },
  {
    title: "Maintenance & repair flow",
    description:
      "Capture issues, assign owners, and keep every request visible until it is resolved.",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    title: "Tenant-facing portal",
    description:
      "Give residents a clean place to view bills, upload payment evidence, and stay informed.",
    accent: "bg-emerald-100 text-emerald-700",
  },
];

const steps = [
  { title: "Create property profile", detail: "Add units, tenants, utility settings, and billing rules." },
  { title: "Automate oversight", detail: "Monitor due dates, payments, and anomalies in real time." },
  { title: "Keep everyone aligned", detail: "Share receipts, updates, and repair status with the right people." },
];

const stats = [
  { value: "24/7", label: "bill visibility" },
  { value: "3x", label: "faster follow-ups" },
  { value: "99%", label: "receipt clarity" },
];

const testimonials = [
  {
    quote:
      "ChimBill helps us stay organized across rent, utilities, and maintenance without endless spreadsheet work.",
    author: "A. Dorji",
    role: "Property Manager",
  },
  {
    quote:
      "The dashboard is simple enough for our team to adopt quickly, and tenants understand the payment flow better.",
    author: "T. Wangmo",
    role: "Housing Coordinator",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="ChimBill home">
            <Brand tagline="Rental operations made simple" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="#features" className="transition hover:text-slate-900">
              Features
            </Link>
            <Link href="#workflow" className="transition hover:text-slate-900">
              Workflow
            </Link>
            <Link href="#reviews" className="transition hover:text-slate-900">
              Reviews
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="#contact" className={`${buttonStyles.ghost} hidden sm:inline-flex`}>
              Book a demo
            </Link>
            <Link href="/admin/login" className={buttonStyles.primary}>
              Admin login
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-20">
          <div className="flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-brand-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Property management platform
            </span>

            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Keep rent, utilities, and tenant updates in perfect sync.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              ChimBill brings property owners, managers, and tenants onto one clean workflow—so billing,
              reminders, receipts, and maintenance requests stay clear, timely, and easy to manage.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/admin/login" className={buttonStyles.primary}>
                Get started
              </Link>
              <Link href="#features" className={buttonStyles.ghost}>
                Explore features
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm">
                  <div className="text-xl font-bold text-slate-900">{item.value}</div>
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-8 rounded-[2rem] bg-gradient-to-tr from-brand/15 via-sky-100 to-white blur-2xl" />
            <div className="relative w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
              <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Overview</p>
                    <h2 className="mt-1 text-2xl font-bold">This month</h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    On track
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    ["Rent collections", "Nu. 186,500", "92% collected"],
                    ["Water bills", "Nu. 34,200", "8 pending"],
                    ["Maintenance", "14 requests", "3 urgent"],
                  ].map(([label, value, status]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-300">{label}</p>
                          <p className="mt-1 text-xl font-semibold">{value}</p>
                        </div>
                        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            {[
              "Property owners",
              "Housing managers",
              "Resident communities",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Why teams choose ChimBill</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Built to simplify housing operations.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => (
            <article key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className={`mb-5 inline-flex size-12 items-center justify-center rounded-2xl ${feature.accent}`}>
                <span className="text-lg font-bold">✓</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">How it works</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A clean process from billing to resolution.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <div className="mb-6 inline-flex size-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Customer feedback</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Trusted by teams that need clarity and speed.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {testimonials.map((item) => (
            <blockquote key={item.author} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-lg leading-8 text-slate-700">“{item.quote}”</p>
              <footer className="mt-6 border-t border-slate-200 pt-4">
                <div className="font-semibold text-slate-900">{item.author}</div>
                <div className="text-sm text-slate-500">{item.role}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="contact" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-r from-brand to-sky-600 px-6 py-10 text-white shadow-[0_24px_80px_rgba(30,64,175,0.28)] sm:px-10 sm:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-100">Ready to modernize operations?</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Bring rent and utility management into one seamless workflow.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/admin/login" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-brand transition hover:bg-slate-100">
                Open admin portal
              </Link>
              <a href="mailto:hello@chimbill.app" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                hello@chimbill.app
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Brand tagline="Property billing & operations" />
          </div>
          <div className="flex items-center gap-5">
            <Link href="#features" className="transition hover:text-slate-900">
              Features
            </Link>
            <Link href="/admin/login" className="transition hover:text-slate-900">
              Admin login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
