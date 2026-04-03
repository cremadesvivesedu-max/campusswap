import { OnboardingForm } from "@/components/forms/onboarding-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCurrentUser, getAllCategories } from "@/server/queries/marketplace";

export default async function OnboardingPage() {
  const [user, categories] = await Promise.all([getCurrentUser(), getAllCategories()]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Onboarding"
        title="Shape your feed around what you actually need in Maastricht."
        description="Category preferences, student status, and pickup areas help CampusSwap build a more useful home feed and recommendation mix from day one."
      />
      <OnboardingForm user={user} categories={categories} />
    </div>
  );
}
