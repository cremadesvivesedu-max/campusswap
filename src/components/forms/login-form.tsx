"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseBrowserConfig, isLiveClientMode } from "@/lib/public-env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </Button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <p className="text-sm text-slate-500">
        No account yet?{" "}
        <Link href="/signup" className="font-semibold text-slate-950">
          Create one
        </Link>
      </p>
    </form>
  );
}
