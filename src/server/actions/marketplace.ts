"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  extractPublicStoragePath,
  listingImagesBucket
} from "@/lib/supabase/storage";
import { isLiveMode } from "@/lib/env";
import { createOrderBreakdown } from "@/lib/payments/order-pricing";
import { createBuyerCheckoutSession } from "@/lib/payments/stripe";
import { getCurrentUser } from "@/server/queries/marketplace";
import type {
  ExchangeStatus,
  FulfillmentMethod,
  ListingCondition,
  ListingDistanceFilter,
  ListingOffer,
  ListingStatus,
  OfferStatus,
  ReportTargetType,
  SupportTicketType,
  TransactionPaymentStatus
} from "@/types/domain";

interface ActionResult {
  success: boolean;
  message: string;
}

interface ToggleFavoriteResult extends ActionResult {
  isSaved: boolean;
}

interface OfferActionResult extends ActionResult {
  conversationId?: string;
  offerId?: string;
}

interface PurchaseActionResult extends ActionResult {
  conversationId?: string;
  transactionId?: string;
  checkoutUrl?: string;
}

interface ListingDeletionHistoryFlags {
  hasConversations: boolean;
  hasTransactions: boolean;
  hasPromotionRecords: boolean;
  hasReports: boolean;
  hasAuditLogs: boolean;
}

interface DbOfferRow {
  id: string;
  listing_id: string;
  transaction_id: string;
  conversation_id: string;
  buyer_id: string;
  seller_id: string;
  created_by_user_id: string;
  parent_offer_id: string | null;
  amount: number | string;
  state: OfferStatus;
  expires_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

type NotificationPreferenceKey =
  | "listing_updates"
  | "messages"
  | "saved_searches"
  | "featured_digest"
  | "promotions";

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseConditions(value: FormDataEntryValue | null) {
  if (!value) {
    return [] as ListingCondition[];
  }

  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) as ListingCondition[];
}

function buildSavedSearchName(input: {
  query?: string;
  categorySlug?: string;
  pickupArea?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}) {
  const titleCase = (value: string) =>
    value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  if (input.query?.trim()) {
    return input.query.trim();
  }

  if (input.categorySlug) {
    return titleCase(input.categorySlug);
  }

  if (input.pickupArea) {
    return `${titleCase(input.pickupArea)} meetup zone`;
  }

  if (input.minPrice !== null || input.maxPrice !== null) {
    return `EUR ${input.minPrice ?? 0}-${input.maxPrice ?? "Any"}`;
  }

  return "CampusSwap saved search";
}

function createSavedSearchSignature(input: {
  query?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  conditions?: string[];
  outletOnly?: boolean;
  featuredOnly?: boolean;
  minimumSellerRating?: number | null;
  pickupArea?: string | null;
  distance?: string | null;
}) {
  return JSON.stringify({
    query: input.query?.trim() || null,
    categorySlug: input.categorySlug || null,
    subcategorySlug: input.subcategorySlug || null,
    priceMin: input.priceMin ?? null,
    priceMax: input.priceMax ?? null,
    conditions: [...(input.conditions ?? [])].sort(),
    outletOnly: Boolean(input.outletOnly),
    featuredOnly: Boolean(input.featuredOnly),
    minimumSellerRating: input.minimumSellerRating ?? null,
    pickupArea: input.pickupArea || null,
    distance: input.distance || null
  });
}

function numberValue(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

const openTransactionStates = [
  "pending",
  "reserved",
  "paid",
  "ready-for-pickup",
  "shipped",
  "delivered",
  "completed"
] as const satisfies ExchangeStatus[];

const cancellableTransactionStates = [
  "pending",
  "reserved",
  "paid",
  "ready-for-pickup"
] as const satisfies ExchangeStatus[];

function normalizeExchangeStatus(value: string): ExchangeStatus {
  if (value === "inquiry" || value === "negotiating") {
    return "pending";
  }

  if (value === "reported") {
    return "reported";
  }

  return value as ExchangeStatus;
}

function isHeldTransactionState(state: ExchangeStatus) {
  return [
    "reserved",
    "paid",
    "ready-for-pickup",
    "shipped",
    "delivered"
  ].includes(state);
}

function resolveListingStatusForTransaction(state: ExchangeStatus): ListingStatus {
  if (state === "completed") {
    return "sold";
  }

  return isHeldTransactionState(state) ? "reserved" : "active";
}

function createFulfillmentContext(input: {
  fulfillmentMethod: FulfillmentMethod;
}) {
  if (input.fulfillmentMethod === "shipping") {
    return {
      meetup_spot: "Shipping address to be confirmed in chat",
      meetup_window: "Dispatch timing to be scheduled"
    };
  }

  return {
    meetup_spot: "To be agreed in chat",
    meetup_window: "To be scheduled"
  };
}

function resolveRequestedFulfillment(input: {
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  requestedMethod?: string;
}): FulfillmentMethod | null {
  if (input.requestedMethod === "pickup" && input.pickupAvailable) {
    return "pickup";
  }

  if (input.requestedMethod === "shipping" && input.shippingAvailable) {
    return "shipping";
  }

  if (input.pickupAvailable && !input.shippingAvailable) {
    return "pickup";
  }

  if (!input.pickupAvailable && input.shippingAvailable) {
    return "shipping";
  }

  return null;
}

function isStripeBackedTransaction(input: {
  checkout_status?: TransactionPaymentStatus | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
}) {
  return Boolean(
    input.checkout_status ||
      input.stripe_checkout_session_id ||
      input.stripe_payment_intent_id
  );
}

function hasRecordedStripePayment(input: {
  checkout_status?: TransactionPaymentStatus | null;
  paid_at?: string | null;
}) {
  return input.checkout_status === "paid" || Boolean(input.paid_at);
}

async function syncListingReservationState(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  listingId: string
) {
  const { data: heldTransactions } = await supabase
    .from("transactions")
    .select("id")
    .eq("listing_id", listingId)
    .in("state", ["reserved", "paid", "ready-for-pickup", "shipped", "delivered"])
    .limit(1);

  await supabase
    .from("listings")
    .update({
      status: heldTransactions?.length ? "reserved" : "active",
      updated_at: new Date().toISOString()
    })
    .eq("id", listingId)
    .neq("status", "sold");
}

async function createStripeCheckoutForTransaction(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  input: {
    transactionId: string;
    listingId: string;
    listingTitle: string;
    buyerId: string;
    buyerEmail?: string;
    sellerId: string;
    fulfillmentMethod: FulfillmentMethod;
    itemAmount: number;
    shippingAmount: number;
  }
) {
  const breakdown = createOrderBreakdown({
    itemAmount: input.itemAmount,
    shippingAmount: input.shippingAmount
  });

  try {
    const session = await createBuyerCheckoutSession({
      transactionId: input.transactionId,
      listingId: input.listingId,
      buyerId: input.buyerId,
      buyerEmail: input.buyerEmail,
      sellerId: input.sellerId,
      listingTitle: input.listingTitle,
      fulfillmentMethod: input.fulfillmentMethod,
      itemAmount: breakdown.amount,
      shippingAmount: breakdown.shipping_amount,
      platformFee: breakdown.platform_fee
    });

    const now = new Date().toISOString();

    await supabase
      .from("transactions")
      .update({
        ...breakdown,
        fulfillment_method: input.fulfillmentMethod,
        state: "reserved",
        checkout_status: "checkout_opened",
        stripe_checkout_session_id: session.id,
        reserved_at: now,
        updated_at: now
      })
      .eq("id", input.transactionId);

    await supabase
      .from("listings")
      .update({
        status: "reserved",
        updated_at: now
      })
      .eq("id", input.listingId)
      .neq("status", "sold");

    return {
      success: true as const,
      checkoutUrl: session.url ?? undefined
    };
  } catch (error) {
    const now = new Date().toISOString();

    await supabase
      .from("transactions")
      .update({
        state: "pending",
        checkout_status: "pending",
        updated_at: now
      })
      .eq("id", input.transactionId);

    await syncListingReservationState(supabase, input.listingId);

    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to open Stripe Checkout right now."
    };
  }
}

async function requireMarketplaceContext() {
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured for live marketplace actions.");
  }

  return { user, supabase };
}

async function syncListingSaveCount(listingId: string) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return;
  }

  const [{ count }, { data: listing }] = await Promise.all([
    admin
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("listing_id", listingId),
    admin.from("listings").select("save_count").eq("id", listingId).maybeSingle()
  ]);

  const nextCount = Math.max(count ?? 0, 0);

  if ((listing?.save_count ?? 0) !== nextCount) {
    await admin.from("listings").update({ save_count: nextCount }).eq("id", listingId);
  }
}

