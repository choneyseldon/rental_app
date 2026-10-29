/**
 * How far back history is shown, defined once so the tenant page and the admin
 * History page cannot disagree about it.
 *
 * This is a viewing window, not a deletion policy. Nothing in the app deletes
 * a payment, a screenshot or a month; records older than the window simply stop
 * appearing. Clearing data on purpose is what convex/maintenance.ts is for.
 */
export const RETENTION_MONTHS = 12;

/** "2026-10" shifted by `delta` months. Pure arithmetic, so no timezone to get wrong. */
export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * The oldest month still inside the window: the current month plus the eleven
 * before it. "YYYY-MM" sorts as text, so callers compare with plain `>=`.
 */
export function historyStartMonth(current: string): string {
  return shiftMonth(current, -(RETENTION_MONTHS - 1));
}

export const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;
