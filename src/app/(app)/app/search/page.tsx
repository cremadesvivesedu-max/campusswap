import { SearchExperience } from "@/components/marketplace/search-experience";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getAllCategories,
  getRecentSearches,
  getTrendingSearches,
  searchMarketplaceListings
} from "@/server/queries/marketplace";
import type { ListingCondition } from "@/types/domain";

function parseNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : undefined;
  const categorySlug = typeof params.category === "string" ? params.category : undefined;
  const subcategorySlug =
    typeof params.subcategory === "string" ? params.subcategory : undefined;
  const conditions =
    typeof params.conditions === "string"
      ? (params.conditions.split(",").filter(Boolean) as ListingCondition[])
      : undefined;

  const [categories, listings, recentSearches, trendingSearches] = await Promise.all([
    getAllCategories(),
    searchMarketplaceListings({
      query,
      categorySlug,
      subcategorySlug,
      priceMin: parseNumber(typeof params.min === "string" ? params.min : undefined),
      priceMax: parseNumber(typeof params.max === "string" ? params.max : undefined),
      condition: conditions,
      outlet: typeof params.outlet === "string" ? params.outlet === "1" : undefined,
      featured:
        typeof params.featured === "string" ? params.featured === "1" : undefined,
      minimumSellerRating: parseNumber(
        typeof params.rating === "string" ? params.rating : undefined
      ),
      sort: typeof params.sort === "string" ? params.sort as never : undefined
    }),
    getRecentSearches(),
    getTrendingSearches()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Search & discovery"
        title="Fast browsing for when you need to decide quickly."
        description="Search, filters, subcategories, and sorting all update the result set in real time so buyers can compare options without friction."
      />
      <SearchExperience
        listings={listings}
        categories={categories}
        recentSearches={recentSearches}
        trendingSearches={trendingSearches}
      />
    </div>
  );
}