async function getNotificationPreferences(
  userId: string,
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>
) {
  const { data } = await admin
    .from("profiles")
    .select("notification_preferences")
    .eq("user_id", userId)
    .maybeSingle();

  return (((data as { notification_preferences?: string[] | null } | null)
    ?.notification_preferences ?? []) as string[]);
}

async function notifyUser(
  userId: string,
  title: string,
  body: string,
  options?: {
    type?: "message" | "promotion" | "review" | "listing" | "safety" | "system";
    preference?: NotificationPreferenceKey;
    dedupeKey?: string;
    href?: string;
  }
) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return;
  }

  if (options?.preference) {
    const preferences = await getNotificationPreferences(userId, admin);

    if (!preferences.includes(options.preference)) {
      return;
    }
  }

  if (options?.dedupeKey) {
    const { error: dedupeError } = await admin.from("notification_events").insert({
      user_id: userId,
      dedupe_key: options.dedupeKey,
      notification_type: options.type ?? "system"
    });

    if (dedupeError?.code === "23505") {
      return;
    }

    if (dedupeError) {
      console.error("Notification dedupe insert failed:", dedupeError.message);
      return;
    }
  }

  await admin.from("notifications").insert({
    user_id: userId,
    type: options?.type ?? "system",
    title,
    body,
    destination_href: options?.href ?? null
  });
}

