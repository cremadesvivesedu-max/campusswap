import type { Metadata } from "next";
import { siteName, siteTagline } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";

export function buildMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} | ${siteName}`,
    description,
    applicationName: siteName,
    metadataBase: new URL(getSiteUrl()),
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" }
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }]
    },
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
