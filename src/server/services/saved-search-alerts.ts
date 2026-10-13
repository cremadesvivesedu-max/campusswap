// Saved-search alerts: when a listing goes live (or gets cheaper), tell the people
// whose saved searches it matches. Matching is pure so it stays testable; the
// notify* functions do the I/O with the service-role client.
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { filterListings, type DiscoveryFilters } from "@/features/search/discovery";
import { getListingById } from "@/server/queries/marketplace";
import { SAVED_SEARCH_ALERT_TITLES } from "@/server/services/email-notifications";
import type { Listing, ListingCondition } from "@/types/domain";

export const SAVED_SEARCH_PREFERENCE = "saved_searches";

const savedSearchAlertSelect =
  "id, user_id, name, query, category_slug, subcategory_slug, price_min, price_max, conditions, outlet_only, featured_only, minimum_seller_rating, pickup_area, distance_bucket";

export interface SavedSearchAlertRow {
  id: string;
  user_id: string;
  name: string;
  query: string | null;
  category_slug: string | null;
  subcategory_slug: string | null;
  price_min: number | string | null;
  price_max: number | string | null;
  conditions: ListingCondition[] | null;
  outlet_only: boolean;
  featured_only: boolean;
  minimum_seller_rating: number | string | null;
  pickup_area: string | null;
  distance_bucket: DiscoveryFilters["distance"] | null;
}

