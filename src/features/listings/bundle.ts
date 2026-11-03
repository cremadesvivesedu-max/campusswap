import { roundPrice } from "@/features/listings/price-suggestion";

export interface BundleItem {
  id: string;
  title: string;
  price: number;
}

/** A friendly opening offer for several items: the seller's own discount, or about 10% off the total. */
export function suggestBundlePrice(total: number, sellerDiscount?: number | null) {
  if (total <= 0) return 0;
  if (sellerDiscount) return Math.round(total * (100 - sellerDiscount)) / 100;
  const offer = roundPrice(total * 0.9);
  return offer < total ? offer : Math.max(1, Math.floor(total - 1));
}

/** The chat message the seller receives (kept language-neutral with symbols). */
export function buildBundleMessage(items: BundleItem[], offer: number, siteUrl: string, appliedDiscount?: number | null) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const lines = items.map((item) => `• ${item.title} — €${item.price}\n  ${siteUrl}/app/listings/${item.id}`);
  return [`📦 Bundle (${items.length})`, ...lines, `Σ €${total} → 💬 €${offer}?${appliedDiscount ? ` (−${appliedDiscount}%)` : ""}`].join("\n");
}
