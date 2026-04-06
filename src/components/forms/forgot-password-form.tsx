"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildSiteUrl } from "@/lib/site-url";
import { hasSupabaseBrowserConfig, isLiveClientMode } from "@/lib/public-env";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const { dictionary } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow"
      onSubmit={(event) => {
        event.preventDefault();

        startTransition(async () => {
          const supabase = createClient();

          if (!isLiveClientMode || !hasSupabaseBrowserConfig || !supabase) {
            setError("Supabase auth is not configured yet.");
            return;
          }

          setError(null);
          setStatus(null);

          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email.trim(),
            {
              redirectTo: buildSiteUrl("/reset-password")
            }
          );

          if (resetError) {
            setError(resetError.message);
            return;
          }

          setStatus(dictionary.auth.forgotPassword.success);
        });
      }}
    >
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={dictionary.auth.forgotPassword.emailPlaceholder}
      />
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending
          ? dictionary.auth.forgotPassword.submitting
          : dictionary.auth.forgotPassword.submit}
      </Button>
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <Link href="/login" className="block text-sm font-medium text-slate-600 hover:text-slate-950">
        {dictionary.auth.forgotPassword.backToLogin}
      </Link>
    </form>
  );
}