interface ProfileNotificationRow {
  user_id: string;
  notification_preferences: string[] | null;
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function buildSavedSearchDiscoveryFilters(
  row: SavedSearchAlertRow
): DiscoveryFilters {
  return {
    query: row.query ?? "",
    categorySlug: row.category_slug ?? undefined,
    subcategorySlug: row.subcategory_slug ?? undefined,
    priceMin: row.price_min === null ? undefined : toNumber(row.price_min),
    priceMax: row.price_max === null ? undefined : toNumber(row.price_max),
    conditions: row.conditions ?? [],
    outletOnly: row.outlet_only,
    featuredOnly: row.featured_only,
    minimumSellerRating:
      row.minimum_seller_rating === null
        ? undefined
        : toNumber(row.minimum_seller_rating),
    pickupArea: row.pickup_area ?? undefined,
    distance: row.distance_bucket ?? undefined,
    sort: "recommended"
  };
}

/** Saved searches (not owned by the seller) that this listing satisfies. */
export function findMatchingSavedSearches(
  listing: Listing,
  rows: SavedSearchAlertRow[],
  sellerId: string
) {
  return rows.filter(
    (row) =>
      row.user_id !== sellerId &&
      filterListings([listing], buildSavedSearchDiscoveryFilters(row)).length > 0
  );
}

async function getNotificationPreferencesMap(
  userIds: string[],
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>
) {
  const resolvedIds = [...new Set(userIds.filter(Boolean))];

  if (!resolvedIds.length) {
    return new Map<string, string[]>();
  }

  const { data } = await admin
    .from("profiles")
    .select("user_id, notification_preferences")
    .in("user_id", resolvedIds);

  return new Map<string, string[]>(
    (((data as ProfileNotificationRow[] | null) ?? []).map((row) => [
      row.user_id,
      row.notification_preferences ?? []
    ]))
  );
}

async function insertListingAlertEventIfNew(
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>,
  payload: {
    userId: string;
    savedSearchId?: string;
    listingId: string;
    eventType: string;
    dedupeKey: string;
    priceFrom?: number;
    priceTo?: number;
  }
) {
  const { error } = await admin.from("listing_alert_events").insert({
    user_id: payload.userId,
    saved_search_id: payload.savedSearchId ?? null,
    listing_id: payload.listingId,
    event_type: payload.eventType,
    dedupe_key: payload.dedupeKey,
    price_from: payload.priceFrom ?? null,
    price_to: payload.priceTo ?? null
  });

  if (!error) {
    return true;
  }

  if (error.code === "23505") {
    return false;
  }

  throw new Error(error.message);
}

export async function notifySavedSearchMatchesForListing(input: {
  listing: Listing;
  sellerId: string;
}) {
  const admin = createAdminSupabaseClient();

  if (!admin || input.listing.status !== "active") {
    return;
  }

  const { data } = await admin
    .from("saved_searches")
    .select(savedSearchAlertSelect)
    .neq("user_id", input.sellerId);

  const matchingRows = findMatchingSavedSearches(
    input.listing,
    (data as SavedSearchAlertRow[] | null) ?? [],
    input.sellerId
  );

  const preferencesByUserId = await getNotificationPreferencesMap(
    matchingRows.map((row) => row.user_id),
    admin
  );

  for (const row of matchingRows) {
    const preferences = preferencesByUserId.get(row.user_id) ?? [];

    if (!preferences.includes(SAVED_SEARCH_PREFERENCE)) {
      continue;
    }

    const inserted = await insertListingAlertEventIfNew(admin, {
      userId: row.user_id,
      savedSearchId: row.id,
      listingId: input.listing.id,
      eventType: "new-match",
      dedupeKey: `new-match:${row.user_id}:${input.listing.id}`
    });

    if (!inserted) {
      continue;
    }

    await admin.from("notifications").insert({
      user_id: row.user_id,
      type: "listing",
      title: SAVED_SEARCH_ALERT_TITLES.newMatch,
      body: `${input.listing.title} matches your saved search "${row.name}".`,
      destination_href: `/app/listings/${input.listing.id}`
    });
  }
}

export async function notifyPriceDropWatchers(input: {
  listing: Listing;
  sellerId: string;
  previousPrice: number;
  newPrice: number;
}) {
  if (input.newPrice >= input.previousPrice) {
    return;
  }

  const admin = createAdminSupabaseClient();

  if (
    !admin ||
    ["hidden", "archived", "pending-review", "sold"].includes(input.listing.status)
  ) {
    return;
  }

  const [{ data: favoriteRows }, { data: savedSearchRows }] = await Promise.all([
    admin.from("favorites").select("user_id").eq("listing_id", input.listing.id),
    admin
      .from("saved_searches")
      .select(savedSearchAlertSelect)
      .neq("user_id", input.sellerId)
  ]);

  const favoriteUserIds = [
    ...new Set(
      (((favoriteRows as { user_id: string }[] | null) ?? []).map((row) => row.user_id))
    )
  ].filter((userId) => userId !== input.sellerId);
  const matchingSavedSearches = findMatchingSavedSearches(
    input.listing,
    (savedSearchRows as SavedSearchAlertRow[] | null) ?? [],
    input.sellerId
  );
  const preferencesByUserId = await getNotificationPreferencesMap(
    [
      ...favoriteUserIds,
      ...matchingSavedSearches.map((row) => row.user_id)
    ],
    admin
  );
  const processedUserIds = new Set<string>();

  for (const userId of favoriteUserIds) {
    const preferences = preferencesByUserId.get(userId) ?? [];

    if (!preferences.includes("listing_updates")) {
      continue;
    }

    const inserted = await insertListingAlertEventIfNew(admin, {
      userId,
      listingId: input.listing.id,
      eventType: "price-drop",
      dedupeKey: `price-drop:${userId}:${input.listing.id}:${input.newPrice.toFixed(2)}`,
      priceFrom: input.previousPrice,
      priceTo: input.newPrice
    });

    if (!inserted) {
      processedUserIds.add(userId);
      continue;
    }

    await admin.from("notifications").insert({
      user_id: userId,
      type: "listing",
      title: "Price dropped on a saved listing",
      body: `${input.listing.title} dropped from EUR ${input.previousPrice.toFixed(2)} to EUR ${input.newPrice.toFixed(2)}.`,
      destination_href: `/app/listings/${input.listing.id}`
    });
    processedUserIds.add(userId);
  }

  for (const row of matchingSavedSearches) {
    if (processedUserIds.has(row.user_id)) {
      continue;
    }

    const preferences = preferencesByUserId.get(row.user_id) ?? [];

    if (!preferences.includes(SAVED_SEARCH_PREFERENCE)) {
      continue;
    }

    const inserted = await insertListingAlertEventIfNew(admin, {
      userId: row.user_id,
      savedSearchId: row.id,
      listingId: input.listing.id,
      eventType: "price-drop",
      dedupeKey: `price-drop:${row.user_id}:${input.listing.id}:${input.newPrice.toFixed(2)}`,
      priceFrom: input.previousPrice,
      priceTo: input.newPrice
    });

    if (!inserted) {
      continue;
    }

    await admin.from("notifications").insert({
      user_id: row.user_id,
      type: "listing",
      title: SAVED_SEARCH_ALERT_TITLES.priceDrop,
      body: `${input.listing.title} now matches "${row.name}" at a lower price: EUR ${input.newPrice.toFixed(2)}.`,
      destination_href: `/app/listings/${input.listing.id}`
    });
  }
}

/**
 * For listings that go live outside the seller's own form, e.g. when an admin
 * approves one that was waiting in moderation.
 */
export async function notifySavedSearchMatchesForListingId(listingId: string) {
  const listing = await getListingById(listingId);

  if (!listing) {
    return;
  }

  await notifySavedSearchMatchesForListing({ listing, sellerId: listing.sellerId });
}
