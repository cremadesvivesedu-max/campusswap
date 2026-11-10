import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, supabasePublicKey } from "@/lib/env";

/**
 * Header the database checks before accepting writes to business tables
 * (migration 0023). Only the server knows the token, so requests made from a
 * browser with the public key can't skip our server-side checks.
 */
export function trustedServerHeaders(): Record<string, string> {
  return env.SERVER_DB_TOKEN ? { "x-campusswap-server": env.SERVER_DB_TOKEN } : {};
}

interface SupabaseCookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none" | boolean;
  secure?: boolean;
}

interface SupabaseCookieRecord {
  name: string;
  value: string;
  options: SupabaseCookieOptions;
}

export async function createServerSupabaseClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !supabasePublicKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, supabasePublicKey, {
    global: { headers: trustedServerHeaders() },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieRecord[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can read cookies but may not always be able to write them.
        }
      }
    }
  });
}
