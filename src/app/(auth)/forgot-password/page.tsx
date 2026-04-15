import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { redirectIfAuthenticated } from "@/lib/auth/server";
import { getDictionaryForRequest } from "@/lib/i18n";

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated("/app");
  const dictionary = await getDictionaryForRequest();

  return (
    <div className="mx-auto max-w-xl space-y-8 px-5 py-6 sm:px-8 sm:py-8">
      <SectionHeading
        eyebrow={dictionary.auth.forgotPassword.eyebrow}
        title={dictionary.auth.forgotPassword.title}
        description={dictionary.auth.forgotPassword.description}
      />
      <ForgotPasswordForm />
    </div>
  );
}
