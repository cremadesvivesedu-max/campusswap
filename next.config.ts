import type { NextConfig } from "next";

function getSupabaseHostname() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com"
  }
];

const supabaseHostname = getSupabaseHostname();

if (supabaseHostname) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseHostname
  });
}

// Security headers. The CSP lists every outside host the browser talks to:
// Supabase (API + realtime), image hosts, Vercel Analytics/preview toolbar and
// the Stripe/Google pages we redirect to. Anything else is blocked, so an
// injected script can't load code or send data elsewhere.
const isDev = process.env.NODE_ENV !== "production";
const supabaseOrigin = supabaseHostname ? `https://${supabaseHostname}` : "";
const supabaseSocket = supabaseHostname ? `wss://${supabaseHostname}` : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com ${supabaseOrigin} https://vercel.live https://vercel.com`,
  "font-src 'self' data: https://vercel.live",
  `connect-src 'self' ${supabaseOrigin} ${supabaseSocket} https://va.vercel-scripts.com https://vercel.live wss://ws-us3.pusher.com${isDev ? " ws:" : ""}`,
  "frame-src https://vercel.live",
  "worker-src 'self'",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${supabaseOrigin} https://checkout.stripe.com https://connect.stripe.com https://accounts.google.com`,
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"])
]
  .map((directive) => directive.replace(/\s+/g, " ").trim())
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" }
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns,
    // Listing cards use 58 to stay light; 75 is the default elsewhere.
    qualities: [58, 75]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  }
};

export default nextConfig;
