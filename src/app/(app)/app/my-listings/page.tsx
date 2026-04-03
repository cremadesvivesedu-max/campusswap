import { ListingCard } from "@/components/marketplace/listing-card";
import { ListingStatusActions } from "@/components/marketplace/listing-status-actions";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getCurrentUser,
  getListingsForSeller
} from "@/server/queries/marketplace";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  const listings = await getListingsForSeller(user.id);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="My listings"
        title="Manage availability, urgency, and sell-through."
        description="Listing lifecycle controls support available, reserved, sold, archived, relist, urgent, and promotion-ready states."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {listings.map((listing) => (
          <div key={listing.id} className="space-y-4">
            <ListingCard listing={listing} compact />
            <ListingStatusActions
              listingId={listing.id}
              currentStatus={listing.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
