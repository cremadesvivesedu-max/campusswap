import Link from "next/link";
import { ListingCard } from "@/components/marketplace/listing-card";
import { RemoveListingButton } from "@/components/marketplace/remove-listing-button";
import { ListingStatusActions } from "@/components/marketplace/listing-status-actions";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { getDictionaryForRequest } from "@/lib/i18n";
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
            <Button asChild className="w-full" variant="secondary">
              <Link href={`/app/sell?listingId=${listing.id}`}>Edit listing</Link>
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
