import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env, supabasePublicKey } from "@/lib/env";
import { buildSiteUrl, sanitizeInternalPath } from "@/lib/site-url";

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

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeInternalPath(requestUrl.searchParams.get("next"), "/app");
  let response = NextResponse.redirect(buildSiteUrl(next));

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !supabasePublicKey || !code) {
    return NextResponse.redirect(buildSiteUrl("/login"));
  }

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, supabasePublicKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieRecord[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(buildSiteUrl("/login?error=auth_callback_failed"));
  }

  return response;
}
