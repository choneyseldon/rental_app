"use client";

import { usePathname } from "next/navigation";
import { AppShell, type NavItem } from "@/components/AppShell";
import { IconBolt, IconCash, IconDrop, IconHome, IconPin } from "@/components/icons";
import { InvalidCode, monthName, useTenant } from "./shared";

/**
 * Keyed by the segment after the token, so the copy for a page lives next to
 * the nav entry that reaches it rather than inside the page itself.
 */
const COPY: Record<string, { title: string; subtitle: (month: string) => string }> = {
  "": { title: "Home", subtitle: (m) => `Your rental account for ${m}.` },
  rent: { title: "Rent", subtitle: (m) => `What is owed for ${m}, and how to send it.` },
  water: { title: "Water", subtitle: (m) => `Your share of the Thromde bill for ${m}.` },
  power: { title: "Power", subtitle: () => "Electricity is paid to BPC directly." },
  location: { title: "Location", subtitle: () => "Where the house is and who to call." },
};

export function TenantShell({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) {
  const data = useTenant(token);
  const pathname = usePathname();

  // A rotated code should not be handed a working nav to wander around in.
  if (data === null) return <InvalidCode />;

  const base = `/u/${token}`;
  const segment = pathname.startsWith(base) ? pathname.slice(base.length).replace(/^\//, "") : "";
  const copy = COPY[segment] ?? COPY[""];

  const nav: NavItem[] = [
    { href: base, label: "Home", icon: <IconHome /> },
    { href: `${base}/rent`, label: "Rent", icon: <IconCash /> },
    { href: `${base}/water`, label: "Water", icon: <IconDrop /> },
    { href: `${base}/power`, label: "Power", icon: <IconBolt /> },
    { href: `${base}/location`, label: "Location", icon: <IconPin /> },
  ];

  const name = data?.tenantName ?? "";
  const greeting =
    segment === ""
      ? `Kuzuzangpo${name ? `, ${name}` : ""} 👋`
      : copy.title;

  return (
    <AppShell
      nav={nav}
      user={name || "Tenant"}
      greeting={greeting}
      subtitle={copy.subtitle(data ? monthName(data.month) : "this month")}
    >
      {children}
    </AppShell>
  );
}
