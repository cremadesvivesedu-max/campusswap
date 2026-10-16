import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Button } from "@/components/ui/button";
import { suggestPrice } from "@/features/listings/price-suggestion";
import { categoryLandings, getCategoryLanding } from "@/features/seo/category-landings";
import { getSiteUrl } from "@/lib/site-url";
import { getListingsByCategory } from "@/server/queries/marketplace";

export function generateStaticParams() {
  return categoryLandings.map((landing) => ({ slug: landing.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const landing = getCategoryLanding(slug);

  if (!landing) {
    return {};
  }

  const url = `${getSiteUrl()}/maastricht/${landing.slug}`;
  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical: url },
    openGraph: { title: landing.title, description: landing.description, url, type: "website" }
  };
}

// SEO landing page: what people search for, the items available right now, and honest tips.
export default async function CategoryLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landing = getCategoryLanding(slug);

  if (!landing) {
    notFound();
  }

  const listings = await getListingsByCategory(landing.categorySlug);
  const available = listings.filter((listing) => listing.status === "active").slice(0, 12);
  const priceRange = suggestPrice(
    "",
    listings.map((listing) => ({ title: listing.title, price: listing.price }))
  );
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: landing.h1,
        itemListElement: available.map((listing, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/l/${listing.id}`,
          name: listing.title
        }))
      },
      {
        "@type": "FAQPage",
        mainEntity: landing.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      }
    ]
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <header className="max-w-3xl space-y-4">
        <nav className="text-xs text-slate-500">
          <Link href="/" className="hover:underline">
            CampusSwap
          </Link>{" "}
          / Maastricht
        </nav>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">{landing.h1}</h1>
        <p className="text-base leading-7 text-slate-600">{landing.intro}</p>
        {priceRange ? (
          <p className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            Typical price on CampusSwap: €{priceRange.low}–€{priceRange.high}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/signup">Join free with your student email</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Sell yours</Link>
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-950">Available now</h2>
        {available.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {available.map((listing) => (
              <ListingCard key={listing.id} listing={listing} publicLink />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-white p-5 text-sm text-slate-600">
            Nothing listed right now. Join and post a request — we will tell you the moment one appears.
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl bg-white p-6">
          <h2 className="text-xl font-extrabold text-slate-950">Tips before you buy</h2>
          <ul className="space-y-3">
            {landing.tips.map((tip) => (
              <li key={tip} className="flex gap-3 text-sm leading-6 text-slate-700">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-3xl bg-white p-6">
          <h2 className="text-xl font-extrabold text-slate-950">Questions</h2>
          <div className="divide-y divide-slate-100">
            {landing.faq.map((item) => (
              <details key={item.question} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" aria-hidden="true" />
                </summary>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <nav className="space-y-3">
        <h2 className="text-lg font-bold text-slate-950">More in Maastricht</h2>
        <ul className="flex flex-wrap gap-2">
          {categoryLandings
            .filter((other) => other.slug !== landing.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/maastricht/${other.slug}`}
                  className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {other.h1}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}
