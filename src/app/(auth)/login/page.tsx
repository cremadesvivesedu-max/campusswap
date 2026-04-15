import { redirectIfAuthenticated } from "@/lib/auth/server";
import { getDictionaryForRequest } from "@/lib/i18n";
import { LoginForm } from "@/components/forms/login-form";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function LoginPage() {
  await redirectIfAuthenticated("/app");
  const dictionary = await getDictionaryForRequest();

  return (
    <div className="mx-auto max-w-xl space-y-8 px-5 py-6 sm:px-8 sm:py-8">
      <SectionHeading
        eyebrow={dictionary.auth.login.eyebrow}
        title={dictionary.auth.login.title}
        description={dictionary.auth.login.description}
      />
      <LoginForm />
    </div>
  );
}
