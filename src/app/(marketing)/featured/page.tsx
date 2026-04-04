import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getFeaturedListings } from "@/server/queries/marketplace";

export default async function FeaturedPage() {
  const [listings, dictionary] = await Promise.all([
    getFeaturedListings(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow={dictionary.marketing.featured.eyebrow}
        title={dictionary.marketing.featured.title}
        description={dictionary.marketing.featured.description}
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