function mapOffer(row: DbOfferRow): ListingOffer {
  return {
    id: row.id,
    listingId: row.listing_id,
    transactionId: row.transaction_id,
    conversationId: row.conversation_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    createdByUserId: row.created_by_user_id,
    parentOfferId: row.parent_offer_id ?? undefined,
    amount: numberValue(row.amount),
    state: row.state,
    expiresAt: row.expires_at ?? undefined,
    respondedAt: row.responded_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getLatestOfferForConversation(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  conversationId: string
) {
  const { data, error } = await supabase
    .from("listing_offers")
    .select(
      "id, listing_id, transaction_id, conversation_id, buyer_id, seller_id, created_by_user_id, parent_offer_id, amount, state, expires_at, responded_at, created_at, updated_at"
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = (data as DbOfferRow | null) ?? null;

  if (!row) {
    return undefined;
  }

  if (row.state === "open" && row.expires_at && Date.parse(row.expires_at) <= Date.now()) {
    await supabase
      .from("listing_offers")
      .update({
        state: "expired",
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", row.id);

    return {
      ...mapOffer(row),
      state: "expired",
      respondedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } satisfies ListingOffer;
  }

  return mapOffer(row);
}

async function getOfferForParticipant(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  offerId: string,
  currentUserId: string
) {
  const { data, error } = await supabase
    .from("listing_offers")
    .select(
      "id, listing_id, transaction_id, conversation_id, buyer_id, seller_id, created_by_user_id, parent_offer_id, amount, state, expires_at, responded_at, created_at, updated_at"
    )
    .eq("id", offerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = (data as DbOfferRow | null) ?? null;

  if (!row) {
    throw new Error("That offer could not be found.");
  }

  if (row.buyer_id !== currentUserId && row.seller_id !== currentUserId) {
    throw new Error("Only the buyer or seller can manage this offer.");
  }

  const mapped = mapOffer(row);

  if (mapped.state === "open" && mapped.expiresAt && Date.parse(mapped.expiresAt) <= Date.now()) {
    await supabase
      .from("listing_offers")
      .update({
        state: "expired",
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", mapped.id);

    return {
      ...mapped,
      state: "expired",
      respondedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } satisfies ListingOffer;
  }

  return mapped;
}

async function collectListingDeletionHistoryFlags(
  listingId: string,
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>
): Promise<ListingDeletionHistoryFlags> {
  const [
    conversationResult,
    transactionResult,
    promotionResult,
    reportResult,
    auditLogResult
  ] = await Promise.all([
    admin
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listingId),
    admin
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listingId),
    admin
      .from("promotion_purchases")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listingId),
    admin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "listing")
      .eq("target_id", listingId),
    admin
      .from("audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("entity", "listing")
      .eq("entity_id", listingId)
  ]);

  return {
    hasConversations: (conversationResult.count ?? 0) > 0,
    hasTransactions: (transactionResult.count ?? 0) > 0,
    hasPromotionRecords: (promotionResult.count ?? 0) > 0,
    hasReports: (reportResult.count ?? 0) > 0,
    hasAuditLogs: (auditLogResult.count ?? 0) > 0
  };
}

async function hardDeleteListingIfSafe(listingId: string) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return {
      hardDeleted: false,
      historyFlags: {
        hasConversations: true,
        hasTransactions: true,
        hasPromotionRecords: true,
        hasReports: true,
        hasAuditLogs: true
      } satisfies ListingDeletionHistoryFlags
    };
  }

  const historyFlags = await collectListingDeletionHistoryFlags(listingId, admin);

  const requiresHiddenDelete =
    historyFlags.hasConversations ||
    historyFlags.hasTransactions ||
    historyFlags.hasPromotionRecords ||
    historyFlags.hasReports ||
    historyFlags.hasAuditLogs;

  if (requiresHiddenDelete) {
    return {
      hardDeleted: false,
      historyFlags
    };
  }

  const db = admin;

  const { data: imageRows } = await db
    .from("listing_images")
    .select("url")
    .eq("listing_id", listingId);

  const imageUrls = (((imageRows as { url: string }[] | null) ?? []).map((row) => row.url));

  await Promise.all([
    db.from("favorites").delete().eq("listing_id", listingId),
    db.from("view_events").delete().eq("listing_id", listingId),
    db.from("recommendation_events").delete().eq("listing_id", listingId),
    db.from("listing_tags").delete().eq("listing_id", listingId),
    db.from("listing_images").delete().eq("listing_id", listingId)
  ]);

  const { error: listingDeleteError } = await db
    .from("listings")
    .delete()
    .eq("id", listingId);

  if (listingDeleteError) {
    throw new Error(listingDeleteError.message);
  }

  const storagePaths = imageUrls
    .map((url) => extractPublicStoragePath(listingImagesBucket, url))
    .filter((path): path is string => Boolean(path));

  if (storagePaths.length) {
    await db.storage.from(listingImagesBucket).remove(storagePaths);
  }

  return {
    hardDeleted: true,
    historyFlags
  };
}

async function ensureConversationRecord(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  listingId: string,
  buyerId: string,
  sellerId: string
) {
  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      unread_count: 0,
      buyer_unread_count: 0,
      seller_unread_count: 0,
      quick_actions: [
        "Is this available?",
        "Can you reserve it?",
        "Can we meet on campus?",
        "Is the price negotiable?"
      ]
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to open the conversation.");
  }

  return data.id;
}

async function getOpenTransactionForListing(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  listingId: string
) {
  const { data } = await supabase
    .from("transactions")
    .select("id, buyer_id, seller_id, state, conversation_id")
    .eq("listing_id", listingId)
    .in("state", [...openTransactionStates])
    .order("updated_at", { ascending: false });

  return (
    (data as
      | {
          id: string;
          buyer_id: string;
          seller_id: string;
          state: ExchangeStatus;
          conversation_id: string | null;
        }[]
      | null) ?? []
  ).map((transaction) => ({
    ...transaction,
    state: normalizeExchangeStatus(transaction.state)
  }));
}

async function ensureTransactionRecord(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  {
    listingId,
    buyerId,
    sellerId,
    conversationId,
    amount,
    fulfillmentMethod,
    shippingAmount
  }: {
    listingId: string;
    buyerId: string;
    sellerId: string;
    conversationId: string;
    amount: number;
    fulfillmentMethod: FulfillmentMethod;
    shippingAmount: number;
  }
) {
  const { data: existing } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, amount, fulfillment_method, shipping_amount, platform_fee, total_amount, conversation_id, meetup_spot, meetup_window, created_at, updated_at, reserved_at, paid_at, ready_at, shipped_at, delivered_at, cancelled_at, completed_at"
    )
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .in("state", ["pending", "reserved", "paid", "ready-for-pickup", "shipped", "delivered"])
    .order("updated_at", { ascending: false })
    .maybeSingle();

  const breakdown = createOrderBreakdown({
    itemAmount: amount,
    shippingAmount
  });
  const fulfillmentContext = createFulfillmentContext({
    fulfillmentMethod
  });

  if (existing?.id) {
    await supabase
      .from("transactions")
      .update({
        conversation_id: existing.conversation_id ?? conversationId,
        amount,
        fulfillment_method: fulfillmentMethod,
        shipping_amount: shippingAmount,
        platform_fee: breakdown.platform_fee,
        total_amount: breakdown.total_amount,
        ...fulfillmentContext,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id);

    return existing.id;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      state: "pending",
      fulfillment_method: fulfillmentMethod,
      ...breakdown,
      conversation_id: conversationId,
      ...fulfillmentContext
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create the exchange record.");
  }

  return data.id;
}

async function ensureListingOfferContext(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  {
    listingId,
    buyerId,
    sellerId,
    amount,
    fulfillmentMethod,
    shippingAmount
  }: {
    listingId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    fulfillmentMethod: FulfillmentMethod;
    shippingAmount: number;
  }
) {
  const conversationId = await ensureConversationRecord(
    supabase,
    listingId,
    buyerId,
    sellerId
  );
  const transactionId = await ensureTransactionRecord(supabase, {
    listingId,
      buyerId,
      sellerId,
      conversationId,
      amount,
      fulfillmentMethod,
      shippingAmount
    });

  await supabase
    .from("transactions")
    .update({
      state: "pending",
      ...createOrderBreakdown({
        itemAmount: amount,
        shippingAmount
      }),
      fulfillment_method: fulfillmentMethod,
      updated_at: new Date().toISOString()
    })
    .eq("id", transactionId)
    .neq("state", "completed");

  return { conversationId, transactionId };
}

async function insertOfferTimelineMessage(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  {
    conversationId,
    senderId,
    text
  }: {
    conversationId: string;
    senderId: string;
    text: string;
  }
) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    text
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function cancelCompetingTransactions(
  listingId: string,
  preservedTransactionId: string | undefined,
  buyerMessage: string
) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return;
  }

  let query = admin
    .from("transactions")
    .select("id, buyer_id, state")
    .eq("listing_id", listingId)
    .in("state", ["pending", "reserved", "paid", "ready-for-pickup", "shipped", "delivered"]);

  if (preservedTransactionId) {
    query = query.neq("id", preservedTransactionId);
  }

  const { data: competing } = await query;

  const rows =
    (competing as { id: string; buyer_id: string; state: ExchangeStatus }[] | null) ?? [];

  if (!rows.length) {
    return;
  }

  const transactionIds = rows.map((row) => row.id);

  await admin
    .from("transactions")
    .update({
      state: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .in("id", transactionIds);

  await Promise.all(
    rows.map((row) =>
      notifyUser(row.buyer_id, "Purchase request closed", buyerMessage, {
        href: "/app/my-purchases"
      })
    )
  );
}

export async function toggleFavoriteAction(listingId: string): Promise<ToggleFavoriteResult> {
  if (!isLiveMode) {
    return {
      success: false,
      isSaved: false,
      message: "Switch to live mode to persist saved listings."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: favorite, error: favoriteError } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (favoriteError) {
    return {
      success: false,
      isSaved: false,
      message: favoriteError.message
    };
  }

  if (favorite?.listing_id) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

    if (error) {
      return {
        success: false,
        isSaved: true,
        message: error.message
      };
    }

    await syncListingSaveCount(listingId);
    revalidatePath("/app");
    revalidatePath("/app/saved");
    revalidatePath("/app/for-you");
    revalidatePath("/app/search");
    revalidatePath(`/app/listings/${listingId}`);

    return {
      success: true,
      isSaved: false,
      message: "Listing removed from saved items."
    };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    listing_id: listingId
  });

  if (error) {
    return {
      success: false,
      isSaved: false,
      message: error.message
    };
  }

  await syncListingSaveCount(listingId);
  await notifyUser(user.id, "Saved to your shortlist", "CampusSwap will keep this listing close in your saved feed.", {
    type: "listing",
    href: "/app/saved"
  });

  const admin = createAdminSupabaseClient();

  if (admin) {
    const { data: listing } = await admin
      .from("listings")
      .select("seller_id, title")
      .eq("id", listingId)
      .maybeSingle();

    if (listing?.seller_id && listing.seller_id !== user.id) {
      await notifyUser(
        listing.seller_id,
        "Someone saved your listing",
        `${user.profile.fullName} saved ${listing.title}.`,
        {
          type: "listing",
          preference: "listing_updates",
          dedupeKey: `favorite:${listingId}:${user.id}`,
          href: `/app/listings/${listingId}`
        }
      );
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/saved");
  revalidatePath("/app/for-you");
  revalidatePath("/app/search");
  revalidatePath(`/app/listings/${listingId}`);

  return {
    success: true,
    isSaved: true,
    message: "Listing saved."
  };
}

export async function updateListingStatusAction(
  listingId: string,
  nextStatus: ListingStatus
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to persist listing status changes."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, title, status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return {
      success: false,
      message: listingError?.message ?? "That listing could not be found."
    };
  }

  if (listing.seller_id !== user.id) {
    return {
      success: false,
      message: "Only the seller can update this listing."
    };
  }

  if (!["active", "archived"].includes(nextStatus)) {
    return {
      success: false,
      message: "Reserve and sold states now belong to buyer-linked exchange flows."
    };
  }

  const { error } = await supabase
    .from("listings")
    .update({
      status: nextStatus,
      removed_at: null,
      removed_by: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", listingId);

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "listing",
    title: "Listing status updated",
    body: `${listing.title} is now marked as ${nextStatus}.`,
    destination_href: `/app/listings/${listingId}`
  });

  revalidatePath("/app");
  revalidatePath("/app/my-listings");
  revalidatePath("/app/profile");
  revalidatePath(`/app/listings/${listingId}`);

  return {
    success: true,
    message: `Listing marked as ${nextStatus}.`
  };
}

export async function startPurchaseIntentAction(
  listingId: string,
  requestedFulfillmentMethod?: FulfillmentMethod
): Promise<PurchaseActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to create a purchase commitment."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(
      "id, seller_id, title, status, price, pickup_available, shipping_available, shipping_cost"
    )
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return {
      success: false,
      message: listingError?.message ?? "That listing could not be found."
    };
  }

  if (listing.seller_id === user.id) {
    return {
      success: false,
      message: "You cannot buy your own listing."
    };
  }

  if (["sold", "archived", "hidden", "pending-review"].includes(listing.status)) {
    return {
      success: false,
      message: "This listing is not available for purchase right now."
    };
  }

  const fulfillmentMethod = resolveRequestedFulfillment({
    pickupAvailable: listing.pickup_available,
    shippingAvailable: listing.shipping_available,
    requestedMethod: requestedFulfillmentMethod
  });

  if (!fulfillmentMethod) {
    return {
      success: false,
      message:
        "Choose whether you want pickup or shipping before starting this order."
    };
  }

  const shippingAmount =
    fulfillmentMethod === "shipping" ? numberValue(listing.shipping_cost) : 0;

  const openTransactions = await getOpenTransactionForListing(supabase, listingId);
  const reservedForAnotherBuyer = openTransactions.find(
    (transaction) =>
      isHeldTransactionState(transaction.state) && transaction.buyer_id !== user.id
  );
  const alreadyCompleted = openTransactions.find(
    (transaction) => transaction.state === "completed"
  );

  if (reservedForAnotherBuyer) {
    return {
      success: false,
      message: "This item is already reserved for another buyer."
    };
  }

  if (alreadyCompleted) {
    return {
      success: false,
      message: "This item has already been sold."
    };
  }

  try {
    const conversationId = await ensureConversationRecord(
      supabase,
      listingId,
      user.id,
      listing.seller_id
    );
    const transactionId = await ensureTransactionRecord(supabase, {
      listingId,
      buyerId: user.id,
      sellerId: listing.seller_id,
      conversationId,
      amount: Number(listing.price),
      fulfillmentMethod,
      shippingAmount
    });

    await supabase
      .from("transactions")
      .update({
        state: "pending",
        checkout_status: "pending",
        fulfillment_method: fulfillmentMethod,
        ...createOrderBreakdown({
          itemAmount: Number(listing.price),
          shippingAmount
        }),
        updated_at: new Date().toISOString()
      })
      .eq("id", transactionId)
      .neq("state", "completed");

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      text: (() => {
        const breakdown = createOrderBreakdown({
          itemAmount: Number(listing.price),
          shippingAmount
        });

        return fulfillmentMethod === "shipping"
          ? `I want to buy this item with shipping and continue in Stripe Checkout. Total shown now is EUR ${breakdown.total_amount.toFixed(2)}.`
          : `I want to buy this item with pickup and continue in Stripe Checkout. Total shown now is EUR ${breakdown.total_amount.toFixed(2)}.`;
      })()
    });

    await notifyUser(
      listing.seller_id,
      "New purchase request",
      `${user.profile.fullName} wants to buy ${listing.title} with ${fulfillmentMethod}.`,
      {
        type: "listing",
        preference: "listing_updates",
        dedupeKey: `purchase-request:${transactionId}`,
        href: `/app/messages/${conversationId}`
      }
    );

    revalidatePath(`/app/listings/${listingId}`);
    revalidatePath("/app/messages");
    revalidatePath(`/app/messages/${conversationId}`);
    revalidatePath("/app/my-purchases");

    const checkoutResult = await createStripeCheckoutForTransaction(supabase, {
      transactionId,
      listingId,
      listingTitle: listing.title,
      buyerId: user.id,
      buyerEmail: user.email,
      sellerId: listing.seller_id,
      fulfillmentMethod,
      itemAmount: Number(listing.price),
      shippingAmount
    });

    if (checkoutResult.success && checkoutResult.checkoutUrl) {
      revalidatePath(`/app/listings/${listingId}`);
      revalidatePath("/app/my-purchases");

      return {
        success: true,
        message: "Redirecting you to Stripe Checkout.",
        conversationId,
        transactionId,
        checkoutUrl: checkoutResult.checkoutUrl
      };
    }

    return {
      success: true,
      message:
        checkoutResult.message ??
        "Order created, but Stripe Checkout could not be opened yet. Retry payment from this order panel or from My Purchases.",
      transactionId
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to start the purchase flow right now."
    };
  }
}

