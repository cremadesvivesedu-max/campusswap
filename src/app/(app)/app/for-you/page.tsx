import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCurrentUser, getForYouFeed } from "@/server/queries/marketplace";

export default async function ForYouPage() {
  const user = await getCurrentUser();
  const results = await getForYouFeed(user.id);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="For You"
        title="Deterministic recommendations, not vague AI."
        description="CampusSwap ranks listings using category affinity, saves, views, search patterns, freshness, seller quality, featured boosts, and outlet affinity."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {results.map((result) => (
          <ListingCard
            key={result.listing.id}
            listing={result.listing}
            reason={result.breakdown.reasons}
            showMessageAction
          />
        ))}
      </div>
    </div>
  );
}
