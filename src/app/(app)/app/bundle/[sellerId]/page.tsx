import { notFound, redirect } from "next/navigation";
import { BundleBuilder } from "@/components/marketplace/bundle-builder";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";
import { getCurrentUser, getListingsForSeller, getUserById } from "@/server/queries/marketplace";
import { getSellerPreferences } from "@/server/queries/seller-preferences";

export default async function BundlePage({
  params,
  searchParams
}: {
  params: Promise<{ sellerId: string }>;
  searchParams: Promise<{ listingId?: string }>;
}) {
  const [{ sellerId }, { listingId }] = await Promise.all([params, searchParams]);
  const [currentUser, seller, listings, dictionary, preferences] = await Promise.all([
    getCurrentUser(),
    getUserById(sellerId),
    getListingsForSeller(sellerId),
    getDictionaryForRequest(),
    getSellerPreferences(sellerId)
  ]);

  if (!seller) {
    notFound();
  }

  if (seller.id === currentUser.id) {
    redirect("/app/my-listings");
  }

  const available = listings.filter((listing) => listing.status === "active" && listing.price > 0);
  const copy = dictionary.bundle;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-950">
          {copy.title.replace("{name}", seller.profile.fullName.split(" ")[0])}
        </h1>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>
      </div>
      {preferences.bundleDiscount && available.length >= 2 ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {dictionary.sellerPrefs.discountNote
            .replace("{name}", seller.profile.fullName.split(" ")[0])
            .replace("{percent}", String(preferences.bundleDiscount))}
        </p>
      ) : null}
      {available.length >= 2 ? (
        <BundleBuilder
          listings={available}
          sellerId={seller.id}
          currentUserId={currentUser.id}
          siteUrl={getSiteUrl()}
          preselectedId={listingId}
          sellerDiscount={preferences.bundleDiscount}
        />
      ) : (
        <p className="rounded-2xl bg-white p-5 text-sm text-slate-600">{copy.notEnough}</p>
      )}
    </div>
  );
}
