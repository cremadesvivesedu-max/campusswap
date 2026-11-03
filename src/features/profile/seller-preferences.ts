// Seller settings kept in the Supabase auth user metadata, like the moving day, so no
// schema change is needed. A user can write their own metadata directly, so every value
// is checked again when it is read.
import { parseMoveOutDate } from "@/features/profile/moving-sale";

export const BUNDLE_DISCOUNT_METADATA_KEY = "bundle_discount_percent";
export const AWAY_UNTIL_METADATA_KEY = "away_until";
export const BUNDLE_DISCOUNT_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

export interface SellerPreferences {
  bundleDiscount: number | null;
  awayUntil: string | null;
}

/** One of the offered percentages; anything else means no discount. */
export function parseBundleDiscount(value: unknown) {
  const percent = typeof value === "string" && value.trim() ? Number(value) : value;
  return (BUNDLE_DISCOUNT_OPTIONS as readonly unknown[]).includes(percent) ? (percent as number) : null;
}

/** A return date after today and within a year; null once the seller is back. */
export function parseAwayUntil(value: unknown, now = new Date()) {
  const date = parseMoveOutDate(value, now);
  return date && date !== now.toISOString().slice(0, 10) ? date : null;
}

export function formatAwayDate(value: string, locale: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  });
}
