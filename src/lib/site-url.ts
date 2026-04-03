function normalizeUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function getSiteUrl() {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeUrl(process.env.NEXT_PUBLIC_VERCEL_URL) ??
    normalizeUrl(process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL) ??
    normalizeUrl(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ??
    "http://localhost:3000"
  );
}

export function buildSiteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
