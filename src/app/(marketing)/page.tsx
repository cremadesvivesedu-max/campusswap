import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, PackageSearch, Search, ShieldCheck, UserCheck } from "lucide-react";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Button } from "@/components/ui/button";
import { getCategoryBrowseHref } from "@/lib/category-links";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getAllCategories, getFeaturedListings } from "@/server/queries/marketplace";

// Public home in the same marketplace style as the app: say what it is, let people
// search, show real items, explain the three steps, then the details.
export default async function HomePage() {
  const [featured, categories, dictionary] = await Promise.all([
    getFeaturedListings(8),
    getAllCategories(),
    getDictionaryForRequest()
  ]);
  const copy = dictionary.landing;
  const old = dictionary.marketing.home;
  const steps = [
    { icon: UserCheck, title: copy.step1Title, body: copy.step1Body },
    { icon: PackageSearch, title: copy.step2Title, body: copy.step2Body },
    { icon: MapPin, title: copy.step3Title, body: copy.step3Body }
  ];

  return (
    <div className="space-y-14 pb-20 sm:space-y-20">
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-8">
        <div className="relative isolate overflow-hidden rounded-[28px] px-5 py-10 text-white sm:rounded-[40px] sm:px-10 sm:py-16">
          <Image
            src="/images/home/hero-move-in.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="-z-20 object-cover object-[center_35%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(10,22,44,0.92)_0%,rgba(10,22,44,0.78)_55%,rgba(10,22,44,0.4)_100%)]"
          />
          <div className="max-w-2xl space-y-6">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">{copy.heroTitle}</h1>
            <p className="text-base leading-7 text-slate-200 sm:text-lg">{copy.heroBody}</p>
            <form action="/app/search" role="search" className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchPlaceholder}
                className="h-14 w-full rounded-full border-0 bg-white pl-12 pr-4 text-base text-slate-900 shadow-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400"
              />
            </form>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/featured">{copy.explore}</Link>
              </Button>
              <Button asChild variant="ghost" className="border border-white/30 text-white hover:bg-white/10">
                <Link href="/signup">{copy.sell}</Link>
              </Button>
            </div>
          </div>
        </div>
        {categories.length ? (
          <ul className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <li key={category.id} className="shrink-0">
                <Link
                  href={getCategoryBrowseHref(category.slug)}
                  className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {featured.length ? (
        <section className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-950">{copy.featuredTitle}</h2>
            <Link href="/featured" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:underline">
              {dictionary.home.seeAll}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 8).map((listing) => (
              <ListingCard key={listing.id} listing={listing} publicLink />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
        <h2 className="text-2xl font-extrabold text-slate-950">{copy.howTitle}</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-3xl bg-white p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="space-y-1">
                <span className="block text-xs font-bold text-emerald-700">{index + 1}</span>
                <span className="block font-bold text-slate-950">{step.title}</span>
                <span className="block text-sm leading-6 text-slate-600">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
        <h2 className="text-2xl font-extrabold text-slate-950">{copy.surveyTitle}</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {old.testimonials.map((line) => (
            <p key={line} className="rounded-3xl bg-white p-5 text-sm leading-6 text-slate-700">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <div className="relative aspect-[3/2] overflow-hidden rounded-[28px] bg-slate-100">
          <Image
            src="/images/home/trust-exchange.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-950">{copy.trustTitle}</h2>
          <ul className="space-y-3">
            {old.trustSignals.map((signal) => (
              <li key={signal} className="flex gap-3 text-sm leading-6 text-slate-700">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-4 px-4 text-center sm:px-6">
        <h2 className="text-2xl font-extrabold text-slate-950">{copy.waitlistTitle}</h2>
        <p className="text-sm text-slate-600">{copy.waitlistBody}</p>
        <div className="mx-auto max-w-md text-left">
          <WaitlistForm />
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-4 px-4 sm:px-6">
        <h2 className="text-2xl font-extrabold text-slate-950">{copy.faqTitle}</h2>
        <div className="divide-y divide-slate-200 rounded-3xl bg-white">
          {dictionary.marketing.faq.items.map((faq) => (
            <details key={faq.question} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
