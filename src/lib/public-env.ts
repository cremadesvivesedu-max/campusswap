export const publicAppMode =
  process.env.NEXT_PUBLIC_APP_MODE === "live" ? "live" : "demo";

export const isLiveClientMode = publicAppMode === "live";

export const hasSupabaseBrowserConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

/** Turn on once Google is configured as a provider in Supabase Auth. */
export const isGoogleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
