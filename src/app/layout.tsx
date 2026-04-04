import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getDictionaryForRequest, getRequestLocale } from "@/lib/i18n";
import { defaultMetadata } from "@/lib/seo";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
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
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <LocaleProvider locale={locale} dictionary={dictionary}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
