import { ListingForm } from "@/components/forms/listing-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCategories } from "@/server/queries/marketplace";

export default async function SellPage() {
  const categories = await getAllCategories();

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Sell"
          title="List quickly, promote when needed, and keep the pickup story clear."
          description="The seller flow is optimized for fast move-out windows with support for negotiable pricing, urgency, outlet, and future promotion checkout."
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
      </div>
      <ListingForm categories={categories} />
    </div>
  );
}
