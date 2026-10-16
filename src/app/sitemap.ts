import type { MetadataRoute } from "next";
import { categoryLandings } from "@/features/seo/category-landings";
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

  return [...routes, ...categoryLandings.map((landing) => `/maastricht/${landing.slug}`)].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date()
  }));
}
