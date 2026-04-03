"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseBrowserConfig, isLiveClientMode } from "@/lib/public-env";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          startTransition(async () => {
            const supabase = createClient();

            if (!isLiveClientMode || !hasSupabaseBrowserConfig || !supabase) {
              setError(
                "Supabase auth is not configured yet. Switch to live mode to use sign out."
              );
              return;
            }

            setError(null);
            const { error: signOutError } = await supabase.auth.signOut();

            if (signOutError) {
              setError(signOutError.message);
              return;
            }

            router.replace("/");
            router.refresh();
          });
        }}
        disabled={isPending}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
