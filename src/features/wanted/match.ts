import { titleKeywords } from "@/features/listings/price-suggestion";

export interface WantedLike {
  title: string;
  categorySlug?: string | null;
  maxPrice?: number | null;
}

export interface ListingLike {
  title: string;
  description?: string;
  categorySlug: string;
  price: number;
}

/**
 * A listing answers a request when it shares a meaningful word with the request,
 * is in the same category (if the request picked one) and fits the budget.
 */
export function listingMatchesWanted(request: WantedLike, listing: ListingLike) {
  if (request.categorySlug && request.categorySlug !== listing.categorySlug) {
    return false;
  }

  if (request.maxPrice && request.maxPrice > 0 && listing.price > request.maxPrice) {
    return false;
  }

  const wanted = titleKeywords(request.title);
  if (!wanted.length) {
    return false;
  }

  const offered = new Set(titleKeywords(`${listing.title} ${listing.description ?? ""}`));
  return wanted.some((word) => offered.has(word) || offered.has(singular(word)) || offered.has(`${word}s`));
}

function singular(word: string) {
  return word.endsWith("s") ? word.slice(0, -1) : word;
}
