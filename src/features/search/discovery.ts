import type { Listing, ListingCondition } from "@/types/domain";

export type ListingSortOption =
  | "recommended"
  | "relevance"
  | "newest"
  | "price-low-high"
  | "price-high-low";

export interface DiscoveryFilters {
  query: string;
  categorySlug?: string;
  subcategorySlug?: string;
  priceMin?: number;
  priceMax?: number;
  conditions: ListingCondition[];
  outletOnly: boolean;
  featuredOnly: boolean;
  minimumSellerRating?: number;
  sort: ListingSortOption;
}

interface SubcategoryOption {
  slug: string;
  label: string;
  keywords: string[];
}

export const categorySubcategories: Record<string, SubcategoryOption[]> = {
  furniture: [
    { slug: "desks", label: "Desks", keywords: ["desk", "study"] },
    { slug: "chairs", label: "Chairs", keywords: ["chair", "seat"] },
    { slug: "storage", label: "Storage", keywords: ["storage", "bookcase", "shelf"] }
  ],
  bikes: [
    { slug: "city-bikes", label: "City bikes", keywords: ["bike", "city", "lock"] },
    { slug: "commuter-ready", label: "Commuter ready", keywords: ["lights", "basket", "commute"] }
  ],
  electronics: [
    { slug: "monitors", label: "Monitors", keywords: ["monitor", "screen", "hdmi"] },
    { slug: "audio", label: "Audio", keywords: ["headphones", "speaker", "audio"] }
  ],
  "kitchen-equipment": [
    { slug: "cookware", label: "Cookware", keywords: ["pan", "pot", "kitchen"] },
    { slug: "appliances", label: "Appliances", keywords: ["cooker", "kettle", "appliance"] }
  ],
  "household-items": [
    { slug: "lighting", label: "Lighting", keywords: ["lamp", "light"] },
    { slug: "storage", label: "Storage", keywords: ["storage", "bookcase", "organizer"] }
  ],
  "essentials-daily-living": [
    { slug: "bedding", label: "Bedding", keywords: ["bedding", "duvet", "pillow"] },
    { slug: "move-in", label: "Move-in basics", keywords: ["essential", "move-in", "daily"] }
  ],
  outlet: [
    { slug: "urgent", label: "Urgent", keywords: ["urgent", "outlet"] },
    { slug: "repairable", label: "Repairable", keywords: ["damaged", "wheel", "fair", "needs"] }
  ],
  "textbooks-study-materials": [
    { slug: "course-books", label: "Course books", keywords: ["textbook", "law", "course"] },
    { slug: "notes", label: "Notes", keywords: ["summary", "notes"] }
  ]
};

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function getListingSearchText(listing: Listing) {
  return `${listing.title} ${listing.description} ${listing.tags.join(" ")}`.toLowerCase();
}

function scoreRelevance(listing: Listing, filters: DiscoveryFilters) {
  const tokens = tokenize(filters.query);
  const haystack = getListingSearchText(listing);
  const tokenScore = tokens.reduce(
    (score, token) => score + (haystack.includes(token) ? 4 : 0),
    0
  );
  const freshnessBonus = Math.max(
    1,
    10 -
      Math.floor(
        (Date.now() - Date.parse(listing.createdAt)) / (1000 * 60 * 60 * 24)
      )
  );
  return tokenScore + listing.saveCount + listing.viewCount + freshnessBonus;
}

export function getSubcategories(categorySlug?: string) {
  return categorySlug ? categorySubcategories[categorySlug] ?? [] : [];
}

export function filterListings(listings: Listing[], filters: DiscoveryFilters) {
  let results = listings.filter(
    (listing) =>
      listing.status !== "hidden" &&
      listing.status !== "archived" &&
      listing.status !== "sold" &&
      listing.status !== "pending-review"
  );

  if (filters.query.trim()) {
    const tokens = tokenize(filters.query);
    results = results.filter((listing) =>
      tokens.every((token) => getListingSearchText(listing).includes(token))
    );
  }

  if (filters.categorySlug) {
    results = results.filter((listing) => listing.categorySlug === filters.categorySlug);
  }

  if (filters.subcategorySlug && filters.categorySlug) {
    const subcategory = getSubcategories(filters.categorySlug).find(
      (item) => item.slug === filters.subcategorySlug
    );
    if (subcategory) {
      results = results.filter((listing) =>
        subcategory.keywords.some((keyword) =>
          getListingSearchText(listing).includes(keyword)
        )
      );
    }
  }

  if (typeof filters.priceMin === "number") {
    const minimumPrice = filters.priceMin;
    results = results.filter((listing) => listing.price >= minimumPrice);
  }

  if (typeof filters.priceMax === "number") {
    const maximumPrice = filters.priceMax;
    results = results.filter((listing) => listing.price <= maximumPrice);
  }

  if (filters.conditions.length) {
    results = results.filter((listing) => filters.conditions.includes(listing.condition));
  }

  if (filters.outletOnly) {
    results = results.filter((listing) => listing.outlet);
  }

  if (filters.featuredOnly) {
    results = results.filter((listing) => listing.featured);
  }

  if (typeof filters.minimumSellerRating === "number") {
    const minimumSellerRating = filters.minimumSellerRating;
    results = results.filter(
      (listing) => listing.sellerRating >= minimumSellerRating
    );
  }

  return [...results].sort((left, right) => {
    if (filters.sort === "newest") {
      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    }
    if (filters.sort === "price-low-high") {
      return left.price - right.price;
    }
    if (filters.sort === "price-high-low") {
      return right.price - left.price;
    }
    return scoreRelevance(right, filters) - scoreRelevance(left, filters);
  });
}
