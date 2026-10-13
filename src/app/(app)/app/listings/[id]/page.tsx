import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Eye, Heart, MapPin, ShieldCheck, Truck } from "lucide-react";
import {
  getConditionLabel,
  getDictionaryForRequest,
  getListingStatusLabel,
  getRequestLocale
} from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import {
  getCurrentUser,
  getListingById,
  getSellerStripeConnectStatusForUser,
  getListingTransactionContext,
  getUserById
} from "@/server/queries/marketplace";
import { ListingGallery } from "@/components/marketplace/listing-gallery";
import { ListingTransactionPanel } from "@/components/marketplace/listing-transaction-panel";
import { MessageSellerButton } from "@/components/marketplace/message-seller-button";
import { PickupAreaMap } from "@/components/marketplace/pickup-area-map";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import { FavoriteToggleButton } from "@/components/marketplace/favorite-toggle-button";
import { ShareListingButtons } from "@/components/marketplace/share-listing-buttons";
import { RemoveListingButton } from "@/components/marketplace/remove-listing-button";
import { Button } from "@/components/ui/button";

// Listing page in marketplace order (Wallapop-like): photos, price and title, seller,
// description, a short details list, then buying and the map.
export default async function ListingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Start everything that does not depend on the listing straight away.
  const currentUserPromise = getCurrentUser();
  const dictionaryPromise = getDictionaryForRequest();
  const localePromise = getRequestLocale();
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const [seller, currentUser, dictionary, locale, sellerStripeStatus, transactionContext] =
    await Promise.all([
      getUserById(listing.sellerId),
      currentUserPromise,
      dictionaryPromise,
      localePromise,
      getSellerStripeConnectStatusForUser(listing.sellerId),
      currentUserPromise.then((user) => getListingTransactionContext(listing.id, user.id))
    ]);
  const isOwnListing = currentUser.id === listing.sellerId;
  const copy = dictionary.listingPage;
  const memberSince = seller
    ? new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
        new Date(seller.joinedAt)
      )
    : null;
  const deliveryText = listing.shippingAvailable
    ? (listing.pickupAvailable ? copy.pickupAndShipping : copy.shippingFrom).replace(
        "{cost}",
        formatCurrency(listing.shippingCost)
      )
    : copy.pickupOnly;
  const salesCount = listing.sellerSalesCount ?? seller?.sellerMetrics?.salesCount ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:gap-10">
      <div className="min-w-0 space-y-5">
        <ListingGallery images={listing.images} title={listing.title} />

        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {listing.status !== "active" ? (
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                {getListingStatusLabel(dictionary, listing.status)}
              </span>
            ) : null}
            {listing.urgent ? (
              <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
                {dictionary.listing.urgent}
              </span>
            ) : null}
            {listing.outlet ? (
              <span className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
                {dictionary.listing.outlet}
              </span>
            ) : null}
            {listing.featured ? (
              <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-slate-950">
                {dictionary.listing.featured}
              </span>
            ) : null}
          </div>
          <p className="text-3xl font-extrabold text-slate-950">{formatCurrency(listing.price)}</p>
          <h1 className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
            {listing.title}
          </h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              {getConditionLabel(dictionary, listing.condition)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {listing.pickupArea}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {listing.freshnessLabel}
            </span>
          </p>
        </section>

        {seller ? (
          <Link
            href={`/app/profile?userId=${seller.id}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50"
          >
            <ProfileAvatar
              userId={seller.id}
              name={seller.profile.fullName}
              src={seller.avatar}
              className="h-12 w-12"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-bold text-slate-950">
                {seller.profile.fullName}
                <VerificationStatusBadge status={seller.verificationStatus} />
              </p>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                <StarRating rating={listing.sellerRating} reviewCount={seller.profile.reviewCount} />
                <span>
                  · {salesCount} {copy.sales}
                </span>
                {memberSince ? (
                  <span>
                    · {dictionary.listing.memberSince} {memberSince}
                  </span>
                ) : null}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          </Link>
        ) : null}

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">{copy.description}</h2>
          <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">
            {listing.description}
          </p>
          {listing.tags.length ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {listing.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">{copy.details}</h2>
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white text-sm">
            <li className="flex items-center gap-3 px-4 py-3">
              <Truck className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span className="text-slate-500">{copy.delivery}</span>
              <span className="ml-auto text-right font-semibold text-slate-900">{deliveryText}</span>
            </li>
            <li className="flex items-center gap-3 px-4 py-3">
              <MapPin className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span className="text-slate-500">{dictionary.listing.pickupArea}</span>
              <span className="ml-auto text-right font-semibold text-slate-900">{listing.pickupArea}</span>
            </li>
          </ul>
        </section>

        {isOwnListing ? (
          <section className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{copy.yourStats}</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" aria-hidden="true" /> {listing.viewCount} {copy.views}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-4 w-4" aria-hidden="true" /> {listing.saveCount} {copy.saves}
            </span>
          </section>
        ) : null}

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FavoriteToggleButton listingId={listing.id} initialSaved={listing.isSaved} />
            {!isOwnListing ? (
              <MessageSellerButton
                listingId={listing.id}
                sellerId={listing.sellerId}
                listingStatus={listing.status}
              />
            ) : null}
          </div>
          <ShareListingButtons listingId={listing.id} title={listing.title} />
        </div>

        {!isOwnListing && listing.status === "reserved" && transactionContext.reservedForOtherBuyer ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {dictionary.listing.reservedForOther}
          </p>
        ) : null}
        {isOwnListing && listing.status === "hidden" ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {dictionary.listing.hiddenOwn}
          </p>
        ) : null}

        <PickupAreaMap
          pickupArea={listing.pickupArea}
          location={listing.location}
          neighborhood={seller?.profile.neighborhood}
          copy={dictionary.map}
        />
      </div>

      <div className="min-w-0 space-y-5">
        {isOwnListing ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">{dictionary.listing.ownListing}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/app/sell?listingId=${listing.id}`}>{dictionary.listing.editListing}</Link>
              </Button>
              <RemoveListingButton
                listingId={listing.id}
                listingTitle={listing.title}
                redirectHref="/app/my-listings"
              />
            </div>
          </div>
        ) : null}
        {seller ? (
          <ListingTransactionPanel
            listingId={listing.id}
            listingPrice={listing.price}
            listingStatus={listing.status}
            listingPickupArea={listing.pickupArea}
            listingPickupAvailable={listing.pickupAvailable}
            listingShippingAvailable={listing.shippingAvailable}
            listingShippingCost={listing.shippingCost}
            currentUserId={currentUser.id}
            seller={seller}
            sellerStripeStatus={sellerStripeStatus}
            context={transactionContext}
            isOwnListing={isOwnListing}
          />
        ) : null}
        <details className="group rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
            <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            {dictionary.listing.safeMeetup}
            <ChevronRight className="ml-auto h-4 w-4 text-slate-400 transition group-open:rotate-90" aria-hidden="true" />
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            {dictionary.listing.meetupTips.map((tip) => (
              <p key={tip}>{tip}</p>
            ))}
          </div>
        </details>
        {!isOwnListing ? (
          <p className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-slate-500">
            <Link
              href={`/app/support?type=report-listing&listingId=${listing.id}`}
              className="underline-offset-2 hover:text-rose-700 hover:underline"
            >
              {dictionary.support.reportListingCta}
            </Link>
            <Link
              href={`/app/support?type=report-user&targetUserId=${listing.sellerId}&listingId=${listing.id}`}
              className="underline-offset-2 hover:text-rose-700 hover:underline"
            >
              {dictionary.support.reportUserCta}
            </Link>
          </p>
        ) : null}
      </div>

      {/* Phones: keep price and the main action in reach, just above the bottom tab bar. */}
      <div className="h-16 sm:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(3.9rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200/80 bg-white/95 px-4 py-2.5 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-extrabold leading-tight text-slate-950">
              {formatCurrency(listing.price)}
            </p>
            <p className="truncate text-xs text-slate-500">{listing.title}</p>
          </div>
          <div className="w-[55%] shrink-0">
            {isOwnListing ? (
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/app/sell?listingId=${listing.id}`}>{dictionary.listing.editListing}</Link>
              </Button>
            ) : (
              <MessageSellerButton
                listingId={listing.id}
                sellerId={listing.sellerId}
                listingStatus={listing.status}
                compact
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
