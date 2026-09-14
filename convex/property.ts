/**
 * The property's fixed details. Lives in convex/ rather than src/ so the
 * backend and the Next app share one copy — there is one building, and unit
 * numbers in particular must not drift between the seed and the UI.
 *
 * No Convex imports here, so it is safe to import from React code too.
 */

export const PROPERTY = {
  name: "Dorji Khangzang",
  owner: "Dorji",
  address:
    "GJ5M+FFJ Jungshina, Above Jungshina School, Dechen Zur Lam 13 Northwest, Thimphu",
  mapsUrl: "https://maps.app.goo.gl/DMKfDyVunUSpkQcPA",
} as const;

/** Where tenants transfer rent. Shown on the tenant page with a copy button. */
export const RENT_ACCOUNT = {
  holder: "Norbu Dolma",
  bank: "Bank of Bhutan",
  number: "200570303",
} as const;

/** The ten doors, in the order they should always appear. Note 5 is skipped. */
export const UNIT_NUMBERS = [
  "1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "6A", "6B",
] as const;

/**
 * Orders units the way a person reads them: floor first as a number, then the
 * letter. Number("1A") is NaN, so the previous numeric sort put these in
 * whatever order the database happened to return.
 */
export function compareUnits(a: string, b: string): number {
  const parse = (s: string): [number, string] => {
    const m = /^(\d*)(.*)$/.exec(s.trim());
    return [m?.[1] ? Number(m[1]) : Number.POSITIVE_INFINITY, (m?.[2] ?? "").toUpperCase()];
  };
  const [an, as] = parse(a);
  const [bn, bs] = parse(b);
  if (an !== bn) return an - bn;
  return as.localeCompare(bs);
}
