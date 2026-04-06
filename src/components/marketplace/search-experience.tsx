"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useLocale } from "@/components/providers/locale-provider";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { isLiveClientMode } from "@/lib/public-env";
import {
  filterListings,
  getSubcategories,
  type DiscoveryFilters
} from "@/features/search/discovery";
import { getConditionLabel } from "@/lib/i18n-shared";
import { recordSearchEventAction } from "@/server/actions/marketplace";
import type { Category, Listing, ListingCondition } from "@/types/domain";

interface SearchExperienceProps {
  listings: Listing[];
  categories: Category[];
  recentSearches?: string[];
  trendingSearches?: string[];
  lockedCategorySlug?: string;
  messageActionMode?: "chat" | "signup";
}

const conditionOptions: ListingCondition[] = [
  "like-new",
  "good",
  "fair",
  "needs-love"
];

function parseNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function SearchExperience({
  listings,
  categories,
  recentSearches = [],
  trendingSearches = [],
  lockedCategorySlug,
  messageActionMode = "chat"
}: SearchExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { dictionary } = useLocale();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [categorySlug, setCategorySlug] = useState(
    lockedCategorySlug ?? searchParams.get("category") ?? ""
  );
  const [subcategorySlug, setSubcategorySlug] = useState(
    searchParams.get("subcategory") ?? ""
  );
  const [priceMin, setPriceMin] = useState<string>(searchParams.get("min") ?? "");
  const [priceMax, setPriceMax] = useState<string>(searchParams.get("max") ?? "");
  const [conditions, setConditions] = useState<ListingCondition[]>(
    (searchParams.get("conditions")?.split(",").filter(Boolean) as ListingCondition[]) ?? []
  );
  const [outletOnly, setOutletOnly] = useState(searchParams.get("outlet") === "1");
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "1");
  const [minimumSellerRating, setMinimumSellerRating] = useState<string>(
    searchParams.get("rating") ?? ""
  );
  const [sort, setSort] = useState<DiscoveryFilters["sort"]>(
    (searchParams.get("sort") as DiscoveryFilters["sort"]) ?? "recommended"
  );

  useEffect(() => {
    if (lockedCategorySlug) {
      setCategorySlug(lockedCategorySlug);
    }
  }, [lockedCategorySlug]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setSubcategorySlug(searchParams.get("subcategory") ?? "");
    setPriceMin(searchParams.get("min") ?? "");
    setPriceMax(searchParams.get("max") ?? "");
    setConditions(
      (searchParams.get("conditions")?.split(",").filter(Boolean) as ListingCondition[]) ?? []
    );
    setOutletOnly(searchParams.get("outlet") === "1");
    setFeaturedOnly(searchParams.get("featured") === "1");
    setMinimumSellerRating(searchParams.get("rating") ?? "");
    setSort((searchParams.get("sort") as DiscoveryFilters["sort"]) ?? "recommended");

    if (!lockedCategorySlug) {
      setCategorySlug(searchParams.get("category") ?? "");
    }
  }, [lockedCategorySlug, searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const values: Record<string, string | undefined> = {
      q: query || undefined,
      category: lockedCategorySlug ? undefined : categorySlug || undefined,
      subcategory: subcategorySlug || undefined,
      min: priceMin || undefined,
      max: priceMax || undefined,
      conditions: conditions.length ? conditions.join(",") : undefined,
      outlet: outletOnly ? "1" : undefined,
      featured: featuredOnly ? "1" : undefined,
      rating: minimumSellerRating || undefined,
      sort: sort !== "recommended" ? sort : undefined
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    }

    const nextQuery = nextParams.toString();
    if (nextQuery !== searchParams.toString()) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false
      });
    }
  }, [
    categorySlug,
    conditions,
    featuredOnly,
    lockedCategorySlug,
    minimumSellerRating,
    outletOnly,
    pathname,
    priceMax,
    priceMin,
    query,
    router,
    searchParams,
    sort,
    subcategorySlug
  ]);

  useEffect(() => {
    if (!isLiveClientMode || query.trim().length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void recordSearchEventAction(query, lockedCategorySlug || categorySlug || undefined);
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [categorySlug, lockedCategorySlug, query]);

  const filters = useMemo<DiscoveryFilters>(
    () => ({
      query,
      categorySlug: categorySlug || undefined,
      subcategorySlug: subcategorySlug || undefined,
      priceMin: parseNumber(priceMin),
      priceMax: parseNumber(priceMax),
      conditions,
      outletOnly,
      featuredOnly,
      minimumSellerRating: parseNumber(minimumSellerRating),
      sort
    }),
    [
      categorySlug,
      conditions,
      featuredOnly,
      minimumSellerRating,
      outletOnly,
      priceMax,
      priceMin,
      query,
      sort,
      subcategorySlug
    ]
  );

  const results = useMemo(() => {
    if (isLiveClientMode) {
      return listings;
    }

    return filterListings(listings, filters);
  }, [filters, listings]);
  const subcategories = useMemo(
    () => getSubcategories(categorySlug || lockedCategorySlug),
    [categorySlug, lockedCategorySlug]
  );
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];

    if (query) {
      chips.push({
        key: "query",
        label: `${dictionary.search.filterLabels.search}: ${query}`,
        clear: () => setQuery("")
      });
    }
    if (categorySlug && !lockedCategorySlug) {
      chips.push({
        key: "category",
        label: `${dictionary.search.filterLabels.category}: ${
          categories.find((category) => category.slug === categorySlug)?.name ?? categorySlug
        }`,
        clear: () => setCategorySlug("")
      });
    }
    if (subcategorySlug) {
      chips.push({
        key: "subcategory",
        label: `${dictionary.search.filterLabels.subcategory}: ${
          subcategories.find((subcategory) => subcategory.slug === subcategorySlug)?.label ??
          subcategorySlug
        }`,
        clear: () => setSubcategorySlug("")
      });
    }
    if (priceMin) {
      chips.push({
        key: "min",
        label: `${dictionary.search.filterLabels.min} ${priceMin}`,
        clear: () => setPriceMin("")
      });
    }
    if (priceMax) {
      chips.push({
        key: "max",
        label: `${dictionary.search.filterLabels.max} ${priceMax}`,
        clear: () => setPriceMax("")
      });
    }
    if (conditions.length) {
      chips.push({
        key: "conditions",
        label: `${dictionary.search.filterLabels.condition}: ${conditions
          .map((condition) => getConditionLabel(dictionary, condition))
          .join(", ")}`,
        clear: () => setConditions([])
      });
    }
    if (outletOnly) {
      chips.push({
        key: "outlet",
        label: dictionary.search.outletOnly,
        clear: () => setOutletOnly(false)
      });
    }
    if (featuredOnly) {
      chips.push({
        key: "featured",
        label: dictionary.search.featuredOnly,
        clear: () => setFeaturedOnly(false)
      });
    }
    if (minimumSellerRating) {
      chips.push({
        key: "rating",
        label: `${dictionary.search.filterLabels.sellerRating} ${minimumSellerRating}+`,
        clear: () => setMinimumSellerRating("")
      });
    }
    if (sort !== "recommended") {
      chips.push({
        key: "sort",
        label: `${dictionary.search.filterLabels.sort}: ${
          sort === "relevance"
            ? dictionary.search.sortOptions.relevance
            : sort === "newest"
              ? dictionary.search.sortOptions.newest
              : sort === "price-low-high"
                ? dictionary.search.sortOptions.priceLowHigh
                : dictionary.search.sortOptions.priceHighLow
        }`,
        clear: () => setSort("recommended")
      });
    }

    return chips;
  }, [
    categories,
    categorySlug,
    conditions,
    dictionary,
    featuredOnly,
    lockedCategorySlug,
    minimumSellerRating,
    outletOnly,
    priceMax,
    priceMin,
    query,
    sort,
    subcategories,
    subcategorySlug
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <SlidersHorizontal className="h-4 w-4" />
            {dictionary.search.controls}
          </div>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {dictionary.search.query}
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-10"
                  placeholder={dictionary.search.queryPlaceholder}
                />
              </div>
            </label>

            {!lockedCategorySlug ? (
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.search.categories}
                </span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        categorySlug === category.slug
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      onClick={() => {
                        setCategorySlug(categorySlug === category.slug ? "" : category.slug);
                        setSubcategorySlug("");
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {subcategories.length ? (
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.search.subcategories}
                </span>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory.slug}
                      type="button"
                      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        subcategorySlug === subcategory.slug
                          ? "bg-primary text-slate-950"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      onClick={() =>
                        setSubcategorySlug(
                          subcategorySlug === subcategory.slug ? "" : subcategory.slug
                        )
                      }
                    >
                      {subcategory.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.search.minPrice}
                </span>
                <Input
                  type="number"
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.search.maxPrice}
                </span>
                <Input
                  type="number"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                  placeholder="200"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {dictionary.search.condition}
              </span>
              <div className="flex flex-wrap gap-2">
                {conditionOptions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      conditions.includes(condition)
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    onClick={() =>
                      setConditions((currentConditions) =>
                        currentConditions.includes(condition)
                          ? currentConditions.filter((value) => value !== condition)
                          : [...currentConditions, condition]
                      )
                    }
                  >
                    {getConditionLabel(dictionary, condition)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
                <input
                  className="mr-2"
                  type="checkbox"
                  checked={outletOnly}
                  onChange={(event) => setOutletOnly(event.target.checked)}
                />
                {dictionary.search.outletOnly}
              </label>
              <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
                <input
                  className="mr-2"
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(event) => setFeaturedOnly(event.target.checked)}
                />
                {dictionary.search.featuredOnly}
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {dictionary.search.minimumSellerRating}
              </span>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minimumSellerRating}
                onChange={(event) => setMinimumSellerRating(event.target.value)}
                placeholder="4.5"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {dictionary.search.sort}
              </span>
              <select
                className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as DiscoveryFilters["sort"])
                }
              >
                <option value="recommended">{dictionary.search.sortOptions.recommended}</option>
                <option value="relevance">{dictionary.search.sortOptions.relevance}</option>
                <option value="newest">{dictionary.search.sortOptions.newest}</option>
                <option value="price-low-high">{dictionary.search.sortOptions.priceLowHigh}</option>
                <option value="price-high-low">{dictionary.search.sortOptions.priceHighLow}</option>
              </select>
            </label>
          </div>
        </div>

        {trendingSearches.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
            <p className="font-display text-xl font-semibold text-slate-950">
              {dictionary.search.trending}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button key={term} type="button" onClick={() => setQuery(term)}>
                  <Badge>{term}</Badge>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {recentSearches.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
            <p className="font-display text-xl font-semibold text-slate-950">
              {dictionary.search.recent}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button key={term} type="button" onClick={() => setQuery(term)}>
                  <Badge>{term}</Badge>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-2xl font-semibold text-slate-950">
                {results.length} {dictionary.search.results}
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {dictionary.search.resultsDescription}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              onClick={() => {
                setQuery("");
                if (!lockedCategorySlug) {
                  setCategorySlug("");
                }
                setSubcategorySlug("");
                setPriceMin("");
                setPriceMax("");
                setConditions([]);
                setOutletOnly(false);
                setFeaturedOnly(false);
                setMinimumSellerRating("");
                setSort("recommended");
              }}
            >
              {dictionary.search.clearAll}
            </button>
          </div>

          {activeFilterChips.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-sm font-medium text-white"
                >
                  {chip.label}
                  <X className="h-4 w-4" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {results.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {results.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                compact
                showMessageAction
                messageActionMode={messageActionMode}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={dictionary.search.emptyTitle}
            description={dictionary.search.emptyDescription}
          />
        )}
      </div>
    </div>
  );
}
