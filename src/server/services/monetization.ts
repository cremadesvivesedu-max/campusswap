import { demoData } from "@/lib/demo-data";
import type { PromotionType } from "@/types/domain";

export function getPricingForModule(type: PromotionType) {
  const label = type === "featured" ? "Featured listing price" : "Seller boost price";
  return demoData.pricingSettings.find((setting) => setting.label === label);
}

export function canPromoteListing(listingId: string) {
  const listing = demoData.listings.find((candidate) => candidate.id === listingId);
  return Boolean(listing && listing.status === "active");
}