export async function resumeTransactionCheckoutAction(
  transactionId: string
): Promise<PurchaseActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to continue checkout."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select(
      `id, listing_id, buyer_id, seller_id, state, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, amount, fulfillment_method, shipping_amount, conversation_id, paid_at,
       listing:listings!transactions_listing_id_fkey (id, title, status)`
    )
    .eq("id", transactionId)
    .maybeSingle();

  const row = (transaction as
    | {
        id: string;
        listing_id: string;
        buyer_id: string;
        seller_id: string;
        state: ExchangeStatus;
        checkout_status: TransactionPaymentStatus | null;
        stripe_checkout_session_id: string | null;
        stripe_payment_intent_id: string | null;
        amount: number | string;
        fulfillment_method: FulfillmentMethod | null;
        shipping_amount: number | string;
        conversation_id: string | null;
        paid_at: string | null;
        listing:
          | {
              id: string;
              title: string;
              status: ListingStatus;
            }
          | {
              id: string;
              title: string;
              status: ListingStatus;
            }[]
          | null;
      }
    | null) ?? null;

  if (transactionError || !row) {
    return {
      success: false,
      message: transactionError?.message ?? "That order could not be found."
    };
  }

  if (row.buyer_id !== user.id) {
    return {
      success: false,
      message: "Only the buyer can continue Stripe Checkout for this order."
    };
  }

  const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;

  if (!listing) {
    return {
      success: false,
      message: "That listing could not be found anymore."
    };
  }

  if (hasRecordedStripePayment(row)) {
    return {
      success: false,
      message: "This order is already paid."
    };
  }

  if (row.state === "cancelled" || row.state === "completed") {
    return {
      success: false,
      message: "This order can no longer continue to checkout."
    };
  }

  if (["hidden", "archived", "pending-review"].includes(listing.status)) {
    return {
      success: false,
      message: "This listing is no longer available for checkout."
    };
  }

  if (listing.status === "sold") {
    return {
      success: false,
      message: "This listing has already been sold."
    };
  }

  if (listing.status === "reserved" && row.state !== "reserved") {
    return {
      success: false,
      message: "This listing is currently held for another buyer."
    };
  }

  const fulfillmentMethod = row.fulfillment_method ?? "pickup";
  const itemAmount = numberValue(row.amount);
  const shippingAmount = numberValue(row.shipping_amount);
  const checkoutResult = await createStripeCheckoutForTransaction(supabase, {
    transactionId: row.id,
    listingId: row.listing_id,
    listingTitle: listing.title,
    buyerId: row.buyer_id,
    buyerEmail: user.email,
    sellerId: row.seller_id,
    fulfillmentMethod,
    itemAmount,
    shippingAmount
  });

  if (!checkoutResult.success || !checkoutResult.checkoutUrl) {
    return {
      success: false,
      message:
        checkoutResult.message ??
        "Unable to reopen Stripe Checkout right now."
    };
  }

  revalidatePath(`/app/listings/${row.listing_id}`);
  revalidatePath("/app/my-purchases");

  return {
    success: true,
    message: "Redirecting you to Stripe Checkout.",
    conversationId: row.conversation_id ?? undefined,
    transactionId: row.id,
    checkoutUrl: checkoutResult.checkoutUrl
  };
}

export async function submitOfferAction(
  listingId: string,
  amount: number
): Promise<OfferActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to send offers."
    };
  }

  const offerAmount = Number(amount);

  if (!Number.isFinite(offerAmount) || offerAmount <= 0) {
    return {
      success: false,
      message: "Enter a valid offer amount."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(
      "id, seller_id, title, status, price, pickup_available, shipping_available, shipping_cost"
    )
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return {
      success: false,
      message: listingError?.message ?? "That listing could not be found."
    };
  }

  if (listing.seller_id === user.id) {
    return {
      success: false,
      message: "You cannot make an offer on your own listing."
    };
  }

  if (["sold", "archived", "hidden", "pending-review"].includes(listing.status)) {
    return {
      success: false,
      message: "This listing is not available for offers right now."
    };
  }

  const openTransactions = await getOpenTransactionForListing(supabase, listingId);
  const reservedForAnotherBuyer = openTransactions.find(
    (transaction) =>
      transaction.state === "reserved" && transaction.buyer_id !== user.id
  );

  if (reservedForAnotherBuyer) {
    return {
      success: false,
      message: "This item is already reserved for another buyer."
    };
  }

  try {
    const fulfillmentMethod =
      resolveRequestedFulfillment({
        pickupAvailable: listing.pickup_available,
        shippingAvailable: listing.shipping_available,
        requestedMethod: listing.pickup_available ? "pickup" : "shipping"
      }) ?? "pickup";
    const shippingAmount =
      fulfillmentMethod === "shipping" ? Number(listing.shipping_cost ?? 0) : 0;

    const { conversationId, transactionId } = await ensureListingOfferContext(supabase, {
      listingId,
      buyerId: user.id,
      sellerId: listing.seller_id,
      amount: offerAmount,
      fulfillmentMethod,
      shippingAmount
    });
    const latestOffer = await getLatestOfferForConversation(supabase, conversationId);

    if (latestOffer?.state === "open") {
      return {
        success: false,
        message:
          latestOffer.createdByUserId === user.id
            ? "You already have an open offer in this conversation."
            : "The seller already has a counteroffer waiting for your response."
      };
    }

    if (latestOffer?.state === "accepted") {
      return {
        success: false,
        message: "An offer has already been accepted for this conversation."
      };
    }

    const { data: created, error } = await supabase
      .from("listing_offers")
      .insert({
        listing_id: listingId,
        transaction_id: transactionId,
        conversation_id: conversationId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        created_by_user_id: user.id,
        amount: offerAmount,
        state: "open"
      })
      .select("id")
      .single();

    if (error || !created?.id) {
      return {
        success: false,
        message: error?.message ?? "Unable to send the offer right now."
      };
    }

    await insertOfferTimelineMessage(supabase, {
      conversationId,
      senderId: user.id,
      text: `Offer sent: EUR ${offerAmount.toFixed(2)}`
    });

    revalidatePath(`/app/listings/${listingId}`);
    revalidatePath("/app/messages");
    revalidatePath(`/app/messages/${conversationId}`);
    revalidatePath("/app/my-purchases");

    return {
      success: true,
      message: "Offer sent.",
      conversationId,
      offerId: created.id
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to send the offer right now."
    };
  }
}

