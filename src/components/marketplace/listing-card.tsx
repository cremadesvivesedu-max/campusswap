"use client";

import { memo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { getListingStatusLabel } from "@/lib/i18n-shared";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/domain";
import { ListingImage } from "@/components/marketplace/listing-image";
import { StarRating } from "@/components/shared/star-rating";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  reason?: string[];
  showMessageAction?: boolean;
  messageActionMode?: "chat" | "signup";
}

const DeferredMessageSellerButton = dynamic(
  () =>
    import("@/components/marketplace/message-seller-button").then(
      (module) => module.MessageSellerButton
    ),
  {
    ssr: false,
    loading: () => (
      <Button className="sm:flex-1" type="button" variant="outline" disabled>
        ...
      </Button>
    )
  }
);

function ListingCardComponent({
  listing,
  compact = false,
  reason,
  showMessageAction = false,
  messageActionMode = "chat"
}: ListingCardProps) {
  const { dictionary } = useLocale();
  const showChatAction = showMessageAction && listing.status !== "sold";
  const listingHref = `/app/listings/${listing.id}`;

  return (
    <Card className="group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/96 shadow-sm transition duration-150 hover:border-slate-300 hover:shadow-md">
      <Link
        href={listingHref}
        aria-label={`Open listing: ${listing.title}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      />
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[22px] bg-slate-100">
        <ListingImage
          src={listing.images[0]?.url}
          alt={listing.images[0]?.alt ?? listing.title}
          className="h-full w-full"
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {listing.featured ? (
            <Badge className="bg-amber-200 text-slate-900">
              {dictionary.listing.featured}
            </Badge>
          ) : null}
          {listing.outlet ? (
            <Badge className="bg-rose-100 text-rose-900">
              {dictionary.listing.outlet}
            </Badge>
          ) : null}
          {listing.urgent ? (
            <Badge className="bg-orange-100 text-orange-900">
              {dictionary.listing.urgent}
            </Badge>
          ) : null}
          {listing.status !== "active" ? (
            <Badge className="bg-slate-950 text-white">
              {getListingStatusLabel(dictionary, listing.status)}
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <p className="line-clamp-2 font-display text-lg font-semibold leading-6 text-slate-950">
              {listing.title}
            </p>
            <p className="shrink-0 rounded-full border border-slate-200/80 bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
              {formatCurrency(listing.price)}
            </p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
            {listing.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-[18px] border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
            <MapPin className="h-3.5 w-3.5" />
            {listing.pickupArea}
          </span>
          {!compact ? (
            <StarRating rating={listing.sellerRating} className="gap-1.5" showValue />
          ) : null}
          <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-600">
            {listing.freshnessLabel}
          </span>
        </div>
        {!compact && listing.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : null}
        {reason?.length ? (
          <p className="rounded-[20px] border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-xs font-medium leading-5 text-emerald-800">
            {dictionary.search.recommendationPrefix}: {reason.join(", ")}
          </p>
        ) : null}
        <div className="relative z-20 flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:flex-wrap">
          <Button asChild className="sm:flex-1" variant="secondary">
            <Link href={listingHref}>{dictionary.common.actions.viewListing}</Link>
          </Button>
          {showChatAction ? (
            <DeferredMessageSellerButton
              listingId={listing.id}
              sellerId={listing.sellerId}
              listingStatus={listing.status}
              mode={messageActionMode}
              className="sm:flex-1"
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export const ListingCard = memo(ListingCardComponent);
