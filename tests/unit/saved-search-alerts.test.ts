import { describe, expect, it } from "vitest";
import { demoData } from "@/lib/demo-data";
import {
  findMatchingSavedSearches,
  type SavedSearchAlertRow
} from "@/server/services/saved-search-alerts";
import {
  preferenceForNotificationType,
  SAVED_SEARCH_ALERT_TITLES
} from "@/server/services/email-notifications";

const desk = demoData.listings.find((listing) => listing.id === "listing-desk-1")!;

function savedSearch(overrides: Partial<SavedSearchAlertRow>): SavedSearchAlertRow {
  return {
    id: "search-1",
    user_id: "buyer-1",
    name: "Test search",
    query: null,
    category_slug: null,
    subcategory_slug: null,
    price_min: null,
    price_max: null,
    conditions: [],
    outlet_only: false,
    featured_only: false,
    minimum_seller_rating: null,
    pickup_area: null,
    distance_bucket: null,
    ...overrides
  };
}

describe("saved-search alerts", () => {
  it("matches a new listing against category and maximum price", () => {
    const cheapEnough = savedSearch({ category_slug: "furniture", price_max: String(desk.price) });
    const tooCheap = savedSearch({ id: "search-2", category_slug: "furniture", price_max: desk.price - 1 });
    const otherCategory = savedSearch({ id: "search-3", category_slug: "bikes" });

    const matches = findMatchingSavedSearches(desk, [cheapEnough, tooCheap, otherCategory], desk.sellerId);

    expect(matches.map((row) => row.id)).toEqual(["search-1"]);
  });

  it("matches on the words of the search", () => {
    const word = desk.title.split(" ")[0];
    const matches = findMatchingSavedSearches(
      desk,
      [savedSearch({ query: word }), savedSearch({ id: "search-2", query: "zzzz-nothing" })],
      desk.sellerId
    );

    expect(matches.map((row) => row.id)).toEqual(["search-1"]);
  });

  it("never alerts sellers about their own listing", () => {
    const own = savedSearch({ user_id: desk.sellerId, category_slug: desk.categorySlug });
    expect(findMatchingSavedSearches(desk, [own], desk.sellerId)).toEqual([]);
  });

  it("ignores listings that are not visible yet", () => {
    const pending = { ...desk, status: "pending-review" as const };
    expect(findMatchingSavedSearches(pending, [savedSearch({})], desk.sellerId)).toEqual([]);
  });

  it("emails saved-search alerts under the saved-search preference", () => {
    expect(preferenceForNotificationType("listing", SAVED_SEARCH_ALERT_TITLES.newMatch)).toBe(
      "saved_searches"
    );
    expect(preferenceForNotificationType("listing", SAVED_SEARCH_ALERT_TITLES.priceDrop)).toBe(
      "saved_searches"
    );
    expect(preferenceForNotificationType("listing", "Listing is live")).toBe("listing_updates");
  });
});
