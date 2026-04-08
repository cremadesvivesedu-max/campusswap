"use client";

import { useState } from "react";
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
import { ListingQuickView } from "@/components/marketplace/listing-quick-view";
import { StarRating } from "@/components/shared/star-rating";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  reason?: string[];
  showMessageAction?: boolean;
  messageActionMode?: "chat" | "signup";
}

export function ListingCard({
  listing,
  compact = false,
  reason,
  showMessageAction = false,
  messageActionMode = "chat"
}: ListingCardProps) {
  const { dictionary } = useLocale();
  const [showQuickView, setShowQuickView] = useState(false);
  const showChatAction = showMessageAction && listing.status !== "sold";
  const listingHref = `/app/listings/${listing.id}`;

  return (
    <Card className="relative overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-glow">
      <Link
        href={listingHref}
        aria-label={`Open listing: ${listing.title}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      />
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[28px] bg-slate-100">
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
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <p className="font-display text-lg font-semibold text-slate-950">{listing.title}</p>
            <p className="text-base font-semibold text-slate-950">
              {formatCurrency(listing.price)}
            </p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
            {listing.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {listing.pickupArea}
          </span>
          <StarRating rating={listing.sellerRating} className="gap-1.5" showValue />
          <span>{listing.freshnessLabel}</span>
        </div>
        {!compact && listing.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : null}
        {reason?.length ? (
          <p className="text-xs font-medium text-emerald-700">
            {dictionary.search.recommendationPrefix}: {reason.join(", ")}
          </p>
        ) : null}
        <div className="relative z-20 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild className="sm:flex-1" variant="secondary">
            <Link href={listingHref}>{dictionary.common.actions.viewListing}</Link>
          </Button>
          <Button
            type="button"
            className="sm:flex-1"
            variant="outline"
            onClick={() => setShowQuickView(true)}
          >
            {dictionary.listing.quickView}
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
      {showQuickView ? (
        <ListingQuickView listing={listing} onClose={() => setShowQuickView(false)} />
      ) : null}
    </Card>
  );
}
