import { redirectIfAuthenticated } from "@/lib/auth/server";
import { LoginForm } from "@/components/forms/login-form";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function LoginPage() {
  await redirectIfAuthenticated("/app");

  return (
    <div className="mx-auto max-w-xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Login"
        title="Welcome back to CampusSwap."
        description="Use your student account to pick up where you left off with saved listings, messages, and meetup planning."
      />
      <LoginForm />
    </div>
  );
}
