import { ListingForm } from "@/components/forms/listing-form";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAllCategories,
  getCurrentUser,
  getListingById
} from "@/server/queries/marketplace";
import { notFound } from "next/navigation";

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

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Sell"
          title={
            isEditing
              ? "Update your listing without losing chat or exchange context."
              : "List quickly, promote when needed, and keep the pickup story clear."
          }
          description={
            isEditing
              ? "Edit the core listing details buyers rely on, then save changes back into the live marketplace."
              : "The seller flow is optimized for fast move-out windows with support for negotiable pricing, urgency, outlet, and future promotion checkout."
          }
        />
        <Card className="bg-white">
          <CardContent className="space-y-3 p-8 text-sm leading-7 text-slate-600">
            <p>
              Required fields: title, description, category, condition, price, image
              gallery, and pickup area.
            </p>
            <p>
              Optional controls: negotiable, outlet, urgent, and future bumping or
              promotion purchases.
            </p>
            <p>
              Suspicious phrases automatically route listings into moderation review.
            </p>
          </CardContent>
        </Card>
        {user.verificationStatus !== "verified" ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="space-y-3 p-6 text-sm leading-7 text-slate-700">
              <div className="flex items-center gap-3">
                <VerificationStatusBadge status={user.verificationStatus} />
                <p className="font-semibold text-slate-950">Student verification is optional.</p>
              </div>
              <p>
                You can publish listings now. Because your account is not student-verified
                yet, new listings may go through a quick trust review before they appear
                publicly.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
      <ListingForm categories={categories} initialListing={listingToEdit ?? undefined} />
    </div>
  );
}
