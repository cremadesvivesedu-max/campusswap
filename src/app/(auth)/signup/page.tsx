import { SignupForm } from "@/components/forms/signup-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { redirectIfAuthenticated } from "@/lib/auth/server";
import { getAllowedEmailDomains } from "@/server/queries/marketplace";

export default async function SignupPage() {
  await redirectIfAuthenticated("/app");
  const allowedDomains = await getAllowedEmailDomains();

  return (
    <div className="mx-auto max-w-xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Create account"
        title="Start with a student email and unlock a safer marketplace."
        description="CampusSwap uses university email verification and onboarding preferences to keep the marketplace local, useful, and trustworthy."
      />
      <SignupForm allowedDomains={allowedDomains.map((domain) => domain.domain)} />
    </div>
  );
}
