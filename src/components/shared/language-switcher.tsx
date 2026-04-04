"use client";

import { useRouter } from "next/navigation";
import { dictionaries, localeCookieName, supportedLocales } from "@/lib/i18n-shared";
import { useLocale } from "@/components/providers/locale-provider";

export function LanguageSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const { locale, dictionary } = useLocale();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
        tone === "light"
          ? "border-white/15 bg-white/10 text-slate-100"
          : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.16em]">
        {dictionary.languageSwitcher.label}
      </span>
      <select
        value={locale}
        onChange={(event) => {
          document.cookie = `${localeCookieName}=${event.target.value}; path=/; max-age=31536000; SameSite=Lax`;
          router.refresh();
        }}
        className={`bg-transparent text-sm outline-none ${
          tone === "light" ? "text-white" : "text-slate-700"
        }`}
      >
        {supportedLocales.map((value) => (
          <option key={value} value={value}>
            {dictionaries[value].localeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
