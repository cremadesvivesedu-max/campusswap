"use server";

// Seller tools of November 2026: hidden minimum price, 48-hour clearance, EUR 0.99 bump and
// the seller's residence (CO2 ranking and ambassadors). Ownership is always checked on the
// server with the admin client filtered by seller_id: the browser never decides who owns what.

import { revalidatePath } from "next/cache";
import { isLiveMode } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createBumpCheckoutSession, stripe } from "@/lib/payments/stripe";
import { getCurrentUser, getListingById } from "@/server/queries/marketplace";
import { notifyPriceDropWatchers } from "@/server/services/saved-search-alerts";
import {
  BUMP_PRICE_EUR,
  CLEARANCE_HOURS,
  canBump,
  clearancePrice,
  isResidence,
  validMinimum
} from "@/features/impact/seller-tools";

type Result = { success: boolean; message: string; url?: string; count?: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function context() {
  const user = await getCurrentUser();
  const admin = createAdminSupabaseClient();
  return { user, admin };
}

/** Hidden minimum: offers at or above it are accepted on their own. null removes it. */
export async function saveAutoAcceptAction(listingId: string, minAmount: number | null): Promise<Result> {
  if (!UUID.test(listingId)) return { success: false, message: "invalid" };
  if (!isLiveMode) return { success: true, message: "saved" };
  const { user, admin } = await context();
  if (!admin) return { success: false, message: "unavailable" };

  const { data: listing } = await admin
    .from("listings")
    .select("id, price, status")
    .eq("id", listingId)
    .eq("seller_id", user.id)
    .maybeSingle();
  if (!listing || ["sold", "archived", "hidden"].includes(listing.status)) return { success: false, message: "not-found" };

  if (minAmount === null) {
    await admin.from("listing_auto_accept").delete().eq("listing_id", listingId).eq("seller_id", user.id);
    revalidatePath(`/app/listings/${listingId}`);
    return { success: true, message: "removed" };
  }

  const minimum = Math.round(Number(minAmount) * 100) / 100;
  if (!validMinimum(minimum, Number(listing.price))) return { success: false, message: "invalid-minimum" };

  const { error } = await admin
    .from("listing_auto_accept")
    .upsert({ listing_id: listingId, seller_id: user.id, min_amount: minimum, updated_at: new Date().toISOString() });
  if (error) return { success: false, message: error.message };
  revalidatePath(`/app/listings/${listingId}`);
  return { success: true, message: "saved" };
}

/** Only the seller ever reads their own minimum (RLS policy + this filter). */
export async function getAutoAcceptAction(listingId: string): Promise<number | null> {
  if (!UUID.test(listingId) || !isLiveMode) return null;
  const { user, admin } = await context();
  if (!admin) return null;
  const { data } = await admin
    .from("listing_auto_accept")
    .select("min_amount")
    .eq("listing_id", listingId)
    .eq("seller_id", user.id)
    .maybeSingle();
  return data ? Number(data.min_amount) : null;
}

/**
 * Moving-out clearance: cuts every active, priced listing of the seller by `percent`
 * for 48 hours. The cut stays afterwards (it is a sale, not a loan); the countdown ends.
 */
export async function startClearanceAction(percent: number): Promise<Result> {
  if (!isLiveMode) return { success: true, message: "started", count: 0 };
  const { user, admin } = await context();
  if (!admin) return { success: false, message: "unavailable" };

  const { data: listings } = await admin
    .from("listings")
    .select("id, price, clearance_until")
    .eq("seller_id", user.id)
    .eq("status", "active")
    .gt("price", 0);

  const until = new Date(Date.now() + CLEARANCE_HOURS * 3600_000).toISOString();
  let count = 0;
  for (const row of listings ?? []) {
    if (row.clearance_until && Date.parse(row.clearance_until) > Date.now()) continue; // already on clearance
    const previous = Number(row.price);
    const next = clearancePrice(previous, percent);
    if (next === null || next >= previous) continue;
    const { error } = await admin
      .from("listings")
      .update({ price: next, clearance_until: until, clearance_original_price: previous, updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("seller_id", user.id);
    if (error) continue;
    count++;
    // People who saved it or have a matching search hear about the drop, as with any price cut.
    const listing = await getListingById(row.id).catch(() => null);
    if (listing) await notifyPriceDropWatchers({ listing, sellerId: user.id, previousPrice: previous, newPrice: next }).catch(() => undefined);
  }

  revalidatePath("/app/my-listings");
  revalidatePath(`/m/${user.id}`);
  return { success: count > 0, message: count > 0 ? "started" : "nothing", count };
}

/** Opens Stripe Checkout for a EUR 0.99 bump. The webhook moves the listing up once paid. */
export async function startBumpCheckoutAction(listingId: string): Promise<Result> {
  if (!UUID.test(listingId)) return { success: false, message: "invalid" };
  if (!isLiveMode) return { success: false, message: "demo" };
  const { user, admin } = await context();
  if (!admin || !stripe) return { success: false, message: "unavailable" };

  const { data: listing } = await admin
    .from("listings")
    .select("id, title, status, bumped_at")
    .eq("id", listingId)
    .eq("seller_id", user.id)
    .maybeSingle();
  if (!listing || listing.status !== "active") return { success: false, message: "not-found" };
  if (!canBump(listing.bumped_at)) return { success: false, message: "too-soon" };

  const { data: purchase, error } = await admin
    .from("promotion_purchases")
    .insert({ listing_id: listingId, seller_id: user.id, type: "bump", amount: BUMP_PRICE_EUR, status: "pending", active: false })
    .select("id")
    .single();
  if (error || !purchase?.id) return { success: false, message: error?.message ?? "unavailable" };

  try {
    const session = await createBumpCheckoutSession({
      listingId,
      sellerId: user.id,
      promotionPurchaseId: purchase.id,
      listingTitle: listing.title,
      amount: BUMP_PRICE_EUR,
      returnPath: "/app/my-listings"
    });
    await admin
      .from("promotion_purchases")
      .update({ status: "checkout_opened", stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() })
      .eq("id", purchase.id);
    return session.url ? { success: true, message: "checkout", url: session.url } : { success: false, message: "unavailable" };
  } catch (cause) {
    return { success: false, message: cause instanceof Error ? cause.message : "unavailable" };
  }
}

/** Where the student lives (optional). Feeds the CO2 ranking and ambassadors per residence. */
export async function saveResidenceAction(residence: string | null): Promise<Result> {
  if (residence !== null && !isResidence(residence)) return { success: false, message: "invalid" };
  if (!isLiveMode) return { success: true, message: "saved" };
  const { user, admin } = await context();
  if (!admin) return { success: false, message: "unavailable" };
  const { error } = await admin.from("users").update({ residence }).eq("id", user.id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/app/impact");
  revalidatePath("/app/profile");
  return { success: true, message: "saved" };
}
