import { notFound, redirect } from "next/navigation";
import { BundleBuilder } from "@/components/marketplace/bundle-builder";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";
import { getCurrentUser, getListingsForSeller, getUserById } from "@/server/queries/marketplace";

export default async function BundlePage({
  params,
  searchParams
}: {
  params: Promise<{ sellerId: string }>;
  searchParams: Promise<{ listingId?: string }>;
}) {
  const [{ sellerId }, { listingId }] = await Promise.all([params, searchParams]);
  const [currentUser, seller, listings, dictionary] = await Promise.all([
    getCurrentUser(),
    getUserById(sellerId),
    getListingsForSeller(sellerId),
    getDictionaryForRequest()
  ]);

  if (!seller) {
    notFound();
  }

  if (seller.id === currentUser.id) {
    redirect("/app/my-listings");
  }

  const available = listings.filter((listing) => listing.status === "active");
  const copy = dictionary.bundle;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-950">
          {copy.title.replace("{name}", seller.profile.fullName.split(" ")[0])}
        </h1>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>
      </div>
      {available.length >= 2 ? (
        <BundleBuilder
          listings={available}
          sellerId={seller.id}
          currentUserId={currentUser.id}
          siteUrl={getSiteUrl()}
          preselectedId={listingId}
        />
      ) : (
        <p className="rounded-2xl bg-white p-5 text-sm text-slate-600">{copy.notEnough}</p>
      )}
    </div>
  );
}
