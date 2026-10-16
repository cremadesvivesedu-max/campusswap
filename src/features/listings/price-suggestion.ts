// Suggests a price from what similar things were listed or sold for on CampusSwap.
// Similar = same category and sharing a meaningful word with the title; if too few
// of those exist, the whole category is used instead.

export interface PricePoint {
  title: string;
  price: number;
  sold?: boolean;
}

export interface PriceSuggestion {
  low: number;
  high: number;
  typical: number;
  count: number;
  basis: "similar" | "category";
}

const stopWords = new Set([
  "the", "and", "for", "with", "from", "set", "very", "good", "new", "used", "like", "great",
  "con", "para", "muy", "nuevo", "nueva", "usado", "bueno", "buen", "estado", "del", "las", "los", "una", "uno",
  "met", "voor", "van", "een", "het", "nieuw", "goede", "staat"
]);

export function titleKeywords(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && !stopWords.has(word) && !/^\d+$/.test(word));
}

function quantile(sorted: number[], q: number) {
  const position = (sorted.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

/** Round to prices people actually use: whole euros under 20, then steps of 5. */
export function roundPrice(value: number) {
  if (value < 20) return Math.max(1, Math.round(value));
  return Math.round(value / 5) * 5;
}

export function suggestPrice(title: string, points: PricePoint[], minimum = 3): PriceSuggestion | null {
  const clean = points.filter((point) => Number.isFinite(point.price) && point.price > 0);
  const keywords = new Set(titleKeywords(title));
  const similar = keywords.size
    ? clean.filter((point) => titleKeywords(point.title).some((word) => keywords.has(word)))
    : [];
  const basis: PriceSuggestion["basis"] = similar.length >= minimum ? "similar" : "category";
  const pool = basis === "similar" ? similar : clean;

  if (pool.length < minimum) {
    return null;
  }

  const prices = pool.map((point) => point.price).sort((a, b) => a - b);
  const low = roundPrice(quantile(prices, 0.25));
  const high = Math.max(low, roundPrice(quantile(prices, 0.75)));
  const typical = Math.min(high, Math.max(low, roundPrice(quantile(prices, 0.5))));

  return { low, high, typical, count: pool.length, basis };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** About 15% off, rounded to an everyday price, and always actually lower. */
export function suggestPriceDrop(price: number) {
  if (!Number.isFinite(price) || price <= 3) return null;
  const suggested = roundPrice(price * 0.85);
  if (suggested < price) return suggested;
  const fallback = Math.floor(price - 1);
  return fallback >= 1 ? fallback : null;
}

/** Listed for a week or more with nobody writing: time to nudge the price. */
export function isStaleListing(input: { createdAt: string; chats: number; status: string }, now = new Date()) {
  return input.status === "active" && input.chats === 0 && now.getTime() - Date.parse(input.createdAt) >= 7 * DAY_MS;
}

export function daysListed(createdAt: string, now = new Date()) {
  return Math.floor((now.getTime() - Date.parse(createdAt)) / DAY_MS);
}
