import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getSavedListings } from "@/server/queries/marketplace";

export default async function SavedPage() {
  const listings = await getSavedListings();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Saved"
        title="Keep high-intent listings close while you compare options."
        description="Saved listings feed recommendations, future alerts, and quick access during move-in planning."
      />
      {listings.length ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} showMessageAction />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved listings yet"
          description="Once you save a listing, it will appear here and help shape your For You feed."
        />
      )}
    </div>
  );
}
