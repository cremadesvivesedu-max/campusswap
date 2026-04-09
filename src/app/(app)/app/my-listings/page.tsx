import Link from "next/link";
import { ListingCard } from "@/components/marketplace/listing-card";
import { RemoveListingButton } from "@/components/marketplace/remove-listing-button";
import { ListingStatusActions } from "@/components/marketplace/listing-status-actions";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { getDictionaryForRequest } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import {
  getCurrentUser,
  getListingsForSeller,
  getSellerListingTransactions
} from "@/server/queries/marketplace";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  const [listings, transactionsByListing, dictionary] = await Promise.all([
    getListingsForSeller(user.id),
    getSellerListingTransactions(user.id),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.myListings.eyebrow}
        title={dictionary.myListings.title}
        description={dictionary.myListings.description}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {listings.map((listing) => (
          <div key={listing.id} className="space-y-4">
            <ListingCard listing={listing} compact />
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {dictionary.myListings.analyticsTitle}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {dictionary.myListings.views}
                  </p>
                  <p className="mt-2 font-semibold text-slate-950">{listing.viewCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {dictionary.myListings.saves}
                  </p>
                  <p className="mt-2 font-semibold text-slate-950">{listing.saveCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {dictionary.myListings.messagesReceived}
                  </p>
                  <p className="mt-2 font-semibold text-slate-950">
                    {listing.analytics?.messagesReceived ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {dictionary.myListings.offersReceived}
                  </p>
                  <p className="mt-2 font-semibold text-slate-950">
                    {listing.analytics?.offersReceived ?? 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-medium text-slate-950">
                  {dictionary.myListings.fulfillmentSummary}:
                </span>{" "}
                {listing.pickupAvailable ? dictionary.myListings.pickupLabel : null}
                {listing.pickupAvailable && listing.shippingAvailable ? " · " : null}
                {listing.shippingAvailable
                  ? `${dictionary.myListings.shippingLabel} (${formatCurrency(listing.shippingCost)})`
                  : null}
              </div>
            </div>
            <Button asChild className="w-full" variant="secondary">
              <Link href={`/app/sell?listingId=${listing.id}`}>
                {dictionary.myListings.editListing}
              </Link>
            </Button>
            <ListingStatusActions
              listingId={listing.id}
              currentStatus={listing.status}
              transaction={transactionsByListing[listing.id]}
            />
            <RemoveListingButton
              listingId={listing.id}
              listingTitle={listing.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
