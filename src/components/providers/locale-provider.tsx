"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppLocale, Dictionary } from "@/lib/i18n-shared";

const LocaleContext = createContext<{ locale: AppLocale; dictionary: Dictionary } | null>(
  null
);

export function LocaleProvider({
  locale,
  dictionary,
  children
}: {
  locale: AppLocale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider.");
  }

  return context;
}