export async function counterOfferAction(
  offerId: string,
  amount: number
): Promise<OfferActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to send counteroffers."
    };
  }

  const counterAmount = Number(amount);

  if (!Number.isFinite(counterAmount) || counterAmount <= 0) {
    return {
      success: false,
      message: "Enter a valid counteroffer amount."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();

  try {
    const offer = await getOfferForParticipant(supabase, offerId, user.id);

    if (offer.sellerId !== user.id) {
      return {
        success: false,
        message: "Only the seller can send a counteroffer."
      };
    }

    if (offer.state !== "open") {
      return {
        success: false,
        message: "Only open offers can be countered."
      };
    }

    if (offer.createdByUserId === user.id) {
      return {
        success: false,
        message: "Wait for the buyer to respond before sending another counteroffer."
      };
    }

    const now = new Date().toISOString();

    await supabase
      .from("listing_offers")
      .update({
        state: "countered",
        responded_at: now,
        updated_at: now
      })
      .eq("id", offer.id);

    const { data: created, error } = await supabase
      .from("listing_offers")
      .insert({
        listing_id: offer.listingId,
        transaction_id: offer.transactionId,
        conversation_id: offer.conversationId,
        buyer_id: offer.buyerId,
        seller_id: offer.sellerId,
        created_by_user_id: user.id,
        parent_offer_id: offer.id,
        amount: counterAmount,
        state: "open"
      })
      .select("id")
      .single();

    if (error || !created?.id) {
      return {
        success: false,
        message: error?.message ?? "Unable to send the counteroffer right now."
      };
    }

    await insertOfferTimelineMessage(supabase, {
      conversationId: offer.conversationId,
      senderId: user.id,
      text: `Counteroffer sent: EUR ${counterAmount.toFixed(2)}`
    });

    revalidatePath(`/app/listings/${offer.listingId}`);
    revalidatePath("/app/messages");
    revalidatePath(`/app/messages/${offer.conversationId}`);
    revalidatePath("/app/my-purchases");
    revalidatePath("/app/my-listings");

    return {
      success: true,
      message: "Counteroffer sent.",
      conversationId: offer.conversationId,
      offerId: created.id
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to send the counteroffer right now."
    };
  }
}

export async function acceptOfferAction(offerId: string): Promise<OfferActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to accept offers."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();

  try {
    const offer = await getOfferForParticipant(supabase, offerId, user.id);

    if (offer.state !== "open") {
      return {
        success: false,
        message: "Only open offers can be accepted."
      };
    }

    if (offer.createdByUserId === user.id) {
      return {
        success: false,
        message: "You cannot accept your own offer."
      };
    }

    const now = new Date().toISOString();

    await supabase
      .from("listing_offers")
      .update({
        state: "accepted",
        responded_at: now,
        updated_at: now
      })
      .eq("id", offer.id);

    const { data: transactionPricing } = await supabase
      .from("transactions")
      .select("shipping_amount")
      .eq("id", offer.transactionId)
      .maybeSingle();

    const updatedBreakdown = createOrderBreakdown({
      itemAmount: offer.amount,
      shippingAmount: numberValue(transactionPricing?.shipping_amount)
    });

    await supabase
      .from("transactions")
      .update({
        ...updatedBreakdown,
        state: "pending",
        updated_at: now
      })
      .eq("id", offer.transactionId)
      .neq("state", "completed");

    await insertOfferTimelineMessage(supabase, {
      conversationId: offer.conversationId,
      senderId: user.id,
      text: `Offer accepted at EUR ${offer.amount.toFixed(2)}`
    });

    revalidatePath(`/app/listings/${offer.listingId}`);
    revalidatePath("/app/messages");
    revalidatePath(`/app/messages/${offer.conversationId}`);
    revalidatePath("/app/my-purchases");
    revalidatePath("/app/my-listings");

    return {
      success: true,
      message: "Offer accepted. The agreed price is now reflected in the exchange.",
      conversationId: offer.conversationId,
      offerId: offer.id
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to accept this offer."
    };
  }
}

export async function rejectOfferAction(offerId: string): Promise<OfferActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to reject offers."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();

  try {
    const offer = await getOfferForParticipant(supabase, offerId, user.id);

    if (offer.state !== "open") {
      return {
        success: false,
        message: "Only open offers can be rejected."
      };
    }

    if (offer.createdByUserId === user.id) {
      return {
        success: false,
        message: "Use withdraw if you want to remove your own open offer."
      };
    }

    const now = new Date().toISOString();

    await supabase
      .from("listing_offers")
      .update({
        state: "rejected",
        responded_at: now,
        updated_at: now
      })
      .eq("id", offer.id);

    await insertOfferTimelineMessage(supabase, {
      conversationId: offer.conversationId,
      senderId: user.id,
      text: "Offer declined."
    });

    revalidatePath(`/app/listings/${offer.listingId}`);
    revalidatePath("/app/messages");
    revalidatePath(`/app/messages/${offer.conversationId}`);
    revalidatePath("/app/my-purchases");
    revalidatePath("/app/my-listings");

    return {
      success: true,
      message: "Offer declined.",
      conversationId: offer.conversationId,
      offerId: offer.id
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to reject this offer."
    };
  }
}

export async function withdrawOfferAction(offerId: string): Promise<OfferActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to withdraw offers."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();

  try {
    const offer = await getOfferForParticipant(supabase, offerId, user.id);

    if (offer.state !== "open") {
      return {
        success: false,
        message: "Only open offers can be withdrawn."
      };
    }

    if (offer.createdByUserId !== user.id) {
      return {
        success: false,
        message: "Only the person who sent the offer can withdraw it."
      };
    }

    const now = new Date().toISOString();

    await supabase
      .from("listing_offers")
      .update({
        state: "withdrawn",
        responded_at: now,
        updated_at: now
      })
      .eq("id", offer.id);

    await insertOfferTimelineMessage(supabase, {
      conversationId: offer.conversationId,
      senderId: user.id,
      text: "Offer withdrawn."
    });

    revalidatePath(`/app/listings/${offer.listingId}`);
    revalidatePath("/app/messages");
    revalidatePath(`/app/messages/${offer.conversationId}`);
    revalidatePath("/app/my-purchases");
    revalidatePath("/app/my-listings");

    return {
      success: true,
      message: "Offer withdrawn.",
      conversationId: offer.conversationId,
      offerId: offer.id
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to withdraw this offer."
    };
  }
}

export async function reserveConversationBuyerAction(
  conversationId: string
): Promise<ActionResult & { transactionId?: string }> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to reserve an item."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, listing_id, buyer_id, seller_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError || !conversation) {
    return {
      success: false,
      message: conversationError?.message ?? "That conversation could not be found."
    };
  }

  if (conversation.seller_id !== user.id) {
    return {
      success: false,
      message: "Only the seller can reserve this listing for a buyer."
    };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, status, price, pickup_available, shipping_available, shipping_cost"
    )
    .eq("id", conversation.listing_id)
    .single();

  if (!listing || ["sold", "hidden", "archived"].includes(listing.status)) {
    return {
      success: false,
      message: "This listing can no longer be reserved."
    };
  }

  const openTransactions = await getOpenTransactionForListing(supabase, conversation.listing_id);
  const competingReservedTransaction = openTransactions.find(
    (transaction) =>
      transaction.state === "reserved" && transaction.buyer_id !== conversation.buyer_id
  );

  if (competingReservedTransaction) {
    return {
      success: false,
      message: "This listing is already reserved for another buyer."
    };
  }

  try {
    const fulfillmentMethod =
      resolveRequestedFulfillment({
        pickupAvailable: listing.pickup_available,
        shippingAvailable: listing.shipping_available,
        requestedMethod: listing.pickup_available ? "pickup" : "shipping"
      }) ?? "pickup";
    const shippingAmount =
      fulfillmentMethod === "shipping" ? Number(listing.shipping_cost ?? 0) : 0;

    const transactionId = await ensureTransactionRecord(supabase, {
      listingId: conversation.listing_id,
      buyerId: conversation.buyer_id,
      sellerId: conversation.seller_id,
      conversationId: conversation.id,
      amount: Number(listing.price),
      fulfillmentMethod,
      shippingAmount
    });

    await supabase
      .from("transactions")
      .update({
        state: "reserved",
        reserved_at: new Date().toISOString(),
        cancelled_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", transactionId);

      await supabase
        .from("listings")
        .update({
          status: "reserved",
          updated_at: new Date().toISOString()
        })
        .eq("id", conversation.listing_id);

      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        text: "I reserved this item for you while we arrange the meetup."
      });

    await notifyUser(
      conversation.buyer_id,
      "Item reserved for you",
      `${listing.title} is now reserved while you arrange the meetup.`,
      {
        type: "listing",
        preference: "listing_updates",
        href: `/app/messages/${conversation.id}`
      }
    );

    revalidatePath(`/app/listings/${conversation.listing_id}`);
    revalidatePath("/app/messages");
    revalidatePath(`/app/messages/${conversation.id}`);
    revalidatePath("/app/my-purchases");
    revalidatePath("/app/my-listings");

    return {
      success: true,
      message: "Listing reserved for this buyer.",
      transactionId
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to reserve this item."
    };
  }
}

