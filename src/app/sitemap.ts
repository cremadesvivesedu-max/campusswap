import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const routes = [
  "/",
  "/how-it-works",
  "/categories",
  "/featured",
  "/outlet",
  "/trust-safety",
  "/faq",
  "/join",
  "/privacy",
  "/terms",
  "/login",
  "/signup"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date()
  }));
}
