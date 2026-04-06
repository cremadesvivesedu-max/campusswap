"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseBrowserConfig, isLiveClientMode } from "@/lib/public-env";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const resetWasSuccessful = searchParams.get("reset") === "success";

  return (
    <form
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow"
      onSubmit={(event) => {
        event.preventDefault();

        startTransition(async () => {
          const supabase = createClient();

          if (!isLiveClientMode || !hasSupabaseBrowserConfig || !supabase) {
            setError(
              "Supabase auth is not configured yet. Set live mode and the public Supabase keys to enable login."
            );
            return;
          }

          setError(null);

          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

          if (signInError) {
            setError(signInError.message);
            return;
          }

          const nextPath = searchParams.get("next") || "/app";
          router.replace(nextPath);
          router.refresh();
        });
      }}
    >
      <Input
        type="email"
        placeholder={dictionary.auth.login.emailPlaceholder}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        type="password"
        placeholder={dictionary.auth.login.passwordPlaceholder}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-slate-600 hover:text-slate-950">
          {dictionary.auth.login.forgotPassword}
        </Link>
      </div>
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? dictionary.auth.login.submitting : dictionary.auth.login.submit}
      </Button>
      {resetWasSuccessful ? (
        <p className="text-sm text-emerald-700">{dictionary.auth.resetPassword.success}</p>
      ) : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <p className="text-sm text-slate-500">
        {dictionary.auth.login.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-slate-950">
          {dictionary.auth.login.createOne}
        </Link>
      </p>
    </form>
  );
}
