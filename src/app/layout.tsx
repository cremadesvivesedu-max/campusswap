import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "@/app/globals.css";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { getDictionaryForRequest, getRequestLocale } from "@/lib/i18n";
import { defaultMetadata } from "@/lib/seo";
import { siteName } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";

// One friendly, rounded sans for everything (closer to Wallapop than the old
// techy Space Grotesk headings). Headings just use heavier weights.
const bodyFont = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body"
});

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [locale, dictionary] = await Promise.all([
    getRequestLocale(),
    getDictionaryForRequest()
  ]);

  return (
    <html lang={locale}>
      <body className={`${bodyFont.variable} font-body`}>
        <LocaleProvider locale={locale} dictionary={dictionary}>
          {children}
        </LocaleProvider>
        <ServiceWorkerRegister />
        {/* Tells search engines the site's name and logo (shown next to results). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: getSiteUrl() },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: siteName,
                url: getSiteUrl(),
                logo: `${getSiteUrl()}/icon.png`
              }
            ])
          }}
        />
      </body>
    </html>
  );
}
