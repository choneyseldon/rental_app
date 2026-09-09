import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { hasAdminSession } from "@/lib/admin-session";
import { adminClient } from "@/lib/convex-admin";
import { logOut } from "../actions";

/**
 * Deliberately swallows failure. The badge is a convenience, and this layout
 * wraps every admin page — letting a Convex outage throw here would take the
 * whole admin area down instead of just the count.
 */
async function pendingCount(): Promise<number | null> {
  try {
    const { client, secret } = adminClient();
    return await client.query(api.admin.pendingCount, { secret });
  } catch {
    return null;
  }
}

/**
 * The authoritative guard. proxy.ts only checks that a cookie exists, which is
 * cheap enough to run on prefetches; this verifies the signature and expiry
 * before any admin page renders. /admin/login sits outside this route group so
 * it stays reachable.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasAdminSession())) redirect("/admin/login");

  const waiting = await pendingCount();

  return (
    <div className="mx-auto w-full max-w-3xl p-4 pb-24">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
          <Link href="/admin" className="min-h-11 whitespace-nowrap leading-[2.75rem]">
            Overview
          </Link>
          <Link href="/admin/units" className="min-h-11 whitespace-nowrap leading-[2.75rem]">
            Units
          </Link>
          <Link
            href="/admin/review"
            className="flex min-h-11 items-center gap-1.5 whitespace-nowrap leading-[2.75rem]"
          >
            Review
            {waiting ? (
              <span
                aria-label={`${waiting} waiting`}
                className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white"
              >
                {waiting}
              </span>
            ) : null}
          </Link>
          <Link href="/admin/water" className="min-h-11 whitespace-nowrap leading-[2.75rem]">
            Water
          </Link>
          <Link href="/admin/qr" className="min-h-11 whitespace-nowrap leading-[2.75rem]">
            Print QR
          </Link>
        </nav>
        <form action={logOut}>
          <button
            type="submit"
            className="min-h-11 whitespace-nowrap rounded-lg border border-neutral-400 px-4 text-sm font-medium"
          >
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
