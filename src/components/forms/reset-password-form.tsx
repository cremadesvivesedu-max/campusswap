"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseBrowserConfig, isLiveClientMode } from "@/lib/public-env";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();

    if (!isLiveClientMode || !hasSupabaseBrowserConfig || !supabase) {
      setError("Supabase auth is not configured yet.");
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsRecoveryReady(true);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsRecoveryReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isRecoveryReady) {
    return (
      <div className="space-y-5 rounded-[30px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-7">
        <p className="text-sm text-slate-700">{dictionary.auth.resetPassword.invalidLink}</p>
        <Link
          href="/forgot-password"
          className="block rounded-[22px] border border-slate-200/80 bg-slate-100/80 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-950"
        >
          {dictionary.auth.forgotPassword.eyebrow}
        </Link>
      </div>
    );
  }

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

          if (password !== confirmPassword) {
            setError(dictionary.auth.resetPassword.mismatch);
            return;
          }

          setError(null);

          const { error: updateError } = await supabase.auth.updateUser({
            password
          });

          if (updateError) {
            setError(updateError.message);
            return;
          }

          router.replace("/login?reset=success");
          router.refresh();
        });
      }}
    >
      <Input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={dictionary.auth.resetPassword.passwordPlaceholder}
      />
      <Input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder={dictionary.auth.resetPassword.confirmPasswordPlaceholder}
      />
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending
          ? dictionary.auth.resetPassword.submitting
          : dictionary.auth.resetPassword.submit}
      </Button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <Link
        href="/login"
        className="block rounded-[22px] border border-slate-200/80 bg-slate-100/80 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-950"
      >
        {dictionary.auth.resetPassword.backToLogin}
      </Link>
    </form>
  );
}
