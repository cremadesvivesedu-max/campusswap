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
        title="Create your CampusSwap account and enter the marketplace right away."
        description="Any valid email can create an account. Student verification stays available as an optional trust layer for stronger badges and safer meetup signaling."
      />
      <SignupForm allowedDomains={allowedDomains.map((domain) => domain.domain)} />
    </div>
  );
}
