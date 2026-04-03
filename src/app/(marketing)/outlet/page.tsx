import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getOutletListings } from "@/server/queries/marketplace";

export default async function OutletPage() {
  const listings = await getOutletListings();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Outlet"
        title="The lower-price, urgent, and imperfect items that still solve real student problems."
        description="Outlet is not hidden. It is a core experience for affordability, fast clear-outs, and sustainability-minded reuse."
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
