import { MovingSaleCard } from "@/components/marketplace/moving-sale-card";
import { MyListingRow } from "@/components/marketplace/my-listing-row";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { getDictionaryForRequest } from "@/lib/i18n";
import {
  getCurrentUser,
  getListingsForSeller,
  getSellerListingTransactions
} from "@/server/queries/marketplace";
import { getMyMoveOutDate } from "@/server/queries/moving-sale";

export default async function MyListingsPage({
  searchParams
}: {
  searchParams?: Promise<{ created?: string }>;
}) {
  const created = (await searchParams)?.created;
  const user = await getCurrentUser();
  const [listings, transactionsByListing, dictionary, moveOutDate] = await Promise.all([
    getListingsForSeller(user.id),
    getSellerListingTransactions(user.id),
    getDictionaryForRequest(),
    getMyMoveOutDate()
  ]);

  return (
    <div className="space-y-5 sm:space-y-8">
      <h1 className="text-2xl font-extrabold text-slate-950 sm:hidden">
        {dictionary.myListings.eyebrow}
        {listings.length ? (
          <span className="ml-2 text-base font-semibold text-slate-400">{listings.length}</span>
        ) : null}
      </h1>
      <div className="hidden sm:block">
        <SectionHeading
          eyebrow={dictionary.myListings.eyebrow}
          title={dictionary.myListings.title}
          description={dictionary.myListings.description}
        />
      </div>
      {created === "live" || created === "review" ? (
        <p
          role="status"
          className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900"
        >
          {created === "live"
            ? dictionary.listingForm.createdLive
            : dictionary.listingForm.createdReview}
        </p>
      ) : null}
      {listings.length ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {listings.map((listing) => (
            <MyListingRow
              key={listing.id}
              listing={listing}
              transaction={transactionsByListing[listing.id]}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          title={dictionary.myListings.emptyTitle}
          description={dictionary.myListings.emptyDescription}
          actionHref="/app/sell"
          actionLabel={dictionary.myListings.emptyAction}
        />
      )}
      {listings.length ? (
        <MovingSaleCard sellerId={user.id} initialMoveOutDate={moveOutDate} />
      ) : null}
    </div>
  );
}
