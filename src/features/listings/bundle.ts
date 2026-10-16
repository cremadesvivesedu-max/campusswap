import { roundPrice } from "@/features/listings/price-suggestion";

export interface BundleItem {
  id: string;
  title: string;
  price: number;
}

/** A friendly opening offer for several items: about 10% off the total. */
export function suggestBundlePrice(total: number) {
  if (total <= 0) return 0;
  const offer = roundPrice(total * 0.9);
  return offer < total ? offer : Math.max(1, Math.floor(total - 1));
}

/** The chat message the seller receives (kept language-neutral with symbols). */
export function buildBundleMessage(items: BundleItem[], offer: number, siteUrl: string) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const lines = items.map((item) => `• ${item.title} — €${item.price}\n  ${siteUrl}/app/listings/${item.id}`);
  return [`📦 Bundle (${items.length})`, ...lines, `Σ €${total} → 💬 €${offer}?`].join("\n");
}
