import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  getCurrentUser,
  getListingById,
  getUserById
} from "@/server/queries/marketplace";
import { ListingImage } from "@/components/marketplace/listing-image";
import { MessageSellerButton } from "@/components/marketplace/message-seller-button";
import { PickupAreaMap } from "@/components/marketplace/pickup-area-map";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { FavoriteToggleButton } from "@/components/marketplace/favorite-toggle-button";
import { ReportListingForm } from "@/components/marketplace/report-listing-form";

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

  const [seller, currentUser] = await Promise.all([
    getUserById(listing.sellerId),
    getCurrentUser()
  ]);
  const isOwnListing = currentUser.id === listing.sellerId;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr]">
      <div className="space-y-6">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-glow">
          <ListingImage
            src={listing.images[0]?.url}
            alt={listing.images[0]?.alt ?? listing.title}
            className="h-full w-full"
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/20 to-transparent" />
        </div>
        <Card className="bg-white">
          <CardContent className="space-y-4 p-8">
            <div className="flex flex-wrap gap-2">
              {listing.featured ? (
                <Badge className="bg-amber-200 text-slate-900">Featured</Badge>
              ) : null}
              {listing.outlet ? (
                <Badge className="bg-rose-100 text-rose-900">Outlet</Badge>
              ) : null}
              {listing.urgent ? (
                <Badge className="bg-orange-100 text-orange-900">Urgent</Badge>
              ) : null}
              <Badge>{listing.condition}</Badge>
              {listing.status !== "active" ? <Badge>{listing.status}</Badge> : null}
            </div>
            <h1 className="font-display text-4xl font-semibold text-slate-950">
              {listing.title}
            </h1>
            <p className="text-lg font-semibold text-slate-950">
              {formatCurrency(listing.price)}
            </p>
            <p className="text-sm leading-7 text-slate-600">{listing.description}</p>
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
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
          </CardContent>
        </Card>
        <PickupAreaMap
          pickupArea={listing.pickupArea}
          location={listing.location}
          neighborhood={seller?.profile.neighborhood}
        />
      </div>
      <div className="space-y-6">
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">Seller</h2>
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
                </div>
              </Link>
            ) : null}
            <StarRating
              rating={listing.sellerRating}
              reviewCount={seller?.profile.reviewCount}
            />
            <p>Response rate {Math.round(listing.sellerResponseRate * 100)}%</p>
            <p>Pickup area: {listing.pickupArea}</p>
            {isOwnListing ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                This is your listing. Manage its lifecycle from My listings.
              </p>
            ) : (
              <ReportListingForm listingId={listing.id} />
            )}
          </CardContent>
        </Card>
        <Card className="bg-slate-950 text-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">
              Safe meetup guidance
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-300">
            <p>Prefer daylight and campus-adjacent pickup spots.</p>
            <p>Keep listing-linked chat active until the meetup is confirmed.</p>
            <p>Only mark the exchange complete after the handoff is done.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