export async function releaseReservationAction(
  transactionId: string
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to release a reservation."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, conversation_id, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, paid_at"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !transaction) {
    return {
      success: false,
      message: error?.message ?? "That reservation could not be found."
    };
  }

  if (transaction.seller_id !== user.id) {
    return {
      success: false,
      message: "Only the seller can release this reservation."
    };
  }

  await supabase
    .from("transactions")
    .update({
      state: "pending",
      checkout_status:
        isStripeBackedTransaction(transaction) && !hasRecordedStripePayment(transaction)
          ? "cancelled"
          : transaction.checkout_status,
      reserved_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", transaction.id);

  await syncListingReservationState(supabase, transaction.listing_id);

  if (transaction.conversation_id) {
    await supabase.from("messages").insert({
      conversation_id: transaction.conversation_id,
      sender_id: user.id,
      text: "I released the reservation and reopened the listing."
    });
  }

  await notifyUser(
    transaction.buyer_id,
    "Reservation released",
    "The seller reopened the listing for new buyers.",
    {
      type: "listing",
      preference: "listing_updates",
      href: transaction.conversation_id
        ? `/app/messages/${transaction.conversation_id}`
        : `/app/my-purchases`
    }
  );

  revalidatePath(`/app/listings/${transaction.listing_id}`);
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath("/app/my-listings");

  return {
    success: true,
    message: "Reservation released."
  };
}

export async function markTransactionPaidAction(
  transactionId: string
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to update order payment."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, conversation_id, fulfillment_method, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, paid_at"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !transaction) {
    return {
      success: false,
      message: error?.message ?? "That order could not be found."
    };
  }

  if (transaction.seller_id !== user.id) {
    return {
      success: false,
      message: "Only the seller can record payment for this order."
    };
  }

  const normalizedState = normalizeExchangeStatus(transaction.state);

  if (isStripeBackedTransaction(transaction) && !hasRecordedStripePayment(transaction)) {
    return {
      success: false,
      message:
        "This order uses Stripe Checkout. Payment status will update automatically after the buyer completes checkout."
    };
  }

  if (!["reserved", "pending"].includes(normalizedState)) {
    return {
      success: false,
      message: "Only pending or reserved orders can move into paid status."
    };
  }

  const now = new Date().toISOString();

  await supabase
    .from("transactions")
    .update({
      state: "paid",
      paid_at: now,
      updated_at: now
    })
    .eq("id", transaction.id);

  await supabase
    .from("listings")
    .update({
      status: "reserved",
      updated_at: now
    })
    .eq("id", transaction.listing_id);

  if (transaction.conversation_id) {
    await supabase.from("messages").insert({
      conversation_id: transaction.conversation_id,
      sender_id: user.id,
      text:
        transaction.fulfillment_method === "shipping"
          ? "I marked this order as paid. Next step is shipment."
          : "I marked this order as paid. Next step is pickup prep."
    });
  }

  await notifyUser(
    transaction.buyer_id,
    "Payment recorded",
    transaction.fulfillment_method === "shipping"
      ? "The seller marked this order as paid and can prepare shipment now."
      : "The seller marked this order as paid and can prepare pickup now.",
    {
      type: "listing",
      preference: "listing_updates",
      dedupeKey: `order-paid:${transaction.id}`,
      href: transaction.conversation_id
        ? `/app/messages/${transaction.conversation_id}`
        : `/app/my-purchases`
    }
  );

  revalidatePath(`/app/listings/${transaction.listing_id}`);
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath("/app/my-listings");

  return {
    success: true,
    message:
      transaction.fulfillment_method === "shipping"
        ? "Order marked as paid. Shipment can now be prepared."
        : "Order marked as paid. Pickup can now be arranged."
  };
}

export async function markTransactionReadyForPickupAction(
  transactionId: string
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to update pickup readiness."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, conversation_id, fulfillment_method, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, paid_at"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !transaction) {
    return {
      success: false,
      message: error?.message ?? "That order could not be found."
    };
  }

  if (transaction.seller_id !== user.id) {
    return {
      success: false,
      message: "Only the seller can mark an order ready for pickup."
    };
  }

  if ((transaction.fulfillment_method ?? "pickup") !== "pickup") {
    return {
      success: false,
      message: "This order is using shipping, not local pickup."
    };
  }

  const normalizedState = normalizeExchangeStatus(transaction.state);

  if (isStripeBackedTransaction(transaction) && !hasRecordedStripePayment(transaction)) {
    return {
      success: false,
      message: "Wait for Stripe payment confirmation before preparing this pickup order."
    };
  }

  if (!["paid", "reserved"].includes(normalizedState)) {
    return {
      success: false,
      message: "Only reserved or paid pickup orders can be marked ready."
    };
  }

  const now = new Date().toISOString();

  await supabase
    .from("transactions")
    .update({
      state: "ready-for-pickup",
      ready_at: now,
      updated_at: now
    })
    .eq("id", transaction.id);

  await supabase
    .from("listings")
    .update({
      status: "reserved",
      updated_at: now
    })
    .eq("id", transaction.listing_id);

  if (transaction.conversation_id) {
    await supabase.from("messages").insert({
      conversation_id: transaction.conversation_id,
      sender_id: user.id,
      text: "Your order is ready for pickup."
    });
  }

  await notifyUser(
    transaction.buyer_id,
    "Ready for pickup",
    "The seller marked your order as ready for pickup.",
    {
      type: "listing",
      preference: "listing_updates",
      dedupeKey: `ready-for-pickup:${transaction.id}`,
      href: transaction.conversation_id
        ? `/app/messages/${transaction.conversation_id}`
        : `/app/my-purchases`
    }
  );

  revalidatePath(`/app/listings/${transaction.listing_id}`);
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath("/app/my-listings");

  return {
    success: true,
    message: "Order marked as ready for pickup."
  };
}

export async function markTransactionShippedAction(
  transactionId: string
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to update shipment status."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, conversation_id, fulfillment_method, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, paid_at"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !transaction) {
    return {
      success: false,
      message: error?.message ?? "That order could not be found."
    };
  }

  if (transaction.seller_id !== user.id) {
    return {
      success: false,
      message: "Only the seller can mark an order as shipped."
    };
  }

  if (transaction.fulfillment_method !== "shipping") {
    return {
      success: false,
      message: "This order is not using shipping."
    };
  }

  const normalizedState = normalizeExchangeStatus(transaction.state);

  if (isStripeBackedTransaction(transaction) && !hasRecordedStripePayment(transaction)) {
    return {
      success: false,
      message: "Wait for Stripe payment confirmation before shipping this order."
    };
  }

  if (!["paid", "reserved"].includes(normalizedState)) {
    return {
      success: false,
      message: "Only reserved or paid shipping orders can be marked shipped."
    };
  }

  const now = new Date().toISOString();

  await supabase
    .from("transactions")
    .update({
      state: "shipped",
      shipped_at: now,
      updated_at: now
    })
    .eq("id", transaction.id);

  await supabase
    .from("listings")
    .update({
      status: "reserved",
      updated_at: now
    })
    .eq("id", transaction.listing_id);

  if (transaction.conversation_id) {
    await supabase.from("messages").insert({
      conversation_id: transaction.conversation_id,
      sender_id: user.id,
      text: "I marked this order as shipped."
    });
  }

  await notifyUser(
    transaction.buyer_id,
    "Order shipped",
    "The seller marked your order as shipped.",
    {
      type: "listing",
      preference: "listing_updates",
      dedupeKey: `order-shipped:${transaction.id}`,
      href: transaction.conversation_id
        ? `/app/messages/${transaction.conversation_id}`
        : `/app/my-purchases`
    }
  );

  revalidatePath(`/app/listings/${transaction.listing_id}`);
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath("/app/my-listings");

  return {
    success: true,
    message: "Order marked as shipped."
  };
}

export async function markTransactionDeliveredAction(
  transactionId: string
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to update delivery."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, conversation_id, fulfillment_method"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !transaction) {
    return {
      success: false,
      message: error?.message ?? "That order could not be found."
    };
  }

  if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
    return {
      success: false,
      message: "Only the buyer or seller can confirm delivery."
    };
  }

  if (transaction.fulfillment_method !== "shipping") {
    return {
      success: false,
      message: "Only shipping orders can move into delivered status."
    };
  }

  const normalizedState = normalizeExchangeStatus(transaction.state);

  if (normalizedState !== "shipped") {
    return {
      success: false,
      message: "Only shipped orders can move into delivered status."
    };
  }

  const now = new Date().toISOString();

  await supabase
    .from("transactions")
    .update({
      state: "delivered",
      delivered_at: now,
      updated_at: now
    })
    .eq("id", transaction.id);

  if (transaction.conversation_id) {
    await supabase.from("messages").insert({
      conversation_id: transaction.conversation_id,
      sender_id: user.id,
      text: "Delivery confirmed. The final step is completing the order."
    });
  }

  const counterpartId =
    transaction.buyer_id === user.id ? transaction.seller_id : transaction.buyer_id;

  await notifyUser(
    counterpartId,
    "Order delivered",
    "The order was marked as delivered. You can now complete the exchange when everything looks good.",
    {
      type: "listing",
      preference: "listing_updates",
      dedupeKey: `order-delivered:${transaction.id}`,
      href: transaction.conversation_id
        ? `/app/messages/${transaction.conversation_id}`
        : `/app/my-purchases`
    }
  );

  revalidatePath(`/app/listings/${transaction.listing_id}`);
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath("/app/my-listings");

  return {
    success: true,
    message: "Order marked as delivered."
  };
}

