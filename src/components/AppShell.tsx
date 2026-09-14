"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Brand } from "./ui";
import { IconBell } from "./icons";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  /** Mobile bottom bar shows at most five; the rest live in the sidebar only. */
  primary?: boolean;
};

function isActive(pathname: string, href: string) {
  return href === "/admin" || href.split("/").length <= 2
    ? pathname === href
    : pathname.startsWith(href);
}

/**
 * Sidebar on desktop, bottom tab bar on phones — the two layouts in the
 * mockups. One component so the nav cannot drift between them.
 */
export function AppShell({
  nav,
  user,
  greeting,
  subtitle,
  actions,
  children,
}: {
  nav: NavItem[];
  user: string;
  greeting: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tabs = nav.filter((n) => n.primary !== false).slice(0, 5);

  // The tenant nav scrolls to sections on one page rather than routing, so the
  // first entry stands in for "you are here".
  const activeFor = (href: string) =>
    href.startsWith("#") ? href === nav[0]?.href : isActive(pathname, href);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-brand-tint px-4 py-6 lg:flex">
        <div className="px-2">
          <Brand tagline="Manage Rentals. Effortlessly." />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = activeFor(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-soft text-brand-strong"
                    : "text-slate-600 hover:bg-white hover:text-foreground"
                }`}
              >
                <span className={active ? "text-brand" : "text-slate-400"}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <p className="px-3 text-xs leading-relaxed text-muted">
          We&rsquo;re here
          <br />
          for your rental journey.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="relative text-slate-400">
              <IconBell />
              <span className="absolute right-0 top-0 size-2 rounded-full bg-bad" />
            </span>
            <Avatar name={user} />
            <span className="hidden text-sm font-semibold sm:block">{user}</span>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{greeting}</h1>
                <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p>
              </div>
              {actions}
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white lg:hidden">
        {tabs.map((item) => {
          const active = activeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                active ? "text-brand" : "text-slate-400"
              }`}
            >
              {item.icon}
              {item.label}
              {item.badge ? (
                <span className="absolute right-1/2 top-1.5 translate-x-4 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
