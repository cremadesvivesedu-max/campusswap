import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { SavedListingsWorkspace } from "@/components/marketplace/saved-listings-workspace";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getSavedListings } from "@/server/queries/marketplace";

export default async function SavedPage() {
  const [listings, dictionary] = await Promise.all([
    getSavedListings(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.saved.eyebrow}
        title={dictionary.saved.title}
        description={dictionary.saved.description}
      />
      {listings.length ? (
        <SavedListingsWorkspace listings={listings} />
      ) : (
        <EmptyState
          title={dictionary.saved.emptyTitle}
          description={dictionary.saved.emptyDescription}
        />
      )}
    </div>
  );
}
