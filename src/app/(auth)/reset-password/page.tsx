import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";

export default async function ResetPasswordPage() {
  const dictionary = await getDictionaryForRequest();

  return (
    <div className="mx-auto max-w-xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow={dictionary.auth.resetPassword.eyebrow}
        title={dictionary.auth.resetPassword.title}
        description={dictionary.auth.resetPassword.description}
      />
      <ResetPasswordForm />
    </div>
  );
}
