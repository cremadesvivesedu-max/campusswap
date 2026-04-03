import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getFeaturedListings } from "@/server/queries/marketplace";

export default async function FeaturedPage() {
  const listings = await getFeaturedListings();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Featured"
        title="Boosted inventory stays clearly marked and student-relevant."
        description="Promoted listings appear across home, category, and search surfaces with transparent labeling and no fake scarcity."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            showMessageAction
            messageActionMode="signup"
          />
        ))}
      </div>
    </div>
  );
}
