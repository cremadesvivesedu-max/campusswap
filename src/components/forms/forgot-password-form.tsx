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
      className="space-y-5 rounded-[30px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-7"
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
      <Link
        href="/login"
        className="block rounded-[22px] border border-slate-200/80 bg-slate-100/80 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-950"
      >
        {dictionary.auth.forgotPassword.backToLogin}
      </Link>
    </form>
  );
}
