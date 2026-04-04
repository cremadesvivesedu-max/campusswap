import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getOutletListings } from "@/server/queries/marketplace";

export default async function OutletPage() {
  const [listings, dictionary] = await Promise.all([
    getOutletListings(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow={dictionary.marketing.outlet.eyebrow}
        title={dictionary.marketing.outlet.title}
        description={dictionary.marketing.outlet.description}
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
