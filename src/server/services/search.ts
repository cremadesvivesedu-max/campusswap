import { demoData } from "@/lib/demo-data";
import type { Listing, ListingSearchInput } from "@/types/domain";

function relevanceScore(listing: Listing, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${listing.title} ${listing.description} ${listing.tags.join(" ")}`.toLowerCase();
  return terms.reduce((acc, term) => acc + (haystack.includes(term) ? 2 : 0), 0);
}

export function searchListings(input: ListingSearchInput) {
  const query = input.query?.trim() ?? "";
  let results = demoData.listings.filter((listing) => listing.status === "active");

  if (query) {
    results = results.filter((listing) => relevanceScore(listing, query) > 0);
  }
  if (input.categorySlug) {
    results = results.filter((listing) => listing.categorySlug === input.categorySlug);
  }
  if (typeof input.priceMin === "number") {
    const minimumPrice = input.priceMin;
    results = results.filter((listing) => listing.price >= minimumPrice);
  }
  if (typeof input.priceMax === "number") {
    const maximumPrice = input.priceMax;
    results = results.filter((listing) => listing.price <= maximumPrice);
  }
  if (input.condition?.length) {
    results = results.filter((listing) => input.condition?.includes(listing.condition));
  }
  if (typeof input.outlet === "boolean") {
    results = results.filter((listing) => listing.outlet === input.outlet);
  }
  if (typeof input.featured === "boolean") {
    results = results.filter((listing) => listing.featured === input.featured);
  }
  if (typeof input.minimumSellerRating === "number") {
    const minimumSellerRating = input.minimumSellerRating;
    results = results.filter((listing) => listing.sellerRating >= minimumSellerRating);
  }

  const sort = input.sort ?? (query ? "relevance" : "recommended");
  return [...results].sort((left, right) => {
    if (sort === "price-low-high") return left.price - right.price;
    if (sort === "price-high-low") return right.price - left.price;
    if (sort === "newest") return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    if (sort === "recommended") return right.saveCount + right.viewCount - (left.saveCount + left.viewCount);
    return relevanceScore(right, query) - relevanceScore(left, query);
  });
}
