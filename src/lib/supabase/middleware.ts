import { NextResponse, type NextRequest } from "next/server";
import { isReferralCode, REFERRAL_COOKIE } from "@/features/referrals/code";
import { createServerClient } from "@supabase/ssr";
import { env, supabasePublicKey } from "@/lib/env";

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

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !supabasePublicKey) {
    return response;
  }

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, supabasePublicKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieRecord[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  await supabase.auth.getUser();

  // Invite links (?ref=abcd1234) are remembered for 30 days so the signup can credit the inviter.
  const ref = request.nextUrl.searchParams.get("ref");
  if (isReferralCode(ref) && !request.cookies.get(REFERRAL_COOKIE)) {
    response.cookies.set(REFERRAL_COOKIE, ref.toLowerCase(), {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax"
    });
  }

  return response;
}
