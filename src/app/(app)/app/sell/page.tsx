import { ListingForm } from "@/components/forms/listing-form";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getDictionaryForRequest } from "@/lib/i18n";
import {
  getAllCategories,
  getCurrentUser,
  getListingById
} from "@/server/queries/marketplace";
import { notFound } from "next/navigation";

async function getFeaturedPrice() {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return 2;
  }

  const { data } = await admin
    .from("pricing_settings")
    .select("value")
    .eq("module", "promoted-listings")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Number(data?.value ?? 2);
}

async function getPromotionState(listingId?: string) {
  if (!listingId) {
    return "none" as const;
  }

  const admin = createAdminSupabaseClient();

  if (!admin) {
    return "none" as const;
  }

  const { data } = await admin
    .from("promotion_purchases")
    .select("active")
    .eq("listing_id", listingId)
    .eq("type", "featured")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return "none" as const;
  }

  return data.active ? ("active" as const) : ("pending" as const);
}

export default async function SellPage({
  searchParams
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const { listingId } = await searchParams;
  const [categories, user] = await Promise.all([
    getAllCategories(),
    getCurrentUser()
  ]);
  const dictionary = await getDictionaryForRequest();
  const listingToEdit = listingId ? await getListingById(listingId) : null;

  if (listingId && !listingToEdit) {
    notFound();
  }

  if (
    listingToEdit &&
    listingToEdit.sellerId !== user.id &&
    user.role !== "admin"
  ) {
    notFound();
  }

  const isEditing = Boolean(listingToEdit);
  const [featuredPrice, promotionState] = await Promise.all([
    getFeaturedPrice(),
    getPromotionState(listingToEdit?.id)
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <SectionHeading
          eyebrow={dictionary.listingForm.eyebrow}
          title={
            isEditing
              ? dictionary.listingForm.editTitle
              : dictionary.listingForm.createTitle
          }
          description={
            isEditing
              ? dictionary.listingForm.editDescription
              : dictionary.listingForm.createDescription
          }
        />
        <Card className="bg-white">
          <CardContent className="space-y-3 p-8 text-sm leading-7 text-slate-600">
            <p>{dictionary.listingForm.requirementsBody}</p>
            <p>{dictionary.listingForm.optionalControlsBody}</p>
            <p>{dictionary.listingForm.moderationBody}</p>
          </CardContent>
        </Card>
        {user.verificationStatus !== "verified" ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="space-y-3 p-6 text-sm leading-7 text-slate-700">
              <div className="flex items-center gap-3">
                <VerificationStatusBadge status={user.verificationStatus} />
                <p className="font-semibold text-slate-950">
                  {dictionary.listingForm.verificationOptionalTitle}
                </p>
              </div>
              <p>{dictionary.listingForm.verificationOptionalBody}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
      <ListingForm
        categories={categories}
        initialListing={listingToEdit ?? undefined}
        featuredPrice={featuredPrice}
        promotionState={listingToEdit?.featured ? "active" : promotionState}
      />
    </div>
  );
}
