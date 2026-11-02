import type { MetadataRoute } from "next";
import { categoryLandings } from "@/features/seo/category-landings";
import { listedPartners } from "@/features/partners/partners";
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

  return [
    ...routes,
    ...categoryLandings.map((landing) => `/maastricht/${landing.slug}`),
    ...(listedPartners.length > 0 ? ["/partners", ...listedPartners.map((partner) => `/partners/${partner.slug}`)] : [])
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date()
  }));
}
