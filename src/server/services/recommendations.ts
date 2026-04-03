import { demoData } from "@/lib/demo-data";
import type { Listing, RecommendationBreakdown, User } from "@/types/domain";

function tokenMatchWeight(haystack: string, needles: string[]) {
  const lowerHaystack = haystack.toLowerCase();
  return needles.reduce((acc, needle) => (lowerHaystack.includes(needle.toLowerCase()) ? acc + 8 : acc), 0);
}

export function scoreListingForUser(user: User, listing: Listing): RecommendationBreakdown {
  let score = 0;
  const reasons: string[] = [];

  if (listing.sellerId === user.id || listing.status !== "active") {
    return { listingId: listing.id, score: -999, reasons: ["not eligible"] };
  }

  if (user.profile.preferredCategories.includes(listing.categorySlug)) {
    score += 30;
    reasons.push("matches your preferred categories");
  }

  const favorites = demoData.favorites.filter((favorite) => favorite.userId === user.id);
  const favoriteListings = demoData.listings.filter((candidate) => favorites.some((favorite) => favorite.listingId === candidate.id));
  const favoriteTags = favoriteListings.flatMap((candidate) => candidate.tags);
  const tagBoost = tokenMatchWeight(listing.tags.join(" "), favoriteTags);
  if (tagBoost > 0) {
    score += tagBoost;
    reasons.push("similar to items you saved");
  }

  const userSearches = demoData.searchEvents.filter((event) => event.userId === user.id);
  const searchBoost = tokenMatchWeight(`${listing.title} ${listing.description}`, userSearches.map((event) => event.query));
  if (searchBoost > 0) {
    score += searchBoost;
    reasons.push("close to your recent searches");
  }

  const recentViews = demoData.viewEvents.filter((event) => event.userId === user.id);
  if (recentViews.some((event) => event.listingId === listing.id)) {
    score -= 20;
  } else if (recentViews.some((event) => demoData.listings.find((candidate) => candidate.id === event.listingId)?.categorySlug === listing.categorySlug)) {
    score += 16;
    reasons.push("in a category you viewed recently");
  }

  if (listing.featured) {
    score += 18;
    reasons.push("featured listing boost");
  }

  if (listing.outlet && (userSearches.some((event) => event.query.includes("cheap")) || favoriteListings.some((candidate) => candidate.outlet || candidate.price <= 20))) {
    score += 20;
    reasons.push("fits your value-driven browsing");
  }

  if (listing.urgent) {
    score += 6;
    reasons.push("seller wants a fast pickup");
  }

  score += Math.round(listing.sellerRating * 4);
  score += Math.round(listing.sellerResponseRate * 10);
  score += Math.max(2, 15 - Math.round((Date.now() - Date.parse(listing.createdAt)) / (1000 * 60 * 60 * 18)));

  return { listingId: listing.id, score, reasons };
}

export function recommendListingsForUser(userId: string) {
  const user = demoData.users.find((candidate) => candidate.id === userId);
  if (!user) {
    return [];
  }

  return demoData.listings
    .map((listing) => ({ listing, breakdown: scoreListingForUser(user, listing) }))
    .filter((entry) => entry.breakdown.score > 0)
    .sort((left, right) => right.breakdown.score - left.breakdown.score)
    .slice(0, 8);
}
