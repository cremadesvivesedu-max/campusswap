import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ListingImage } from "@/components/marketplace/listing-image";
import { ShareListingButtons } from "@/components/marketplace/share-listing-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getConditionLabel, getDictionaryForRequest, getListingStatusLabel } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { formatCurrency } from "@/lib/utils";
import { getListingById } from "@/server/queries/marketplace";

// Public page for a shared listing link: readable without an account, so WhatsApp and
// Instagram can build a preview and people who are not signed up yet still see the item.

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) {
    return buildMetadata("Listing not available", "Buy and sell student essentials in Maastricht.");
  }

  const title = `${listing.title} · ${formatCurrency(listing.price)}`;
  const description = listing.description.slice(0, 180);
  const cover = listing.images.find((image) => image.isPrimary) ?? listing.images.at(0);
  const base = buildMetadata(title, description);

  return {
    ...base,
    alternates: { canonical: `/l/${listing.id}` },
    openGraph: {
      ...base.openGraph,
      url: `${getSiteUrl()}/l/${listing.id}`,
      images: cover ? [{ url: new URL(cover.url, getSiteUrl()).toString(), alt: cover.alt }] : undefined
    },
    twitter: {
      ...base.twitter,
      images: cover ? [new URL(cover.url, getSiteUrl()).toString()] : undefined
    }
  };
}

export default async function SharedListingPage({ params }: PageProps) {
  const { id } = await params;
  const [listing, dictionary] = await Promise.all([getListingById(id), getDictionaryForRequest()]);
  const copy = dictionary.sharePage;

  if (!listing || listing.status === "hidden" || listing.status === "archived") {
    return (
      <section className="mx-auto max-w-xl space-y-5 px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-slate-950">{copy.notFoundTitle}</h1>
        <p className="text-slate-600">{copy.notFoundBody}</p>
        <Button asChild>
          <Link href="/featured">{copy.browse}</Link>
        </Button>
      </section>
    );
  }

  const cover = listing.images.find((image) => image.isPrimary) ?? listing.images.at(0);
  const listingPath = `/app/listings/${listing.id}`;

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-4 pt-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-10">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <ListingImage
          src={cover?.url}
          alt={cover?.alt ?? listing.title}
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.eyebrow}</p>
          <div className="flex flex-wrap gap-2">
            <Badge>{getConditionLabel(dictionary, listing.condition)}</Badge>
            {listing.status !== "active" ? (
              <Badge className="bg-amber-100 text-amber-900">
                {getListingStatusLabel(dictionary, listing.status)}
              </Badge>
            ) : null}
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {listing.title}
          </h1>
          <p className="font-display text-3xl font-semibold text-slate-950">{formatCurrency(listing.price)}</p>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4" />
            {copy.pickup}: {listing.pickupArea}
          </p>
          <p className="text-sm leading-7 text-slate-600">{listing.description}</p>
        </div>
        <div className="space-y-3 rounded-[28px] border border-slate-200/80 bg-white p-5">
          <Button asChild className="w-full">
            <Link href={`/login?next=${encodeURIComponent(listingPath)}`}>{copy.cta}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/signup?next=${encodeURIComponent(listingPath)}`}>{copy.signup}</Link>
          </Button>
          <p className="text-center text-xs text-slate-500">{copy.ctaHint}</p>
        </div>
        <ShareListingButtons listingId={listing.id} title={listing.title} />
      </div>
    </section>
  );
}
