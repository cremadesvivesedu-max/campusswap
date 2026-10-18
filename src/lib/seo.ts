import type { Metadata } from "next";
import { siteName, siteTagline } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";

export function buildMetadata(title: string, description: string): Metadata {
  // The home page passes the bare site name; "CampusSwap | CampusSwap" looked broken in Google.
  const fullTitle = title === siteName ? `${siteName} – ${siteTagline.replace(/\.$/, "")}` : `${title} | ${siteName}`;
  return {
    title: fullTitle,
    description,
    applicationName: siteName,
    metadataBase: new URL(getSiteUrl()),
    manifest: "/manifest.webmanifest",
    // favicon.ico, icon.png and apple-icon.png in src/app are linked automatically by Next.
    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      url: getSiteUrl()
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    alternates: {
      canonical: "/"
    }
  };
}

export const defaultMetadata = buildMetadata(siteName, siteTagline);
