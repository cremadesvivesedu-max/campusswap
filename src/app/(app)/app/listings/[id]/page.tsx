import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { RemoveListingButton } from "@/components/marketplace/remove-listing-button";
import { Button } from "@/components/ui/button";

export default async function ListingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const [seller, currentUser, dictionary, locale] = await Promise.all([
    getUserById(listing.sellerId),
    getCurrentUser(),
    getDictionaryForRequest(),
    getRequestLocale()
  ]);
  const isOwnListing = currentUser.id === listing.sellerId;
  const transactionContext = await getListingTransactionContext(listing.id, currentUser.id);
  const memberSince = seller
    ? new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric"
      }).format(new Date(seller.joinedAt))
    : null;

  return (
    <div className="grid gap-8 xl:gap-10 lg:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="space-y-7">
        <ListingGallery images={listing.images} title={listing.title} />
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {listing.featured ? (
                <Badge className="bg-amber-200 text-slate-900">
                  {dictionary.listing.featured}
                </Badge>
              ) : null}
              {listing.outlet ? (
                <Badge className="bg-rose-100 text-rose-900">
                  {dictionary.listing.outlet}
                </Badge>
              ) : null}
              {listing.urgent ? (
                <Badge className="bg-orange-100 text-orange-900">
                  {dictionary.listing.urgent}
                </Badge>
              ) : null}
              <Badge>{getConditionLabel(dictionary, listing.condition)}</Badge>
              {listing.status !== "active" ? (
                <Badge>{getListingStatusLabel(dictionary, listing.status)}</Badge>
              ) : null}
            </div>
            <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-[2.9rem]">
                  {listing.title}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {listing.description}
                </p>
              </div>
              <div className="min-w-[12rem] rounded-[26px] border border-slate-200/80 bg-slate-50/80 px-5 py-4 lg:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {listing.freshnessLabel}
                </p>
                <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
                  {formatCurrency(listing.price)}
                </p>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.fulfillmentTitle}
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    {dictionary.listing.pickupAvailable}:{" "}
                    <span className="font-medium text-slate-950">
                      {listing.pickupAvailable ? dictionary.messages.exchange.pickupOption : "-"}
                    </span>
                  </p>
                  <p>
                    {dictionary.listing.shippingAvailable}:{" "}
                    <span className="font-medium text-slate-950">
                      {listing.shippingAvailable
                        ? `${dictionary.messages.exchange.shippingOption} (${formatCurrency(
                            listing.shippingCost
                          )})`
                        : "-"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.pickupArea}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-950">
                  {listing.pickupArea}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {listing.shippingAvailable
                    ? dictionary.map.privacyBody
                    : dictionary.map.description}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.myListings.analyticsTitle}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Eye className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                        {dictionary.myListings.views}
                      </p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {listing.viewCount}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Heart className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                        {dictionary.myListings.saves}
                      </p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {listing.saveCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <div className="space-y-3 rounded-[26px] border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <FavoriteToggleButton
                  listingId={listing.id}
                  initialSaved={listing.isSaved}
                />
                {!isOwnListing ? (
                  <MessageSellerButton
                    listingId={listing.id}
                    sellerId={listing.sellerId}
                    listingStatus={listing.status}
                  />
                ) : null}
              </div>
              {!isOwnListing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button asChild variant="outline">
                    <Link href={`/app/support?type=report-listing&listingId=${listing.id}`}>
                      {dictionary.support.reportListingCta}
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link
                      href={`/app/support?type=report-user&targetUserId=${listing.sellerId}&listingId=${listing.id}`}
                    >
                      {dictionary.support.reportUserCta}
                    </Link>
                  </Button>
                </div>
              ) : null}
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
          </CardContent>
        </Card>
        <PickupAreaMap
          pickupArea={listing.pickupArea}
          location={listing.location}
          neighborhood={seller?.profile.neighborhood}
          copy={dictionary.map}
        />
      </div>
      <div className="space-y-6">
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {dictionary.listing.seller}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            {seller ? (
              <Link
                href={`/app/profile?userId=${seller.id}`}
                className="flex items-center gap-3 rounded-[24px] border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ProfileAvatar
                  userId={seller.id}
                  name={seller.profile.fullName}
                  src={seller.avatar}
                  className="h-14 w-14"
                />
                <div>
                  <p className="font-semibold text-slate-950">
                    {seller.profile.fullName}
                  </p>
                  <p>{seller.profile.university}</p>
                  <div className="pt-2">
                    <VerificationStatusBadge status={seller.verificationStatus} />
                  </div>
                </div>
              </Link>
            ) : null}
            <StarRating
              rating={listing.sellerRating}
              reviewCount={seller?.profile.reviewCount}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.responseRate}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {Math.round(listing.sellerResponseRate * 100)}%
                </p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.salesCount}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {listing.sellerSalesCount ?? seller?.sellerMetrics?.salesCount ?? 0}
                </p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.averageRating}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {listing.sellerRating.toFixed(1)}
                </p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.listing.memberSince}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {memberSince ?? "-"}
                </p>
              </div>
            </div>
            <p>
              {dictionary.listing.pickupArea}: {listing.pickupArea}
            </p>
            {isOwnListing ? (
              <>
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {dictionary.listing.ownListing}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button asChild variant="secondary">
                    <Link href={`/app/sell?listingId=${listing.id}`}>
                      {dictionary.listing.editListing}
                    </Link>
                  </Button>
                  <RemoveListingButton
                    listingId={listing.id}
                    listingTitle={listing.title}
                    redirectHref="/app/my-listings"
                  />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
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
            context={transactionContext}
            isOwnListing={isOwnListing}
          />
        ) : null}
        <Card className="overflow-hidden border-slate-900 bg-[linear-gradient(180deg,#0f172a,#111827)] text-white shadow-sm">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">
              {dictionary.listing.safeMeetup}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-300">
            {dictionary.listing.meetupTips.map((tip) => (
              <p key={tip}>{tip}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
