"use client";

import { memo } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { getListingStatusLabel } from "@/lib/i18n-shared";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/domain";
import { ListingImage } from "@/components/marketplace/listing-image";
import { CardHeartButton } from "@/components/marketplace/card-heart-button";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  reason?: string[];
  /** Kept for existing callers; the whole card now opens the listing, where the chat button lives. */
  showMessageAction?: boolean;
  messageActionMode?: "chat" | "signup";
  /** Public pages link to the shareable /l/<id> page, which works without an account. */
  publicLink?: boolean;
}

// Marketplace-style card (think Wallapop/Vinted): the photo does the talking, then
// the price, then a one-line title. Everything else lives on the listing page.
function ListingCardComponent({ listing, reason, publicLink = false }: ListingCardProps) {
  const { dictionary } = useLocale();
  const cover = listing.images.find((image) => image.isPrimary) ?? listing.images[0];
  const badge = listing.status !== "active"
    ? { label: getListingStatusLabel(dictionary, listing.status), tone: "bg-slate-950/85 text-white" }
    : listing.urgent
      ? { label: dictionary.listing.urgent, tone: "bg-orange-700 text-white" }
      : listing.outlet
        ? { label: dictionary.listing.outlet, tone: "bg-rose-600 text-white" }
        : listing.featured
          ? { label: dictionary.listing.featured, tone: "bg-amber-400 text-slate-950" }
          : null;

  return (
    <div className="relative">
    <Link
      href={publicLink ? `/l/${listing.id}` : `/app/listings/${listing.id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        <ListingImage
          src={cover?.url}
          alt={cover?.alt ?? listing.title}
          className="h-full w-full transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {badge ? (
          <span
            className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.tone}`}
          >
            {badge.label}
          </span>
        ) : null}
      </div>
      <div className="space-y-0.5 px-0.5 pt-2">
        <p className="text-lg font-extrabold leading-6 text-slate-950">
          {formatCurrency(listing.price)}
        </p>
        <p className="line-clamp-1 text-sm text-slate-700 group-hover:underline">{listing.title}</p>
        <p className="flex items-center gap-1 truncate text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{listing.pickupArea}</span>
        </p>
        {reason?.length ? (
          <p className="line-clamp-1 pt-1 text-xs font-medium text-emerald-700">
            {dictionary.search.recommendationPrefix}: {reason.join(", ")}
          </p>
        ) : null}
      </div>
    </Link>
    {/* Outside the link: a button inside an <a> is invalid and would open the listing. */}
    <CardHeartButton
      listingId={listing.id}
      initialSaved={listing.isSaved}
      className="absolute right-2 top-2"
    />
    </div>
  );
}

export const ListingCard = memo(ListingCardComponent);
