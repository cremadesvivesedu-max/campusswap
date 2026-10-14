import type { Dictionary } from "@/lib/i18n-shared";
import { translateServerMessage } from "@/lib/server-messages";

/** Turns known database errors and server messages into text people can read in their language. */
export function friendlyError(message: string, dictionary: Dictionary) {
  if (message.includes("rate_limited")) {
    return dictionary.limits.tooFast;
  }
  return translateServerMessage(message, dictionary.localeCode);
}
