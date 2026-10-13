import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, MapPin } from "lucide-react";
import { ListingImage } from "@/components/marketplace/listing-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoveOutCountdown } from "@/features/profile/moving-sale";
import { getConditionLabel, getDictionaryForRequest } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { formatCurrency } from "@/lib/utils";
import { getMovingSale } from "@/server/queries/moving-sale";

// Public "moving sale" page: every item a student still has for sale, with a countdown
// to their moving day. Shared as one link on WhatsApp or Instagram.

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [sale, dictionary] = await Promise.all([getMovingSale(id), getDictionaryForRequest()]);
  const copy = dictionary.movingSale;

  if (!sale) {
    return buildMetadata(copy.notFoundTitle, copy.pageDescription);
  }

  const title = sale.firstName
    ? copy.pageTitle.replace("{name}", sale.firstName)
    : copy.pageTitleNoName;
  const cover = sale.listings
    .flatMap((listing) => listing.images)
    .find((image) => image.isPrimary);
  const base = buildMetadata(title, copy.pageDescription);

  return {
    ...base,
    alternates: { canonical: `/m/${sale.sellerId}` },
    openGraph: {
      ...base.openGraph,
      url: `${getSiteUrl()}/m/${sale.sellerId}`,
      images: cover ? [{ url: new URL(cover.url, getSiteUrl()).toString(), alt: cover.alt }] : undefined
    }
  };
}

export default async function MovingSalePage({ params }: PageProps) {
  const { id } = await params;
  const [sale, dictionary] = await Promise.all([getMovingSale(id), getDictionaryForRequest()]);
  const copy = dictionary.movingSale;

  if (!sale) {
    return (
      <section className="mx-auto max-w-xl space-y-5 px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-slate-950">{copy.notFoundTitle}</h1>
        <Button asChild>
          <Link href="/featured">{dictionary.sharePage.browse}</Link>
        </Button>
      </section>
    );
  }

  const title = sale.firstName
    ? copy.pageTitle.replace("{name}", sale.firstName)
    : copy.pageTitleNoName;

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 pt-6 sm:px-6 lg:pt-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {copy.pageEyebrow}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{copy.pageDescription}</p>
        <div className="flex flex-wrap items-center gap-3">
          {sale.daysLeft !== null ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-900">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {formatMoveOutCountdown(sale.daysLeft, copy)}
            </span>
          ) : null}
          {sale.listings.length ? (
            <span className="text-sm font-medium text-slate-600">
              {copy.itemsCount.replace("{count}", String(sale.listings.length))}
            </span>
          ) : null}
        </div>
      </header>

      {sale.listings.length ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sale.listings.map((listing) => {
            const cover = listing.images.find((image) => image.isPrimary) ?? listing.images.at(0);
            return (
              <li key={listing.id}>
                <Link
                  href={`/l/${listing.id}`}
                  className="group block overflow-hidden rounded-[22px] border border-slate-200 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <div className="relative aspect-square bg-slate-100">
                    <ListingImage
                      src={cover?.url}
                      alt={cover?.alt ?? listing.title}
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    {listing.status === "reserved" ? (
                      <Badge className="absolute left-2 top-2 bg-amber-100 text-amber-900">
                        {copy.reserved}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-950 group-hover:underline">
                      {listing.title}
                    </p>
                    <p className="font-display text-lg font-semibold text-slate-950">
                      {formatCurrency(listing.price)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getConditionLabel(dictionary, listing.condition)}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {listing.pickupArea}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-slate-950">{copy.noItemsTitle}</h2>
          <p className="text-sm text-slate-600">{copy.noItemsBody}</p>
          <Button asChild>
            <Link href="/featured">{dictionary.sharePage.browse}</Link>
          </Button>
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 text-center sm:p-6">
        <p className="text-sm text-slate-600">{dictionary.sharePage.ctaHint}</p>
        <div className="mx-auto mt-4 grid max-w-md gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link href={`/login?next=${encodeURIComponent(`/m/${sale.sellerId}`)}`}>
              {dictionary.site.logIn}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/signup?next=${encodeURIComponent(`/m/${sale.sellerId}`)}`}>
              {dictionary.sharePage.signup}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
