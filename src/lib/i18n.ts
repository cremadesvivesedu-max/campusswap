import { cookies } from "next/headers";
import {
  dictionaries,
  localeCookieName,
  supportedLocales,
  type AppLocale,
  type Dictionary
} from "@/lib/i18n-shared";

function isAppLocale(value: string | undefined): value is AppLocale {
  return supportedLocales.includes(value as AppLocale);
}

export {
  dictionaries,
  localeCookieName,
  supportedLocales,
  type AppLocale,
  type Dictionary
};

export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const requested = cookieStore.get(localeCookieName)?.value;
  return isAppLocale(requested) ? requested : "en";
}

export async function getDictionaryForRequest(): Promise<Dictionary> {
  const locale = await getRequestLocale();
  return dictionaries[locale];
}
