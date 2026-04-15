"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseBrowserConfig, isLiveClientMode } from "@/lib/public-env";
import { buildSiteUrl } from "@/lib/site-url";
import { getEmailDomain } from "@/lib/verification";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SignupFormProps {
  allowedDomains: string[];
}

export function SignupForm({ allowedDomains }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5 rounded-[30px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();

        startTransition(async () => {
          const supabase = createClient();

          if (!isLiveClientMode || !hasSupabaseBrowserConfig || !supabase) {
            setError(
              "Supabase auth is not configured yet. Set live mode and the public Supabase keys to enable sign up."
            );
            return;
          }

          const normalizedEmail = email.trim().toLowerCase();
          const emailDomain = getEmailDomain(normalizedEmail);

          setError(null);
          setStatus(null);

          const { data, error: signupError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              emailRedirectTo: buildSiteUrl("/auth/callback?next=/onboarding"),
              data: {
                full_name: name.trim(),
                university_email_domain: emailDomain
              }
            }
          });

          if (signupError) {
            setError(signupError.message);
            return;
          }

          const nextPath = searchParams.get("next") || "/app";

          if (data.session) {
            router.replace(nextPath === "/app" ? "/onboarding" : nextPath);
            router.refresh();
            return;
          }

          setStatus(
            "Account created. Check your inbox if email confirmation is enabled. Student verification stays optional."
          );
          router.replace(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
          router.refresh();
        });
      }}
    >
      <div className="grid gap-4">
        <Input
          name="name"
          placeholder={dictionary.auth.signup.namePlaceholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          name="email"
          type="email"
          placeholder={dictionary.auth.signup.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          name="password"
          type="password"
          placeholder={dictionary.auth.signup.passwordPlaceholder}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending
          ? dictionary.auth.signup.submitting
          : dictionary.auth.signup.submit}
      </Button>
      <p className="rounded-[22px] border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-xs leading-6 text-slate-500">
        {dictionary.auth.signup.domainHint}{" "}
        {allowedDomains.join(", ")}
      </p>
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
