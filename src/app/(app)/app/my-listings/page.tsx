import { MovingSaleCard } from "@/components/marketplace/moving-sale-card";
import { MyListingRow } from "@/components/marketplace/my-listing-row";
import { ClearanceCard } from "@/components/marketplace/seller-tools";
import { SellerPreferencesCard } from "@/components/marketplace/seller-preferences-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { getDictionaryForRequest } from "@/lib/i18n";
import {
  getCurrentUser,
  getListingsForSeller,
  getSellerListingTransactions
} from "@/server/queries/marketplace";
import { getMyMoveOutDate } from "@/server/queries/moving-sale";
import { getMySellerPreferences } from "@/server/queries/seller-preferences";

export default async function MyListingsPage({
  searchParams
}: {
  searchParams?: Promise<{ created?: string; bump?: string }>;
}) {
  const params = await searchParams;
  const created = params?.created;
  const bump = params?.bump;
  const user = await getCurrentUser();
  const [listings, transactionsByListing, dictionary, moveOutDate, sellerPreferences] = await Promise.all([
    getListingsForSeller(user.id),
    getSellerListingTransactions(user.id),
    getDictionaryForRequest(),
    getMyMoveOutDate(),
    getMySellerPreferences()
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
      {bump === "paid" || bump === "cancelled" ? (
        <p
          role="status"
          className={`rounded-[22px] border px-5 py-4 text-sm font-medium ${
            bump === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          {bump === "paid" ? dictionary.innov.bump.paid : dictionary.innov.bump.cancelled}
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
        <>
          <MovingSaleCard sellerId={user.id} initialMoveOutDate={moveOutDate} />
          {listings.some((listing) => listing.status === "active" && listing.price > 0) ? <ClearanceCard /> : null}
          <SellerPreferencesCard initial={sellerPreferences} />
        </>
      ) : null}
    </div>
  );
}
