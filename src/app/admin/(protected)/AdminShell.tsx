"use client";

import { usePathname } from "next/navigation";
import { AppShell, type NavItem } from "@/components/AppShell";
import { buttonStyles } from "@/components/ui";
import {
  IconBuilding,
  IconCalendar,
  IconDrop,
  IconHome,
  IconPin,
  IconSend,
  IconLogout,
  IconQr,
  IconReceipt,
} from "@/components/icons";
import { PROPERTY } from "../../../../convex/property";
import { logOut } from "../actions";

const COPY: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Overview", subtitle: "Here's what's happening with your rentals today." },
  "/admin/units": { title: "Units", subtitle: "Tenant details, rent and door codes." },
  "/admin/review": { title: "Review", subtitle: "Rent and water screenshots waiting on you." },
  "/admin/water": { title: "Water", subtitle: "Upload the Thromde bill and split it." },
  "/admin/history": { title: "History", subtitle: "The last 12 months, flat by flat." },
  "/admin/qr": { title: "Print QR", subtitle: "One card per door, ten to a page." },
  "/admin/inquiries": { title: "Inquiries", subtitle: "Owners who asked about ChimBill from the home page." },
  "/admin/house": { title: "House details", subtitle: "The building, its doors and how tenants reach it." },
};

export function AdminShell({
  pending,
  children,
}: {
  pending: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const copy = COPY[pathname] ?? COPY["/admin"];

  const nav: NavItem[] = [
    { href: "/admin", label: "Overview", icon: <IconHome /> },
    { href: "/admin/units", label: "Units", icon: <IconBuilding /> },
    { href: "/admin/review", label: "Review", icon: <IconReceipt />, badge: pending || undefined },
    { href: "/admin/water", label: "Water", icon: <IconDrop /> },
    { href: "/admin/history", label: "History", icon: <IconCalendar /> },
    { href: "/admin/qr", label: "Print QR", icon: <IconQr /> },
    { href: "/admin/house", label: "House", icon: <IconPin /> },
    { href: "/admin/inquiries", label: "Inquiries", icon: <IconSend /> },
  ];

  return (
    <AppShell
      nav={nav}
      user={PROPERTY.owner}
      tagline={PROPERTY.name}
      greeting={copy.title}
      subtitle={copy.subtitle}
      actions={
        <form action={logOut}>
          <button
            type="submit"
            title="Log out"
            className={`${buttonStyles.ghost} !px-3 sm:!px-4`}
          >
            <IconLogout className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Log out</span>
          </button>
        </form>
      }
    >
      {children}
    </AppShell>
  );
}
