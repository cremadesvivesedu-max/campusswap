"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode
} from "react";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import type { User } from "@/types/domain";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseBrowserConfig, isLiveClientMode } from "@/lib/public-env";

const CurrentUserContext = createContext<User | null>(null);

export function CurrentUserProvider({
  user,
  children
}: {
  user: User;
  children: ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!isLiveClientMode || !hasSupabaseBrowserConfig || !supabase) {
      return;
    }

    const subscription = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent) => {
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const user = useContext(CurrentUserContext);

  if (!user) {
    throw new Error("useCurrentUser must be used inside CurrentUserProvider.");
  }

  return user;
}

export function useOptionalCurrentUser() {
  return useContext(CurrentUserContext);
}
