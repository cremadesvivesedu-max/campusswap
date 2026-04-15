"use client";

import { memo } from "react";
import Link from "next/link";
import { Images, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { getListingStatusLabel } from "@/lib/i18n-shared";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/domain";
import { ListingImage } from "@/components/marketplace/listing-image";
import { MessageSellerButton } from "@/components/marketplace/message-seller-button";
import { StarRating } from "@/components/shared/star-rating";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  reason?: string[];
  showMessageAction?: boolean;
  messageActionMode?: "chat" | "signup";
}

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
    <Card className="group relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/96 shadow-[0_18px_54px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)]">
      <Link
        href={listingHref}
        aria-label={`Open listing: ${listing.title}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      />
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[30px] bg-slate-100">
        <ListingImage
          src={listing.images[0]?.url}
          alt={listing.images[0]?.alt ?? listing.title}
          className="h-full w-full"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/20 to-transparent" />
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
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
        {listing.images.length > 1 ? (
          <div className="absolute right-4 top-4 z-10">
            <Badge className="bg-white/90 text-slate-900">
              <Images className="mr-1 h-3.5 w-3.5" />
              {listing.images.length}
            </Badge>
          </div>
        ) : null}
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <div className="space-y-3.5">
          <div className="flex items-start justify-between gap-4">
            <p className="line-clamp-2 font-display text-xl font-semibold leading-7 text-slate-950">
              {listing.title}
            </p>
            <p className="shrink-0 rounded-full border border-slate-200/80 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
              {formatCurrency(listing.price)}
            </p>
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {listing.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.85))] px-4 py-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
            <MapPin className="h-3.5 w-3.5" />
            {listing.pickupArea}
          </span>
          <StarRating rating={listing.sellerRating} className="gap-1.5" showValue />
          <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-600 shadow-sm">
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
            <MessageSellerButton
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