export async function cancelTransactionAction(
  transactionId: string
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to cancel a purchase request."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, conversation_id, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, paid_at"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !transaction) {
    return {
      success: false,
      message: error?.message ?? "That exchange could not be found."
    };
  }

  const isParticipant =
    transaction.buyer_id === user.id || transaction.seller_id === user.id;

  if (!isParticipant) {
    return {
      success: false,
      message: "Only the buyer or seller can cancel this exchange."
    };
  }

  if (transaction.state === "completed") {
    return {
      success: false,
      message: "Completed exchanges cannot be cancelled."
    };
  }

  const normalizedState = normalizeExchangeStatus(transaction.state);

  if (hasRecordedStripePayment(transaction)) {
    return {
      success: false,
      message:
        "Paid Stripe orders cannot be cancelled from this flow yet. Use CampusSwap support if a refund or dispute is needed."
    };
  }

  if (
    !cancellableTransactionStates.includes(
      normalizedState as (typeof cancellableTransactionStates)[number]
    )
  ) {
    return {
      success: false,
      message: "This order can no longer be cancelled from the buyer/seller flow."
    };
  }

  await supabase
    .from("transactions")
    .update({
      state: "cancelled",
      checkout_status: isStripeBackedTransaction(transaction) ? "cancelled" : null,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", transaction.id);

  if (isHeldTransactionState(normalizedState)) {
    await syncListingReservationState(supabase, transaction.listing_id);
  }

  if (transaction.conversation_id) {
    await supabase.from("messages").insert({
      conversation_id: transaction.conversation_id,
      sender_id: user.id,
      text: "I cancelled this exchange request."
    });
  }

  const counterpartId =
    transaction.buyer_id === user.id ? transaction.seller_id : transaction.buyer_id;

  await notifyUser(
    counterpartId,
    "Exchange cancelled",
    "The purchase request was cancelled and the listing was updated.",
    {
      type: "listing",
      preference: "listing_updates",
      href: transaction.conversation_id
        ? `/app/messages/${transaction.conversation_id}`
        : `/app/my-purchases`
    }
  );

  revalidatePath(`/app/listings/${transaction.listing_id}`);
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath("/app/my-listings");

  return {
    success: true,
    message: "Exchange cancelled."
  };
}

export async function completeTransactionAction(
  transactionId: string
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to complete a sale."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, conversation_id, fulfillment_method, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, paid_at"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !transaction) {
    return {
      success: false,
      message: error?.message ?? "That exchange could not be found."
    };
  }

  if (transaction.seller_id !== user.id && transaction.buyer_id !== user.id) {
    return {
      success: false,
      message: "Only the buyer or seller can complete this order."
    };
  }

  const normalizedState = normalizeExchangeStatus(transaction.state);

  if (isStripeBackedTransaction(transaction) && !hasRecordedStripePayment(transaction)) {
    return {
      success: false,
      message:
        "This Stripe order is not paid yet. Complete payment before marking the order as finished."
    };
  }

  if (
    !["ready-for-pickup", "delivered", "paid", "reserved", "pending"].includes(
      normalizedState
    )
  ) {
    return {
      success: false,
      message: "This order is not ready to be completed yet."
    };
  }

  await supabase
    .from("transactions")
    .update({
      state: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", transaction.id);

  await supabase
    .from("listings")
    .update({
      status: "sold",
      updated_at: new Date().toISOString()
    })
    .eq("id", transaction.listing_id);

  if (transaction.conversation_id) {
    await supabase.from("messages").insert({
      conversation_id: transaction.conversation_id,
      sender_id: user.id,
      text:
        transaction.fulfillment_method === "shipping"
          ? "I marked this order as completed. You can now leave a review."
          : "I marked this pickup order as completed. You can now leave a review."
    });
  }

  await cancelCompetingTransactions(
    transaction.listing_id,
    transaction.id,
    "The listing was sold to another buyer."
  );

  await Promise.all([
    notifyUser(
      transaction.buyer_id,
      "Review now available",
      "Your exchange is complete. You can now leave a review for the seller.",
      {
        type: "review",
        dedupeKey: `review-eligible:${transaction.id}:${transaction.buyer_id}`,
        href: "/app/my-purchases"
      }
    ),
    notifyUser(
      transaction.seller_id,
      "Review now available",
      "Your exchange is complete. You can now leave a review for the buyer.",
      {
        type: "review",
        dedupeKey: `review-eligible:${transaction.id}:${transaction.seller_id}`,
        href: "/app/my-purchases"
      }
    )
  ]);

  revalidatePath(`/app/listings/${transaction.listing_id}`);
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath("/app/my-listings");
  revalidatePath("/app/reviews");

  return {
    success: true,
    message: "Order completed, listing marked as sold, and reviews are now unlocked."
  };
}

export async function removeListingAction(listingId: string): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to remove listings."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, title, status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return {
      success: false,
      message: listingError?.message ?? "That listing could not be found."
    };
  }

  const canRemove = listing.seller_id === user.id || user.role === "admin";

  if (!canRemove) {
    return {
      success: false,
      message: "Only the seller or an admin can remove this listing."
    };
  }

  const deletionResult = await hardDeleteListingIfSafe(listingId);

  if (!deletionResult.hardDeleted) {
    await supabase
      .from("listings")
      .update({
        status: "hidden",
        removed_at: new Date().toISOString(),
        removed_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", listingId);

    await cancelCompetingTransactions(
      listingId,
      undefined,
      "The seller removed this listing before the exchange was completed."
    );

    await notifyUser(
      listing.seller_id,
      "Listing removed from your marketplace surfaces",
      `${listing.title} is hidden from your profile and all buyer feeds, while payment, chat, and transaction history stay intact.`,
      {
        href: "/app/my-listings"
      }
    );
  } else {
    await notifyUser(
      listing.seller_id,
      "Listing deleted",
      `${listing.title} was permanently deleted because it had no linked payment, chat, or transaction history to preserve.`,
      {
        href: "/app/my-listings"
      }
    );
  }

  revalidatePath("/app");
  revalidatePath("/");
  revalidatePath("/featured");
  revalidatePath("/outlet");
  revalidatePath("/app/search");
  revalidatePath("/app/for-you");
  revalidatePath("/app/saved");
  revalidatePath("/app/my-listings");
  revalidatePath("/app/profile");
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath(`/app/listings/${listingId}`);

  return {
    success: true,
    message: deletionResult.hardDeleted
      ? "Listing deleted and removed from your marketplace surfaces."
      : "Listing removed from your marketplace surfaces while historical activity stays preserved."
  };
}

export async function recordSearchEventAction(query: string, categorySlug?: string) {
  const cleanQuery = query.trim();

  if (!isLiveMode || cleanQuery.length < 2) {
    return;
  }

  const { user, supabase } = await requireMarketplaceContext();

  await supabase.from("search_events").insert({
    user_id: user.id,
    query: cleanQuery,
    category_slug: categorySlug ?? null
  });
}

export async function saveSearchAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to save searches."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const query = String(formData.get("query") ?? "").trim() || null;
  const categorySlug = String(formData.get("categorySlug") ?? "").trim() || null;
  const subcategorySlug = String(formData.get("subcategorySlug") ?? "").trim() || null;
  const priceMin = parseOptionalNumber(formData.get("priceMin"));
  const priceMax = parseOptionalNumber(formData.get("priceMax"));
  const conditions = parseConditions(formData.get("conditions"));
  const outletOnly = formData.get("outletOnly") === "1";
  const featuredOnly = formData.get("featuredOnly") === "1";
  const minimumSellerRating = parseOptionalNumber(formData.get("minimumSellerRating"));
  const pickupArea = String(formData.get("pickupArea") ?? "").trim() || null;
  const distance =
    (String(formData.get("distance") ?? "").trim() as ListingDistanceFilter | "") || null;

  const hasMeaningfulFilter =
    Boolean(query) ||
    Boolean(categorySlug) ||
    Boolean(subcategorySlug) ||
    priceMin !== null ||
    priceMax !== null ||
    conditions.length > 0 ||
    outletOnly ||
    featuredOnly ||
    minimumSellerRating !== null ||
    Boolean(pickupArea);

  if (!hasMeaningfulFilter) {
    return {
      success: false,
      message: "Add at least one search term or filter before saving this search."
    };
  }

  const signature = createSavedSearchSignature({
    query,
    categorySlug,
    subcategorySlug,
    priceMin,
    priceMax,
    conditions,
    outletOnly,
    featuredOnly,
    minimumSellerRating,
    pickupArea,
    distance
  });

  const { data: existingRows } = await supabase
    .from("saved_searches")
    .select(
      "id, query, category_slug, subcategory_slug, price_min, price_max, conditions, outlet_only, featured_only, minimum_seller_rating, pickup_area, distance_bucket"
    )
    .eq("user_id", user.id);

  const existing = (((existingRows as
    | {
        id: string;
        query: string | null;
        category_slug: string | null;
        subcategory_slug: string | null;
        price_min: number | string | null;
        price_max: number | string | null;
        conditions: string[] | null;
        outlet_only: boolean;
        featured_only: boolean;
        minimum_seller_rating: number | string | null;
        pickup_area: string | null;
        distance_bucket: string | null;
      }[]
    | null) ?? []).find(
    (row) =>
      createSavedSearchSignature({
        query: row.query,
        categorySlug: row.category_slug,
        subcategorySlug: row.subcategory_slug,
        priceMin: row.price_min === null ? null : Number(row.price_min),
        priceMax: row.price_max === null ? null : Number(row.price_max),
        conditions: row.conditions ?? [],
        outletOnly: row.outlet_only,
        featuredOnly: row.featured_only,
        minimumSellerRating:
          row.minimum_seller_rating === null ? null : Number(row.minimum_seller_rating),
        pickupArea: row.pickup_area,
        distance: row.distance_bucket
      }) === signature
  ));

  if (existing?.id) {
    return {
      success: true,
      message: "This search is already saved."
    };
  }

  const name = buildSavedSearchName({
    query: query ?? undefined,
    categorySlug: categorySlug ?? undefined,
    pickupArea: pickupArea ?? undefined,
    minPrice: priceMin,
    maxPrice: priceMax
  });

  const { error } = await supabase.from("saved_searches").insert({
    user_id: user.id,
    name,
    query,
    category_slug: categorySlug,
    subcategory_slug: subcategorySlug,
    price_min: priceMin,
    price_max: priceMax,
    conditions,
    outlet_only: outletOnly,
    featured_only: featuredOnly,
    minimum_seller_rating: minimumSellerRating,
    pickup_area: pickupArea,
    distance_bucket: distance
  });

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  revalidatePath("/app/search");
  revalidatePath("/app/saved");

  return {
    success: true,
    message: "Search saved. CampusSwap will watch for matching listings."
  };
}

