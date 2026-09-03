import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. See .env.local.example.`);
  return value;
}

/** Compares two strings without leaking length or content through timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function sign(payload: string): string {
  return createHmac("sha256", requiredEnv("ADMIN_SESSION_SECRET"))
    .update(payload)
    .digest("base64url");
}

/**
 * The cookie carries an expiry and a signature over it — never the passcode.
 * Signing means a tampered or hand-crafted cookie is rejected, so possession
 * of the cookie is not the same as knowing the secret.
 */
export function isPasscodeCorrect(candidate: string): boolean {
  return safeEqual(candidate, requiredEnv("ADMIN_PASSCODE"));
}

export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** True only for a correctly signed, unexpired cookie. */
export async function hasAdminSession(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
