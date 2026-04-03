import { cache } from "react";
import { redirect } from "next/navigation";
import type { User as AuthUser } from "@supabase/supabase-js";
import { isLiveMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getOptionalAuthUser = cache(async (): Promise<AuthUser | null> => {
  if (!isLiveMode) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});

export async function redirectIfAuthenticated(destination = "/app") {
  const user = await getOptionalAuthUser();
  if (user) {
    redirect(destination);
  }
}

export async function requireAuthUser(nextPath = "/app") {
  const user = await getOptionalAuthUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}