export async function deleteSavedSearchAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to manage saved searches."
    };
  }

  const savedSearchId = String(formData.get("savedSearchId") ?? "").trim();

  if (!savedSearchId) {
    return {
      success: false,
      message: "That saved search could not be found."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", savedSearchId)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  revalidatePath("/app/search");
  revalidatePath("/app/saved");

  return {
    success: true,
    message: "Saved search deleted."
  };
}

async function createMarketplaceReport(input: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
}) {
  const { error } = await input.supabase.from("reports").insert({
    reporter_id: input.reporterId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason
  });

  if (error) {
    return {
      success: false,
      message: error.message
    } satisfies ActionResult;
  }

  revalidatePath("/admin/reports");
  revalidatePath("/app/support");

  return {
    success: true,
    message:
      input.targetType === "user"
        ? "User report submitted. CampusSwap moderation can review it now."
        : "Report submitted. CampusSwap moderation can review it now."
  } satisfies ActionResult;
}

export async function submitSupportEntryAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const type = String(formData.get("type") ?? "").trim() as SupportTicketType;
  const details = String(formData.get("details") ?? formData.get("reason") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const validTypes = new Set<SupportTicketType>([
    "report-user",
    "report-listing",
    "purchase-dispute",
    "payment-help",
    "shipping-help"
  ]);

  if (!validTypes.has(type)) {
    return {
      success: false,
      message: "Choose a support category before sending this request."
    };
  }

  if (!details || details.length < 12) {
    return {
      success: false,
      message: "Share enough detail so CampusSwap can review the issue properly."
    };
  }

  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to submit support requests."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();

  if (type === "report-listing") {
    if (!listingId) {
      return {
        success: false,
        message: "Open support from a listing so CampusSwap knows which listing to review."
      };
    }

    const result = await createMarketplaceReport({
      reporterId: user.id,
      targetType: "listing",
      targetId: listingId,
      reason: details,
      supabase
    });

    revalidatePath(`/app/listings/${listingId}`);
    return result;
  }

  if (type === "report-user") {
    if (!targetUserId) {
      return {
        success: false,
        message: "Open support from a seller profile so CampusSwap knows who you are reporting."
      };
    }

    const result = await createMarketplaceReport({
      reporterId: user.id,
      targetType: "user",
      targetId: targetUserId,
      reason: details,
      supabase
    });

    revalidatePath(`/app/profile?userId=${targetUserId}`);
    return result;
  }

  if (subject.length < 4) {
    return {
      success: false,
      message: "Add a short subject so the support queue is easier to review."
    };
  }

  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    type,
    status: "open",
    subject,
    details,
    listing_id: listingId || null,
    conversation_id: conversationId || null,
    transaction_id: transactionId || null,
    target_user_id: targetUserId || null
  });

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  revalidatePath("/app/support");
  revalidatePath("/admin/reports");

  if (listingId) {
    revalidatePath(`/app/listings/${listingId}`);
  }

  if (transactionId) {
    revalidatePath("/app/my-purchases");
  }

  if (conversationId) {
    revalidatePath(`/app/messages/${conversationId}`);
  }

  return {
    success: true,
    message: "Support request submitted. CampusSwap can review it from the support queue now."
  };
}

export async function submitListingReportAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const proxy = new FormData();
  proxy.set("type", "report-listing");
  proxy.set("listingId", String(formData.get("listingId") ?? "").trim());
  proxy.set("details", String(formData.get("reason") ?? "").trim());
  return submitSupportEntryAction(_, proxy);
}

export async function submitTransactionReviewAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const reviewText = String(formData.get("text") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);

  if (!transactionId || !targetUserId || rating < 1 || rating > 5) {
    return {
      success: false,
      message: "Choose a rating before submitting."
    };
  }

  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to publish transaction reviews."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select("id, buyer_id, seller_id, state")
    .eq("id", transactionId)
    .maybeSingle();

  if (transactionError || !transaction) {
    return {
      success: false,
      message: transactionError?.message ?? "That exchange could not be found."
    };
  }

  const isParticipant =
    transaction.buyer_id === user.id || transaction.seller_id === user.id;
  const counterpartId =
    transaction.buyer_id === user.id ? transaction.seller_id : transaction.buyer_id;

  if (!isParticipant || transaction.state !== "completed") {
    return {
      success: false,
      message: "Reviews only unlock after a completed exchange."
    };
  }

  if (targetUserId !== counterpartId) {
    return {
      success: false,
      message: "Reviews can only be left for the other participant in this exchange."
    };
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("transaction_id", transactionId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (existingReview?.id) {
    return {
      success: false,
      message: "You have already reviewed this exchange."
    };
  }

  const { error } = await supabase.from("reviews").insert({
    transaction_id: transactionId,
    author_id: user.id,
    target_user_id: targetUserId,
    rating,
    text: reviewText
  });

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  const admin = createAdminSupabaseClient();

  if (admin) {
    const { data: profile } = await admin
      .from("profiles")
      .select("rating_average, review_count")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const currentCount = Number(profile?.review_count ?? 0);
    const currentAverage = Number(profile?.rating_average ?? 0);
    const nextCount = currentCount + 1;
    const nextAverage =
      nextCount === 0 ? rating : (currentAverage * currentCount + rating) / nextCount;

    await admin
      .from("profiles")
      .update({
        rating_average: nextAverage.toFixed(2),
        review_count: nextCount,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", targetUserId);

    await admin.from("notifications").insert({
      user_id: targetUserId,
      type: "review",
      title: "New CampusSwap review",
      body: "A completed exchange review just landed on your profile.",
      destination_href: `/app/profile?userId=${targetUserId}`
    });
  }

  revalidatePath("/app/my-purchases");
  revalidatePath("/app/reviews");
  revalidatePath("/app/profile");
  revalidatePath(`/app/profile?userId=${targetUserId}`);

  return {
    success: true,
    message: "Review submitted."
  };
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requireMarketplaceContext();
    const client = createAdminSupabaseClient() ?? supabase;

    const { error } = await client
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    revalidatePath("/app");
    revalidatePath("/app/notifications");

    return {
      success: true,
      message: "Notification marked as read."
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update this notification right now."
    };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const { user, supabase } = await requireMarketplaceContext();
    const client = createAdminSupabaseClient() ?? supabase;

    const { error } = await client
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    revalidatePath("/app");
    revalidatePath("/app/notifications");

    return {
      success: true,
      message: "All notifications marked as read."
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update notifications right now."
    };
  }
}
