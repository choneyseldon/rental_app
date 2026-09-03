import "server-only";

import { ConvexHttpClient } from "convex/browser";

/**
 * Server-only Convex client for admin work. The secret it passes is a plain
 * server env var, deliberately not NEXT_PUBLIC_, so it cannot reach a browser
 * bundle. Every function in convex/admin.ts refuses to run without it.
 */
export function adminClient(): { client: ConvexHttpClient; secret: string } {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const secret = process.env.ADMIN_API_SECRET;
  if (!url) throw new Error("Missing NEXT_PUBLIC_CONVEX_URL.");
  if (!secret) throw new Error("Missing ADMIN_API_SECRET. See .env.local.example.");

  return { client: new ConvexHttpClient(url), secret };
}
