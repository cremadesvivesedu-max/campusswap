"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingImage } from "@/components/marketplace/listing-image";
import { StarRating } from "@/components/shared/star-rating";
import { useLocale } from "@/components/providers/locale-provider";
import { getConditionLabel, getListingStatusLabel } from "@/lib/i18n-shared";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/domain";

export function ListingQuickView({
  listing,
  onClose
}: {
  listing: Listing;
  onClose: () => void;
}) {
  const { dictionary } = useLocale();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-3 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-[32px] bg-white shadow-glow"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {dictionary.listing.quickViewEyebrow}
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {listing.title}
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            aria-label={dictionary.listing.closeQuickView}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-3">
            <div className="aspect-[4/3] overflow-hidden rounded-[28px] bg-slate-100">
              <ListingImage
                src={listing.images[0]?.url}
                alt={listing.images[0]?.alt ?? listing.title}
                className="h-full w-full"
              />
            </div>
            {listing.images.length > 1 ? (
              <div className="grid grid-cols-3 gap-3">
                {listing.images.slice(1, 4).map((image) => (
                  <div
                    key={image.id}
                    className="aspect-[4/3] overflow-hidden rounded-[20px] bg-slate-100"
                  >
                    <ListingImage
                      src={image.url}
                      alt={image.alt}
                      className="h-full w-full"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge>{getConditionLabel(dictionary, listing.condition)}</Badge>
              {listing.featured ? (
                <Badge className="bg-amber-200 text-slate-900">
                  {dictionary.listing.featured}
                </Badge>
              ) : null}
              {listing.status !== "active" ? (
                <Badge>{getListingStatusLabel(dictionary, listing.status)}</Badge>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-semibold text-slate-950">
                {formatCurrency(listing.price)}
              </p>
              <p className="text-sm leading-7 text-slate-600">{listing.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.seller}
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {listing.sellerName ?? dictionary.listing.campusSwapSeller}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.pickupArea}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 font-semibold text-slate-950">
                  <MapPin className="h-4 w-4" />
                  {listing.pickupArea}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.averageRating}
                </p>
                <div className="mt-2">
                  <StarRating
                    rating={listing.sellerRating}
                    reviewCount={listing.sellerReviewCount}
                    className="gap-1.5"
                    showValue
                  />
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.salesCount}
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {listing.sellerSalesCount ?? 0}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="sm:flex-1" variant="secondary">
                <Link href={`/app/listings/${listing.id}`}>
                  {dictionary.common.actions.openListing}
                </Link>
              </Button>
              <Button type="button" className="sm:flex-1" onClick={onClose}>
                {dictionary.listing.closeQuickView}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
