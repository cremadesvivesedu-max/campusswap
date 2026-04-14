"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListingCard } from "@/components/marketplace/listing-card";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getConditionLabel, getListingStatusLabel } from "@/lib/i18n-shared";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/domain";

interface SavedListingsWorkspaceProps {
  listings: Listing[];
}

const maxComparedListings = 3;

export function SavedListingsWorkspace({
  listings
}: SavedListingsWorkspaceProps) {
  const { dictionary } = useLocale();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedListings = useMemo(
    () => listings.filter((listing) => selectedIds.includes(listing.id)),
    [listings, selectedIds]
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-3">
        {listings.map((listing) => {
          const selected = selectedIds.includes(listing.id);
          const maxed = !selected && selectedIds.length >= maxComparedListings;

          return (
            <div key={listing.id} className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-[26px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {dictionary.saved.compareLabel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {dictionary.saved.compareLimit.replace(
                      "{count}",
                      String(maxComparedListings)
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={selected ? "secondary" : "outline"}
                  disabled={maxed}
                  onClick={() =>
                    setSelectedIds((current) =>
                      current.includes(listing.id)
                        ? current.filter((value) => value !== listing.id)
                        : [...current, listing.id].slice(0, maxComparedListings)
                    )
                  }
                >
                  {selected
                    ? dictionary.saved.removeFromCompare
                    : dictionary.saved.addToCompare}
                </Button>
              </div>
              <ListingCard listing={listing} showMessageAction />
            </div>
          );
        })}
      </div>

      {selectedListings.length ? (
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-semibold text-slate-950">
                {dictionary.saved.compareTitle}
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                {dictionary.saved.compareDescription}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedIds([])}
            >
              {dictionary.common.actions.clearAll}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {selectedListings.map((listing) => (
                <Badge key={listing.id}>{listing.title}</Badge>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <tbody>
                  <CompareRow
                    label={dictionary.saved.compareFields.price}
                    values={selectedListings.map((listing) => formatCurrency(listing.price))}
                  />
                  <CompareRow
                    label={dictionary.saved.compareFields.condition}
                    values={selectedListings.map((listing) =>
                      getConditionLabel(dictionary, listing.condition)
                    )}
                  />
                  <CompareRow
                    label={dictionary.saved.compareFields.pickupArea}
                    values={selectedListings.map((listing) => listing.pickupArea)}
                  />
                  <CompareRow
                    label={dictionary.saved.compareFields.sellerRating}
                    values={selectedListings.map(
                      (listing) =>
                        `${listing.sellerRating.toFixed(1)} (${listing.sellerReviewCount ?? 0})`
                    )}
                  />
                  <CompareRow
                    label={dictionary.saved.compareFields.salesCount}
                    values={selectedListings.map((listing) =>
                      String(listing.sellerSalesCount ?? 0)
                    )}
                  />
                  <CompareRow
                    label={dictionary.saved.compareFields.featured}
                    values={selectedListings.map((listing) =>
                      listing.featured
                        ? dictionary.saved.compareValues.yes
                        : dictionary.saved.compareValues.no
                    )}
                  />
                  <CompareRow
                    label={dictionary.saved.compareFields.negotiable}
                    values={selectedListings.map((listing) =>
                      listing.negotiable
                        ? dictionary.saved.compareValues.yes
                        : dictionary.saved.compareValues.no
                    )}
                  />
                  <CompareRow
                    label={dictionary.saved.compareFields.status}
                    values={selectedListings.map((listing) =>
                      getListingStatusLabel(dictionary, listing.status)
                    )}
                  />
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {selectedListings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-4"
                >
                  <p className="font-semibold text-slate-950">{listing.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {listing.sellerName ?? dictionary.listing.campusSwapSeller}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/app/listings/${listing.id}`}>
                        {dictionary.common.actions.openListing}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function CompareRow({
  label,
  values
}: {
  label: string;
  values: string[];
}) {
  return (
    <tr>
      <th className="min-w-44 rounded-[22px] bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-700">
        {label}
      </th>
      {values.map((value, index) => (
        <td
          key={`${label}-${index}`}
          className="min-w-52 rounded-[22px] border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
        >
          {value}
        </td>
      ))}
    </tr>
  );
}
