import { SignupForm } from "@/components/forms/signup-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { redirectIfAuthenticated } from "@/lib/auth/server";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getAllowedEmailDomains } from "@/server/queries/marketplace";

export default async function SignupPage() {
  await redirectIfAuthenticated("/app");
  const [allowedDomains, dictionary] = await Promise.all([
    getAllowedEmailDomains(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="mx-auto max-w-xl space-y-8 px-5 py-6 sm:px-8 sm:py-8">
      <SectionHeading
        eyebrow={dictionary.auth.signup.eyebrow}
        title={dictionary.auth.signup.title}
        description={dictionary.auth.signup.description}
      />
      <SignupForm allowedDomains={allowedDomains.map((domain) => domain.domain)} />
    </div>
  );
}
