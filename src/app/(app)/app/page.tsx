import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getDictionaryForRequest } from "@/lib/i18n";
import {
  getAllCategories,
  getFeaturedListings,
  getHomeFeed
} from "@/server/queries/marketplace";

// Marketplace home in the Wallapop/Vinted mould: search first, categories as chips,
// then products. Explanations live on the public pages, not here.
export default async function AppHomePage() {
  const [dictionary, categories, feed, featuredListings] = await Promise.all([
    getDictionaryForRequest(),
    getAllCategories(),
    getHomeFeed(24),
    getFeaturedListings(4)
  ]);
  const copy = dictionary.home;

  return (
    <div className="space-y-7">
      <form action="/app/search" role="search" className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          placeholder={copy.searchPlaceholder}
          aria-label={copy.searchPlaceholder}
          className="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
        />
      </form>

      {categories.length ? (
        <nav aria-label={dictionary.nav.public.categories}>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <li key={category.id} className="shrink-0">
                <Link
                  href={`/app/search?category=${encodeURIComponent(category.slug)}`}
                  className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {featuredListings.length ? (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-slate-950">{copy.featured}</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-slate-950">{copy.newest}</h2>
          <Link
            href="/app/search?sort=newest"
            className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:underline"
          >
            {copy.seeAll}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {feed.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {feed.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState title={copy.emptyTitle} description={copy.emptyBody} />
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-extrabold text-slate-950">{copy.sellTitle}</p>
          <p className="text-sm text-slate-600">{copy.sellBody}</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/app/sell">{copy.sellCta}</Link>
        </Button>
      </section>
    </div>
  );
}
