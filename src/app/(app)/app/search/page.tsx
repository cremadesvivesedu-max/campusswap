import { SearchExperience } from "@/components/marketplace/search-experience";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";
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

  const [categories, listings, recentSearches, trendingSearches, dictionary] = await Promise.all([
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
    getTrendingSearches(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.search.eyebrow}
        title={dictionary.search.title}
        description={dictionary.search.description}
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
