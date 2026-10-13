import type { Dictionary } from "@/lib/i18n-shared";

/** Turns known database errors into text people can act on; anything else passes through. */
export function friendlyError(message: string, dictionary: Dictionary) {
  if (message.includes("rate_limited")) {
    return dictionary.limits.tooFast;
  }
  return message;
}
