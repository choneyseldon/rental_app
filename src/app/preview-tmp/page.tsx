import { notFound } from "next/navigation";
import { AppShell, type NavItem } from "@/components/AppShell";
import { IconBolt, IconCash, IconDrop, IconHome, IconPin } from "@/components/icons";
import { HomeCards } from "../u/[token]/HomeView";
import { RentCards } from "../u/[token]/rent/RentView";
import { WaterCards } from "../u/[token]/water/WaterView";
import { PowerCards } from "../u/[token]/power/PowerView";
import { LocationCards } from "../u/[token]/location/LocationView";
import type { TenantData } from "../u/[token]/shared";

/**
 * Layout proofing for the tenant pages without a Convex deployment. The fixture
 * is typed as the query's own return type, so it cannot drift from the real
 * contract. All five pages are stacked on one route because what is being
 * proofed is the layout, not the routing. Not reachable in production.
 */
const fixture: TenantData = {
  unitNumber: "2B",
  isOwner: false,
  tenantName: "Pema Wangmo",
  bpcConsumerNumber: "1043872210",
  month: "2026-09",
  rent: { amount: 8500, status: "none" },
  water: {
    published: true,
    amount: 315.05,
    billImageUrl: "https://example.invalid/bill.jpg",
    status: "pending",
  },
  history: [
    { month: "2026-08", type: "rent", claimedAmount: 8500, status: "approved", adminNote: null, submittedAt: 1 },
    { month: "2026-08", type: "water", claimedAmount: 390, status: "approved", adminNote: null, submittedAt: 2 },
    { month: "2026-07", type: "rent", claimedAmount: 8000, status: "rejected", adminNote: "Screenshot was for July, not August.", submittedAt: 3 },
  ],
};

const nav: NavItem[] = [
  { href: "/preview-tmp", label: "Home", icon: <IconHome /> },
  { href: "/preview-tmp#rent", label: "Rent", icon: <IconCash /> },
  { href: "/preview-tmp#water", label: "Water", icon: <IconDrop /> },
  { href: "/preview-tmp#power", label: "Power", icon: <IconBolt /> },
  { href: "/preview-tmp#location", label: "Location", icon: <IconPin /> },
];

/**
 * Evaluated per request. Without this the route is prerendered, the env gate
 * is read at build time, and the 404 is baked into static output where no
 * runtime value can reach it.
 */
export const dynamic = "force-dynamic";

function Divider({ id, label }: { id: string; label: string }) {
  return (
    <h2
      id={id}
      className="mt-10 border-t border-line pt-6 text-xs font-bold uppercase tracking-widest text-muted"
    >
      {label}
    </h2>
  );
}

export default function PreviewPage() {
  if (process.env.ENABLE_PREVIEW !== "1") notFound();
  return (
    <AppShell
      nav={nav}
      user={fixture.tenantName}
      greeting={`Kuzuzangpo, ${fixture.tenantName} 👋`}
      subtitle="Your rental account for September 2026."
    >
      <HomeCards data={fixture} />
      <Divider id="rent" label="Rent page" />
      <div className="mt-5"><RentCards data={fixture} /></div>
      <Divider id="water" label="Water page" />
      <div className="mt-5"><WaterCards data={fixture} /></div>
      <Divider id="power" label="Power page" />
      <div className="mt-5"><PowerCards data={fixture} /></div>
      <Divider id="location" label="Location page" />
      <div className="mt-5"><LocationCards data={fixture} /></div>
    </AppShell>
  );
}
