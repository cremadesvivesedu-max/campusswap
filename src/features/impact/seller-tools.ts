// Pure rules for the November 2026 seller tools and campus impact. No database here: easy to test.

// ── CO2 saved by reuse ───────────────────────────────────────────────────────
// Rough kg of CO2e avoided when a second-hand item replaces a new one. Ballpark figures from
// published life-cycle studies (manufacture + transport of the new product), rounded down on
// purpose. We always say "about" and never present them as exact.
export const CO2_KG_BY_CATEGORY: Record<string, number> = {
  bikes: 96,
  furniture: 45,
  electronics: 60,
  "kitchen-equipment": 12,
  "household-items": 10,
  "essentials-daily-living": 5,
  "textbooks-study-materials": 2,
  outlet: 10
};
export const CO2_DEFAULT_KG = 8;

export function co2ForCategory(categorySlug: string | null | undefined): number {
  return (categorySlug && CO2_KG_BY_CATEGORY[categorySlug]) || CO2_DEFAULT_KG;
}

/** Same scale everyone understands: a car trip of about 0.12 kg CO2 per km. */
export function co2AsCarKm(kg: number) {
  return Math.round(kg / 0.12);
}

// ── Residences in Maastricht (for the ranking and ambassadors) ───────────────
// Slug → display name. "other" for everyone else, so no one is forced to say where they live.
export const RESIDENCES = [
  { slug: "the-student-hotel", name: "The Social Hub Maastricht" },
  { slug: "the-ed", name: "The Ed" },
  { slug: "guesthouse-um", name: "UM Guesthouse" },
  { slug: "xior-maastricht", name: "Xior Maastricht" },
  { slug: "student-housing-annadal", name: "Annadal" },
  { slug: "randwyck", name: "Randwyck" },
  { slug: "city-centre", name: "City centre (private room)" },
  { slug: "wyck", name: "Wyck / Céramique" },
  { slug: "other", name: "Other / prefer not to say" }
] as const;
export type ResidenceSlug = (typeof RESIDENCES)[number]["slug"];

export function isResidence(value: unknown): value is ResidenceSlug {
  return typeof value === "string" && RESIDENCES.some((residence) => residence.slug === value);
}

export function residenceName(slug: string | null | undefined) {
  return RESIDENCES.find((residence) => residence.slug === slug)?.name ?? null;
}

export interface ResidenceRow {
  residence: string;
  items: number;
  kg: number;
}

/** Ranking: most CO2 saved first. "other" never competes; rows under the minimum are hidden. */
export function rankResidences(rows: ResidenceRow[], minimumItems = 3) {
  return rows
    .filter((row) => row.residence !== "other" && isResidence(row.residence) && row.items >= minimumItems)
    .sort((left, right) => right.kg - left.kg || right.items - left.items);
}

// ── Ambassadors ──────────────────────────────────────────────────────────────
export const AMBASSADOR_LEVELS = [
  { level: "ambassador", invites: 5 },
  { level: "gold", invites: 15 }
] as const;

/** 5 friends who joined = ambassador; 15 = gold ambassador. */
export function ambassadorLevel(invites: number): "gold" | "ambassador" | null {
  if (invites >= 15) return "gold";
  if (invites >= 5) return "ambassador";
  return null;
}

export function invitesToNextLevel(invites: number) {
  if (invites < 5) return 5 - invites;
  if (invites < 15) return 15 - invites;
  return 0;
}

// ── 48-hour moving-out clearance ─────────────────────────────────────────────
export const CLEARANCE_HOURS = 48;
export const CLEARANCE_DISCOUNTS = [10, 20, 30, 50] as const;

/** New price after the cut, rounded to 50 cents and never below 1 euro. */
export function clearancePrice(price: number, percent: number) {
  if (!(price > 0) || !CLEARANCE_DISCOUNTS.includes(percent as (typeof CLEARANCE_DISCOUNTS)[number])) return null;
  const cut = Math.round(price * (1 - percent / 100) * 2) / 2;
  return Math.max(1, cut);
}

/** "1 d 6 h", "5 h 20 min", "12 min" left; null once it has ended. */
export function timeLeft(until: string | Date | null | undefined, now = Date.now()) {
  if (!until) return null;
  const ms = new Date(until).getTime() - now;
  if (!(ms > 0)) return null;
  const minutes = Math.floor(ms / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days) return { days, hours, minutes: mins };
  return { days: 0, hours, minutes: mins };
}

// ── Hidden minimum price ─────────────────────────────────────────────────────
/** The minimum must make sense: above 0 and below the asking price. */
export function validMinimum(minimum: number, price: number) {
  return Number.isFinite(minimum) && minimum > 0 && minimum < price;
}

/** An offer is accepted on its own when it reaches the seller's hidden minimum. */
export function shouldAutoAccept(offer: number, minimum: number | null | undefined) {
  return typeof minimum === "number" && minimum > 0 && offer >= minimum;
}

// ── Bump ─────────────────────────────────────────────────────────────────────
export const BUMP_PRICE_EUR = 0.99;
/** One bump a day at most: paying twice in a row would only waste the seller's money. */
export function canBump(bumpedAt: string | null | undefined, now = Date.now()) {
  return !bumpedAt || now - new Date(bumpedAt).getTime() >= 24 * 3600_000;
}
