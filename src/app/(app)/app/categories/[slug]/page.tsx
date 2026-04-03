import { notFound } from "next/navigation";
import { SearchExperience } from "@/components/marketplace/search-experience";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getAllCategories,
  getCategoryBySlug,
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

export default async function CategoryDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const conditions =
    typeof queryParams.conditions === "string"
      ? (queryParams.conditions.split(",").filter(Boolean) as ListingCondition[])
      : undefined;
  const [category, categories, listings] = await Promise.all([
    getCategoryBySlug(slug),
    getAllCategories(),
    searchMarketplaceListings({
      query: typeof queryParams.q === "string" ? queryParams.q : undefined,
      categorySlug: slug,
      subcategorySlug:
        typeof queryParams.subcategory === "string"
          ? queryParams.subcategory
          : undefined,
      priceMin: parseNumber(
        typeof queryParams.min === "string" ? queryParams.min : undefined
      ),
      priceMax: parseNumber(
        typeof queryParams.max === "string" ? queryParams.max : undefined
      ),
      condition: conditions,
      outlet:
        typeof queryParams.outlet === "string"
          ? queryParams.outlet === "1"
          : undefined,
      featured:
        typeof queryParams.featured === "string"
          ? queryParams.featured === "1"
          : undefined,
      minimumSellerRating: parseNumber(
        typeof queryParams.rating === "string" ? queryParams.rating : undefined
      ),
      sort:
        typeof queryParams.sort === "string"
          ? (queryParams.sort as never)
          : undefined
    })
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Category"
        title={category.name}
        description={category.heroDescription}
      />
      <SearchExperience
        listings={listings}
        categories={categories}
        lockedCategorySlug={slug}
      />
    </div>
  );
}
