import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-session";
import { logOut } from "../actions";

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

  return (
    <div className="mx-auto w-full max-w-3xl p-4 pb-24">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Units</h1>
        <form action={logOut}>
          <button
            type="submit"
            className="min-h-11 rounded-lg border border-neutral-400 px-4 text-sm font-medium"
          >
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
