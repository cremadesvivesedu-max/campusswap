import { createBrowserClient } from "@supabase/ssr";
import { env, supabasePublicKey } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !supabasePublicKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      supabasePublicKey
    );
  }

  return browserClient;
}
