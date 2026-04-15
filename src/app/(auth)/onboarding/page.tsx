import { OnboardingForm } from "@/components/forms/onboarding-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getCurrentUser, getAllCategories } from "@/server/queries/marketplace";

export default async function OnboardingPage() {
  const [user, categories, dictionary] = await Promise.all([
    getCurrentUser(),
    getAllCategories(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-6 sm:px-8 sm:py-8">
      <SectionHeading
        eyebrow={dictionary.auth.onboarding.eyebrow}
        title={dictionary.auth.onboarding.title}
        description={dictionary.auth.onboarding.description}
      />
      <OnboardingForm user={user} categories={categories} />
    </div>
  );
}
