"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { dictionaries, localeCookieName, supportedLocales } from "@/lib/i18n-shared";
import { useLocale } from "@/components/providers/locale-provider";

export function LanguageSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const { locale, dictionary } = useLocale();

  return (
    <label
      className={`relative inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
        tone === "light"
          ? "border-white/15 bg-slate-950/50 text-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.22)]"
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
        className={`appearance-none rounded-full border-0 pl-1 pr-7 text-sm outline-none ring-0 ${
          tone === "light"
            ? "bg-transparent text-white"
            : "bg-transparent text-slate-700"
        }`}
      >
        {supportedLocales.map((value) => (
          <option key={value} value={value} className="bg-white text-slate-900">
            {dictionaries[value].localeLabel}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-3 h-4 w-4 ${
          tone === "light" ? "text-white" : "text-slate-500"
        }`}
      />
    </label>
  );
}
