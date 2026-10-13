import { dictionaries, type Dictionary } from "@/lib/i18n-shared";
import { friendlyError } from "@/lib/friendly-error";

describe("friendlyError", () => {
  it("explains database rate limits in the reader's language", () => {
    expect(friendlyError("rate_limited: 40 per 00:10:00", dictionaries.es as unknown as Dictionary)).toMatch(/rápido/);
    expect(friendlyError("rate_limited: 10 per 01:00:00", dictionaries.en as unknown as Dictionary)).toMatch(/too fast|a bit fast/);
  });

  it("leaves other errors untouched", () => {
    expect(friendlyError("Network down", dictionaries.en as unknown as Dictionary)).toBe("Network down");
  });
});
