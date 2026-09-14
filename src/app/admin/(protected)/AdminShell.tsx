"use client";

import { usePathname } from "next/navigation";
import { AppShell, type NavItem } from "@/components/AppShell";
import { buttonStyles } from "@/components/ui";
import {
  IconBuilding,
  IconDrop,
  IconHome,
  IconLogout,
  IconQr,
  IconReceipt,
} from "@/components/icons";
import { logOut } from "../actions";

const COPY: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Overview", subtitle: "Here's what's happening with your rentals today." },
  "/admin/units": { title: "Units", subtitle: "Tenant details, rent and door codes." },
  "/admin/review": { title: "Review", subtitle: "Payment screenshots waiting on you." },
  "/admin/water": { title: "Water", subtitle: "Upload the Thromde bill and split it." },
  "/admin/qr": { title: "Print QR", subtitle: "One card per door, ten to a page." },
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
    { href: "/admin/qr", label: "Print QR", icon: <IconQr /> },
  ];

  return (
    <AppShell
      nav={nav}
      user="Owner"
      tagline="Manage Rentals. Effortlessly."
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
