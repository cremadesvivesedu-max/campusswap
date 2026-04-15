import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthUser } from "@/lib/auth/server";
import { demoCurrentUserId, demoData } from "@/lib/demo-data";
import { isLiveMode } from "@/lib/env";
import { resolvePickupArea } from "@/lib/maastricht-pickup-areas";
import { getEmailDomain, resolveVerificationStatus } from "@/lib/verification";
import { filterListings, type DiscoveryFilters } from "@/features/search/discovery";
import { recommendListingsForUser as recommendDemoListings } from "@/server/services/recommendations";
import { searchListings as searchDemoListings } from "@/server/services/search";
import type {
  AllowedEmailDomain,
  Category,
  Conversation,
  FulfillmentMethod,
  Listing,
  ListingAnalytics,
  ListingCondition,
  ListingOffer,
  ListingSearchInput,
  ListingTransactionContext,
  Notification,
  Profile,
  RecommendationBreakdown,
  Report,
  Review,
  SavedSearch,
  SellerListingTransaction,
  SellerTrustMetrics,
  SponsoredPlacement,
  SupportTicket,
  Transaction,
  User,
  VerificationStatus
} from "@/types/domain";

interface DbProfileRow {
  user_id: string;
  full_name: string;
  university: string;
  student_status: Profile["studentStatus"];
  neighborhood: string;
  bio: string;
  preferred_categories: string[] | null;
  buyer_intent: boolean;
  seller_intent: boolean;
  notification_preferences: string[] | null;
  rating_average: number | string;
  review_count: number;
  response_rate: number | string;
  verified_badge: boolean;
}

interface DbUserRow {
  id: string;
  email: string;
  role: User["role"];
  verification_status: VerificationStatus;
  avatar_url: string | null;
  joined_at: string;
  last_seen_at: string | null;
}

interface DbUserWithProfile extends DbUserRow {
  profile: DbProfileRow | null;
}

interface DbCategoryRow {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  hero_description: string;
  color: string;
  typical_price_range: string;
}

interface DbListingImageRow {
  id: string;
  url: string;
  alt: string;
  is_primary: boolean;
  created_at?: string;
}

interface DbListingRow {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  condition: ListingCondition;
  price: number | string;
  negotiable: boolean;
  location: string;
  pickup_area: string;
  pickup_available: boolean;
  shipping_available: boolean;
  shipping_cost: number | string;
  status: Listing["status"];
  outlet: boolean;
  featured: boolean;
  urgent: boolean;
  view_count: number;
  save_count: number;
  tags: string[] | null;
  removed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbListingWithRelations extends DbListingRow {
  listing_images: DbListingImageRow[] | null;
  seller: DbUserWithProfile | null;
  category: DbCategoryRow | null;
}

interface DbFavoriteRow {
  listing: DbListingWithRelations | null;
}

interface DbTransactionRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  state: Transaction["state"];
  checkout_status: Transaction["checkoutStatus"] | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number | string;
  fulfillment_method: FulfillmentMethod | null;
  shipping_amount: number | string;
  platform_fee: number | string;
  total_amount: number | string;
  conversation_id: string | null;
  meetup_spot: string;
  meetup_window: string;
  created_at: string;
  updated_at: string;
  reserved_at: string | null;
  paid_at: string | null;
  ready_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
}

interface DbTransactionWithUsers extends DbTransactionRow {
  buyer: DbUserWithProfile | null;
  seller: DbUserWithProfile | null;
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
  state: "open" | "countered" | "accepted" | "rejected" | "expired" | "withdrawn";
  expires_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbReviewRow {
  id: string;
  transaction_id: string;
  author_id: string;
  target_user_id: string;
  rating: number;
  text: string;
  created_at: string;
}

interface DbNotificationRow {
  id: string;
  user_id: string;
  type: Notification["type"];
  title: string;
  body: string;
  destination_href?: string | null;
  read: boolean;
  created_at: string;
}

interface DbReportRow {
  id: string;
  reporter_id: string;
  target_type: Report["targetType"];
  target_id: string;
  status: Report["status"];
  reason: string;
  created_at: string;
}

interface DbSupportTicketRow {
  id: string;
  user_id: string;
  type: SupportTicket["type"];
  status: SupportTicket["status"];
  subject: string;
  details: string;
  listing_id: string | null;
  conversation_id: string | null;
  transaction_id: string | null;
  target_user_id: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

interface DbSavedSearchRow {
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
  distance_bucket: ListingSearchInput["distance"] | null;
  created_at: string;
  updated_at: string;
}

interface DbConversationRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  blocked_by: string | null;
  unread_count: number;
  quick_actions: string[] | null;
}

interface DbAllowedEmailDomainRow {
  id: string;
  domain: string;
  university_id: string;
  auto_verify: boolean;
}

const listingSelect = `
  id,
  seller_id,
  category_id,
  title,
  description,
  condition,
  price,
  negotiable,
  location,
  pickup_area,
  pickup_available,
  shipping_available,
  shipping_cost,
  status,
  outlet,
  featured,
  urgent,
  view_count,
  save_count,
  tags,
  removed_at,
  created_at,
  updated_at,
  listing_images (
    id,
    url,
    alt,
    is_primary,
    created_at
  ),
  seller:users!listings_seller_id_fkey (
    id,
    email,
    role,
    verification_status,
    avatar_url,
    joined_at,
    last_seen_at,
    profile:profiles (
      user_id,
      full_name,
      university,
      student_status,
      neighborhood,
      bio,
      preferred_categories,
      buyer_intent,
      seller_intent,
      notification_preferences,
      rating_average,
      review_count,
      response_rate,
      verified_badge
    )
  ),
  category:categories (
    id,
    slug,
    name,
    short_description,
    hero_description,
    color,
    typical_price_range
  )
`;

function numberValue(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function normalizeExchangeStatus(value: string): Transaction["state"] {
  if (value === "inquiry" || value === "negotiating") {
    return "pending";
  }

  if (value === "reported") {
    return "reported";
  }

  return value as Transaction["state"];
}

function isHeldTransactionState(state: Transaction["state"]) {
  return [
    "reserved",
    "paid",
    "ready-for-pickup",
    "shipped",
    "delivered"
  ].includes(state);
}

function getFreshnessLabel(createdAt: string, status: Listing["status"], outlet: boolean) {
  if (status === "sold") {
    return "Sold";
  }

  if (status === "reserved") {
    return "Reserved";
  }

  if (outlet) {
    return "Outlet";
  }

  const hours = Math.max(
    1,
    Math.round((Date.now() - Date.parse(createdAt)) / (1000 * 60 * 60))
  );

  if (hours < 24) {
    return `Listed ${hours}h ago`;
  }

  const days = Math.round(hours / 24);
  return days <= 1 ? "Listed yesterday" : `Listed ${days} days ago`;
}

function mapCategory(row: DbCategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    heroDescription: row.hero_description,
    color: row.color,
    typicalPriceRange: row.typical_price_range
  };
}

function mapUser(
  row: DbUserWithProfile,
  options?: {
    sellerMetrics?: SellerTrustMetrics;
  }
): User {
  const profile = row.profile;
  const fallbackSellerMetrics: SellerTrustMetrics = {
    salesCount: 0,
    averageRating: numberValue(profile?.rating_average),
    reviewCount: profile?.review_count ?? 0,
    responseRate: numberValue(profile?.response_rate),
    responseRateMethod: "profile-estimate"
  };

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    verificationStatus: row.verification_status,
    avatar: row.avatar_url ?? undefined,
    joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at ?? row.joined_at,
    profile: {
      userId: row.id,
      fullName: profile?.full_name ?? "CampusSwap student",
      university: profile?.university ?? "CampusSwap",
      studentStatus: profile?.student_status ?? "current",
      neighborhood: profile?.neighborhood ?? "Maastricht",
      bio: profile?.bio ?? "",
      preferredCategories: profile?.preferred_categories ?? [],
      buyerIntent: profile?.buyer_intent ?? true,
      sellerIntent: profile?.seller_intent ?? false,
      notificationPreferences: profile?.notification_preferences ?? [],
      ratingAverage: numberValue(profile?.rating_average),
      reviewCount: profile?.review_count ?? 0,
      responseRate: numberValue(profile?.response_rate),
      verifiedBadge: profile?.verified_badge ?? false
    },
    sellerMetrics: options?.sellerMetrics ?? fallbackSellerMetrics
  };
}

function mapSavedSearch(row: DbSavedSearchRow): SavedSearch {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    query: row.query ?? undefined,
    categorySlug: row.category_slug ?? undefined,
    subcategorySlug: row.subcategory_slug ?? undefined,
    priceMin: row.price_min === null ? undefined : numberValue(row.price_min),
    priceMax: row.price_max === null ? undefined : numberValue(row.price_max),
    conditions: row.conditions ?? [],
    outletOnly: row.outlet_only,
    featuredOnly: row.featured_only,
    minimumSellerRating:
      row.minimum_seller_rating === null
        ? undefined
        : numberValue(row.minimum_seller_rating),
    pickupArea: row.pickup_area ?? undefined,
    distance: row.distance_bucket ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function fetchSellerMetricsMap(userIds: string[]) {
  const resolvedIds = [...new Set(userIds.filter(Boolean))];

  if (!resolvedIds.length || !isLiveMode) {
    return new Map<string, SellerTrustMetrics>();
  }

  const admin = createAdminSupabaseClient();

  if (!admin) {
    return new Map<string, SellerTrustMetrics>();
  }

  const [{ data: profileRows }, { data: completedTransactions }, { data: conversationRows }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("user_id, rating_average, review_count, response_rate")
        .in("user_id", resolvedIds),
      admin
        .from("transactions")
        .select("seller_id")
        .in("seller_id", resolvedIds)
        .eq("state", "completed"),
      admin
        .from("conversations")
        .select("id, buyer_id, seller_id")
        .in("seller_id", resolvedIds)
    ]);

  const profileMap = new Map<
    string,
    {
      ratingAverage: number;
      reviewCount: number;
      responseRate: number;
    }
  >(
    (((profileRows as
      | {
          user_id: string;
          rating_average: number | string;
          review_count: number;
          response_rate: number | string;
        }[]
      | null) ?? []).map((row) => [
      row.user_id,
      {
        ratingAverage: numberValue(row.rating_average),
        reviewCount: row.review_count ?? 0,
        responseRate: numberValue(row.response_rate)
      }
    ]))
  );

  const salesCounts = new Map<string, number>();

  for (const row of
    ((completedTransactions as { seller_id: string }[] | null) ?? [])) {
    salesCounts.set(row.seller_id, (salesCounts.get(row.seller_id) ?? 0) + 1);
  }

  const conversations =
    ((conversationRows as { id: string; buyer_id: string; seller_id: string }[] | null) ??
      []);
  const conversationIds = conversations.map((row) => row.id);
  const messagesByConversation = new Map<
    string,
    { sender_id: string; sent_at: string }[]
  >();

  if (conversationIds.length) {
    const { data: messageRows } = await admin
      .from("messages")
      .select("conversation_id, sender_id, sent_at")
      .in("conversation_id", conversationIds)
      .order("sent_at", { ascending: true });

    for (const row of
      ((messageRows as
        | {
            conversation_id: string;
            sender_id: string;
            sent_at: string;
          }[]
        | null) ?? [])) {
      const bucket = messagesByConversation.get(row.conversation_id) ?? [];
      bucket.push({
        sender_id: row.sender_id,
        sent_at: row.sent_at
      });
      messagesByConversation.set(row.conversation_id, bucket);
    }
  }

  const buyerConversationCounts = new Map<string, number>();
  const sellerReplyCounts = new Map<string, number>();

  for (const conversation of conversations) {
    const messages = messagesByConversation.get(conversation.id) ?? [];
    const firstBuyerMessage = messages.find(
      (message) => message.sender_id === conversation.buyer_id
    );

    if (!firstBuyerMessage) {
      continue;
    }

    buyerConversationCounts.set(
      conversation.seller_id,
      (buyerConversationCounts.get(conversation.seller_id) ?? 0) + 1
    );

    const replied = messages.some(
      (message) =>
        message.sender_id === conversation.seller_id &&
        Date.parse(message.sent_at) >= Date.parse(firstBuyerMessage.sent_at)
    );

    if (replied) {
      sellerReplyCounts.set(
        conversation.seller_id,
        (sellerReplyCounts.get(conversation.seller_id) ?? 0) + 1
      );
    }
  }

  return new Map<string, SellerTrustMetrics>(
    resolvedIds.map((userId) => {
      const profile = profileMap.get(userId);
      const responseConversationCount = buyerConversationCounts.get(userId) ?? 0;
      const repliedConversationCount = sellerReplyCounts.get(userId) ?? 0;
      const hasConversationRate = responseConversationCount > 0;

      return [
        userId,
        {
          salesCount: salesCounts.get(userId) ?? 0,
          averageRating: profile?.ratingAverage ?? 0,
          reviewCount: profile?.reviewCount ?? 0,
          responseRate: hasConversationRate
            ? repliedConversationCount / responseConversationCount
            : profile?.responseRate ?? 0,
          responseRateMethod: hasConversationRate
            ? "conversation-reply-rate"
            : "profile-estimate"
        } satisfies SellerTrustMetrics
      ];
    })
  );
}

async function fetchListingAnalyticsMap(listingIds: string[]) {
  const resolvedIds = [...new Set(listingIds.filter(Boolean))];

  if (!resolvedIds.length || !isLiveMode) {
    return new Map<string, ListingAnalytics>();
  }

  const admin = createAdminSupabaseClient();

  if (!admin) {
    return new Map<string, ListingAnalytics>();
  }

  const [{ data: conversationRows }, { data: offerRows }] = await Promise.all([
    admin
      .from("conversations")
      .select("id, listing_id, buyer_id")
      .in("listing_id", resolvedIds),
    admin
      .from("listing_offers")
      .select("listing_id, buyer_id, created_by_user_id")
      .in("listing_id", resolvedIds)
  ]);

  const conversations =
    ((conversationRows as
      | {
          id: string;
          listing_id: string;
          buyer_id: string;
        }[]
      | null) ?? []);
  const conversationIds = conversations.map((conversation) => conversation.id);
  const buyerByConversationId = new Map(
    conversations.map((conversation) => [conversation.id, conversation.buyer_id])
  );
  const listingByConversationId = new Map(
    conversations.map((conversation) => [conversation.id, conversation.listing_id])
  );
  const analyticsByListingId = new Map<string, ListingAnalytics>(
    resolvedIds.map((listingId) => [
      listingId,
      {
        messagesReceived: 0,
        offersReceived: 0
      }
    ])
  );

  if (conversationIds.length) {
    const { data: messageRows } = await admin
      .from("messages")
      .select("conversation_id, sender_id")
      .in("conversation_id", conversationIds);

    for (const message of
      ((messageRows as
        | {
            conversation_id: string;
            sender_id: string;
          }[]
        | null) ?? [])) {
      const listingId = listingByConversationId.get(message.conversation_id);
      const buyerId = buyerByConversationId.get(message.conversation_id);

      if (!listingId || !buyerId || message.sender_id !== buyerId) {
        continue;
      }

      const current = analyticsByListingId.get(listingId);

      if (!current) {
        continue;
      }

      analyticsByListingId.set(listingId, {
        ...current,
        messagesReceived: current.messagesReceived + 1
      });
    }
  }

  for (const offer of
    ((offerRows as
      | {
          listing_id: string;
          buyer_id: string;
          created_by_user_id: string;
        }[]
      | null) ?? [])) {
    if (offer.created_by_user_id !== offer.buyer_id) {
      continue;
    }

    const current = analyticsByListingId.get(offer.listing_id);

    if (!current) {
      continue;
    }

    analyticsByListingId.set(offer.listing_id, {
      ...current,
      offersReceived: current.offersReceived + 1
    });
  }

  return analyticsByListingId;
}

function mapListing(
  row: DbListingWithRelations,
  options?: {
    savedListingIds?: Set<string>;
    sellerMetricsByUserId?: Map<string, SellerTrustMetrics>;
    listingAnalyticsByListingId?: Map<string, ListingAnalytics>;
  }
): Listing {
  const images = [...(row.listing_images ?? [])].sort((left, right) =>
    Number(right.is_primary) - Number(left.is_primary) ||
    Date.parse(left.created_at ?? "") - Date.parse(right.created_at ?? "")
  );
  const sellerMetrics = options?.sellerMetricsByUserId?.get(row.seller_id);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    categorySlug: row.category?.slug ?? "outlet",
    condition: row.condition,
    price: numberValue(row.price),
    negotiable: row.negotiable,
    location: row.location,
    pickupArea: row.pickup_area,
    pickupAvailable: row.pickup_available,
    shippingAvailable: row.shipping_available,
    shippingCost: numberValue(row.shipping_cost),
    outlet: row.outlet,
    featured: row.featured,
    urgent: row.urgent,
    status: row.status,
    createdAt: row.created_at,
    freshnessLabel: getFreshnessLabel(row.created_at, row.status, row.outlet),
    sellerId: row.seller_id,
    sellerName: row.seller?.profile?.full_name ?? "CampusSwap seller",
    sellerVerificationStatus: row.seller?.verification_status ?? "unverified",
    sellerRating: sellerMetrics?.averageRating ?? numberValue(row.seller?.profile?.rating_average),
    sellerReviewCount: sellerMetrics?.reviewCount ?? row.seller?.profile?.review_count ?? 0,
    sellerResponseRate:
      sellerMetrics?.responseRate ?? numberValue(row.seller?.profile?.response_rate),
    sellerSalesCount: sellerMetrics?.salesCount ?? 0,
    sellerJoinedAt: row.seller?.joined_at ?? undefined,
    viewCount: row.view_count,
    saveCount: row.save_count,
    isSaved: options?.savedListingIds?.has(row.id) ?? false,
    tags: row.tags ?? [],
    analytics: options?.listingAnalyticsByListingId?.get(row.id),
    removedAt: row.removed_at ?? undefined,
    images: images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      isPrimary: image.is_primary
    }))
  };
}

function mapTransaction(row: DbTransactionRow): Transaction {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    state: normalizeExchangeStatus(row.state),
    checkoutStatus: row.checkout_status ?? undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id ?? undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
    amount: numberValue(row.amount),
    fulfillmentMethod: row.fulfillment_method ?? undefined,
    shippingAmount: numberValue(row.shipping_amount),
    platformFee: numberValue(row.platform_fee),
    totalAmount: numberValue(row.total_amount),
    meetupSpot: row.meetup_spot,
    meetupWindow: row.meetup_window,
    conversationId: row.conversation_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reservedAt: row.reserved_at ?? undefined,
    paidAt: row.paid_at ?? undefined,
    readyAt: row.ready_at ?? undefined,
    shippedAt: row.shipped_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    completedAt: row.completed_at ?? undefined
  };
}

function mapOffer(row: DbOfferRow): ListingOffer {
  const expired =
    row.state === "open" && row.expires_at && Date.parse(row.expires_at) <= Date.now();

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
    state: expired ? "expired" : row.state,
    expiresAt: row.expires_at ?? undefined,
    respondedAt: row.responded_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapReview(row: DbReviewRow): Review {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    authorId: row.author_id,
    targetUserId: row.target_user_id,
    rating: row.rating,
    text: row.text,
    createdAt: row.created_at
  };
}

function mapNotification(row: DbNotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    destinationHref: row.destination_href ?? undefined,
    read: row.read,
    createdAt: row.created_at
  };
}

function mapReport(row: DbReportRow): Report {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    targetType: row.target_type,
    targetId: row.target_id,
    status: row.status,
    reason: row.reason,
    createdAt: row.created_at
  };
}

function mapSupportTicket(row: DbSupportTicketRow): SupportTicket {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    status: row.status,
    subject: row.subject,
    details: row.details,
    listingId: row.listing_id ?? undefined,
    conversationId: row.conversation_id ?? undefined,
    transactionId: row.transaction_id ?? undefined,
    targetUserId: row.target_user_id ?? undefined,
    adminNote: row.admin_note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapConversation(row: DbConversationRow): Conversation {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    unreadCount: row.unread_count,
    quickActions: row.quick_actions ?? [],
    blockedBy: row.blocked_by ?? undefined,
    messages: []
  };
}

function sortFeaturedListingsFirst(listings: Listing[]) {
  return [...listings].sort((left, right) => {
    if (left.featured !== right.featured) {
      return Number(right.featured) - Number(left.featured);
    }

    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
}

function sortFeaturedOnlyByRecency(listings: Listing[]) {
  return [...listings].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  );
}

async function fetchLatestOfferForConversation(
  conversationId: string
): Promise<ListingOffer | undefined> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data } = await supabase
    .from("listing_offers")
    .select(
      "id, listing_id, transaction_id, conversation_id, buyer_id, seller_id, created_by_user_id, parent_offer_id, amount, state, expires_at, responded_at, created_at, updated_at"
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = (data as unknown as DbOfferRow | null) ?? null;
  return row ? mapOffer(row) : undefined;
}

async function getSupabaseClient() {
  return createServerSupabaseClient();
}

async function fetchUserRowById(userId: string) {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select(
      `
        id,
        email,
        role,
        verification_status,
        avatar_url,
        joined_at,
        last_seen_at,
        profile:profiles (
          user_id,
          full_name,
          university,
          student_status,
          neighborhood,
          bio,
          preferred_categories,
          buyer_intent,
          seller_intent,
          notification_preferences,
          rating_average,
          review_count,
          response_rate,
          verified_badge
        )
      `
    )
    .eq("id", userId)
    .maybeSingle();

  return (data as unknown as DbUserWithProfile | null) ?? null;
}

async function fetchListingRows(
  input: ListingSearchInput & {
    includeStatuses?: Listing["status"][];
    includeRemoved?: boolean;
  } = {}
) {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    return [];
  }

  let query = supabase.from("listings").select(listingSelect);
  const visibleStatuses =
    input.includeStatuses ?? ["active", "reserved"];

  query = query.in("status", visibleStatuses);

  if (!input.includeRemoved) {
    query = query.is("removed_at", null);
  }

  if (input.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", input.categorySlug)
      .maybeSingle();

    if (!category?.id) {
      return [];
    }

    query = query.eq("category_id", category.id);
  }

  if (typeof input.priceMin === "number") {
    query = query.gte("price", input.priceMin);
  }

  if (typeof input.priceMax === "number") {
    query = query.lte("price", input.priceMax);
  }

  if (input.condition?.length) {
    query = query.in("condition", input.condition);
  }

  if (typeof input.outlet === "boolean") {
    query = query.eq("outlet", input.outlet);
  }

  if (typeof input.featured === "boolean") {
    query = query.eq("featured", input.featured);
  }

  const cleanQuery = input.query?.trim();
  if (cleanQuery) {
    const escaped = cleanQuery.replace(/,/g, " ");
    query = query.or(
      `title.ilike.%${escaped}%,description.ilike.%${escaped}%`
    );
  }

  if (input.sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (input.sort === "price-low-high") {
    query = query.order("price", { ascending: true });
  } else if (input.sort === "price-high-low") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const queryLimit = input.limit ?? (input.pickupArea ? 120 : 60);
  const { data } = await query.limit(queryLimit);
  return (data as unknown as DbListingWithRelations[] | null) ?? [];
}

async function fetchActiveListings(input: ListingSearchInput = {}) {
  if (!isLiveMode) {
    return searchDemoListings(input);
  }

  const rows = await fetchListingRows(input);
  const supabase = await getSupabaseClient();
  const {
    data: { user: authUser }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  let savedListingIds = new Set<string>();

  if (authUser?.id && rows.length) {
    const { data: favoriteRows } = await supabase!
      .from("favorites")
      .select("listing_id")
      .eq("user_id", authUser.id)
      .in(
        "listing_id",
        rows.map((row) => row.id)
      );

    savedListingIds = new Set(
      (((favoriteRows as { listing_id: string }[] | null) ?? []).map(
        (row) => row.listing_id
      ))
    );
  }

  const sellerMetricsByUserId = await fetchSellerMetricsMap(
    rows.map((row) => row.seller_id)
  );
  const listings = rows.map((row) =>
    mapListing(row, { savedListingIds, sellerMetricsByUserId })
  );
  const discoveryFilters: DiscoveryFilters = {
    query: input.query ?? "",
    categorySlug: input.categorySlug,
    subcategorySlug: input.subcategorySlug,
    priceMin: input.priceMin,
    priceMax: input.priceMax,
    conditions: input.condition ?? [],
    outletOnly: input.outlet ?? false,
    featuredOnly: input.featured ?? false,
    minimumSellerRating: input.minimumSellerRating,
    pickupArea: input.pickupArea,
    distance: input.distance,
    sort: input.sort ?? "recommended"
  };

  return filterListings(listings, discoveryFilters);
}

export async function searchMarketplaceListings(input: ListingSearchInput = {}) {
  return fetchActiveListings(input);
}

async function ensurePublicUserRecord() {
  const authUser = await requireAuthUser("/app");
  const existing = await fetchUserRowById(authUser.id);
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return existing;
  }

  const email = authUser.email?.trim().toLowerCase() ?? "";
  const domain = getEmailDomain(email);
  const { data: allowedDomain } = await admin
    .from("allowed_email_domains")
    .select("id, domain, university_id, auto_verify")
    .eq("domain", domain)
    .maybeSingle();

  const verificationStatus = resolveVerificationStatus(
    email,
    allowedDomain
      ? [
          {
            domain: allowedDomain.domain,
            autoVerify: allowedDomain.auto_verify
          }
        ]
      : []
  );
  const fullName =
    String(authUser.user_metadata.full_name ?? "").trim() ||
    email.split("@")[0] ||
    "CampusSwap student";
  const university =
    String(authUser.user_metadata.university ?? "").trim() || "CampusSwap";
  const studentStatus =
    String(authUser.user_metadata.student_status ?? "").trim() || "current";
  const neighborhood =
    String(authUser.user_metadata.neighborhood ?? "").trim() || "Maastricht";
  const bio = String(authUser.user_metadata.bio ?? "").trim();

  if (existing) {
    const nextStatus =
      existing.verification_status === "verified"
        ? "verified"
        : verificationStatus;
    const nextBadge = nextStatus === "verified";
    const shouldSyncStatus = existing.verification_status !== nextStatus;
    const shouldSyncBadge = (existing.profile?.verified_badge ?? false) !== nextBadge;

    if (shouldSyncStatus || shouldSyncBadge) {
      await admin
        .from("users")
        .update({
          verification_status: nextStatus,
          last_seen_at: new Date().toISOString()
        })
        .eq("id", authUser.id);

      await admin
        .from("profiles")
        .update({
          verified_badge: nextBadge,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", authUser.id);

      return fetchUserRowById(authUser.id);
    }

    return existing;
  }

  await admin.from("users").upsert({
    id: authUser.id,
    email,
    role: "student",
    verification_status: verificationStatus,
    joined_at: authUser.created_at,
    last_seen_at: new Date().toISOString()
  });

  await admin.from("profiles").upsert({
    user_id: authUser.id,
    full_name: fullName,
    university,
    student_status: studentStatus,
    neighborhood,
    bio,
    preferred_categories: [],
    buyer_intent: true,
    seller_intent: false,
    notification_preferences: ["messages", "listing_updates"],
    rating_average: 0,
    review_count: 0,
    response_rate: 0,
    verified_badge: verificationStatus === "verified"
  });

  return fetchUserRowById(authUser.id);
}

export async function getCurrentUser() {
  if (!isLiveMode) {
    return (
      demoData.users.find((user) => user.id === demoCurrentUserId) ?? demoData.users[0]
    );
  }

  const row = await ensurePublicUserRecord();
  if (!row) {
    throw new Error("Unable to load the current CampusSwap user.");
  }

  const sellerMetricsByUserId = await fetchSellerMetricsMap([row.id]);
  return mapUser(row, {
    sellerMetrics: sellerMetricsByUserId.get(row.id)
  });
}

export async function getUserById(userId: string) {
  if (!isLiveMode) {
    return demoData.users.find((user) => user.id === userId);
  }

  const row = await fetchUserRowById(userId);
  if (!row) {
    return undefined;
  }

  const sellerMetricsByUserId = await fetchSellerMetricsMap([row.id]);
  return mapUser(row, {
    sellerMetrics: sellerMetricsByUserId.get(row.id)
  });
}

export async function getFeaturedListings() {
  if (!isLiveMode) {
    return sortFeaturedOnlyByRecency(
      demoData.listings.filter(
        (listing) => listing.featured && listing.status === "active"
      )
    );
  }

  const listings = await fetchActiveListings({
    featured: true,
    sort: "newest",
    limit: 8
  });
  return sortFeaturedOnlyByRecency(listings);
}

export async function getOutletListings() {
  if (!isLiveMode) {
    return demoData.listings.filter(
      (listing) => listing.outlet && listing.status === "active"
    );
  }

  return fetchActiveListings({ outlet: true, sort: "recommended", limit: 18 });
}

export async function getTrendingSearches() {
  if (!isLiveMode) {
    return ["bike", "desk", "kitchen set", "monitor", "bedding"];
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("search_events")
    .select("query")
    .order("created_at", { ascending: false })
    .limit(100);

  const counts = new Map<string, number>();

  for (const row of (data as { query: string }[] | null) ?? []) {
    const key = row.query.trim().toLowerCase();
    if (!key) {
      continue;
    }

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([query]) => query);
}

export async function getRecentSearches(userId?: string) {
  if (!isLiveMode) {
    const resolvedUserId = userId ?? demoCurrentUserId;
    return demoData.searchEvents
      .filter((event) => event.userId === resolvedUserId)
      .map((event) => event.query);
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const { data } = await supabase
    .from("search_events")
    .select("query")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return [...new Set(((data as { query: string }[] | null) ?? []).map((row) => row.query))];
}

export async function getSavedSearches(userId?: string) {
  if (!isLiveMode) {
    return [] as SavedSearch[];
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const { data } = await supabase
    .from("saved_searches")
    .select(
      "id, user_id, name, query, category_slug, subcategory_slug, price_min, price_max, conditions, outlet_only, featured_only, minimum_seller_rating, pickup_area, distance_bucket, created_at, updated_at"
    )
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  return ((data as unknown as DbSavedSearchRow[] | null) ?? []).map(mapSavedSearch);
}

export async function getSavedListings(userId?: string) {
  if (!isLiveMode) {
    const resolvedUserId = userId ?? demoCurrentUserId;
    const ids = demoData.favorites
      .filter((favorite) => favorite.userId === resolvedUserId)
      .map((favorite) => favorite.listingId);
    return demoData.listings.filter((listing) => ids.includes(listing.id));
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const { data } = await supabase
    .from("favorites")
    .select(`listing:listings(${listingSelect})`)
    .eq("user_id", currentUser.id);

  const rows = (data as unknown as DbFavoriteRow[] | null) ?? [];
  const listingRows = rows
    .map((row) => row.listing)
    .filter((listing): listing is DbListingWithRelations => Boolean(listing));
  const sellerMetricsByUserId = await fetchSellerMetricsMap(
    listingRows.map((listing) => listing.seller_id)
  );

  return listingRows.map((listing) =>
    mapListing(listing, {
      savedListingIds: new Set([listing.id]),
      sellerMetricsByUserId
    })
  );
}

export async function getListingById(
  id: string,
  options?: {
    includeRemoved?: boolean;
  }
) {
  if (!isLiveMode) {
    return demoData.listings.find(
      (listing) => listing.id === id && (options?.includeRemoved || !listing.removedAt)
    );
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return undefined;
  }

  const { data } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("id", id)
    .maybeSingle();

  const row = (data as unknown as DbListingWithRelations | null) ?? null;

  if (!row) {
    return undefined;
  }

  if (row.removed_at && !options?.includeRemoved) {
    return undefined;
  }

  const {
    data: { user: authUser }
  } = await supabase.auth.getUser();

  let savedListingIds = new Set<string>();

  if (authUser?.id) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", authUser.id)
      .eq("listing_id", id)
      .maybeSingle();

    if (favorite?.listing_id) {
      savedListingIds = new Set([favorite.listing_id]);
    }
  }

  const sellerMetricsByUserId = await fetchSellerMetricsMap([row.seller_id]);
  const listingAnalyticsByListingId = await fetchListingAnalyticsMap([row.id]);
  return mapListing(row, {
    savedListingIds,
    sellerMetricsByUserId,
    listingAnalyticsByListingId
  });
}

export async function getCategoryBySlug(slug: string) {
  if (!isLiveMode) {
    return demoData.categories.find((category) => category.slug === slug);
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return undefined;
  }

  const { data } = await supabase
    .from("categories")
    .select(
      "id, slug, name, short_description, hero_description, color, typical_price_range"
    )
    .eq("slug", slug)
    .maybeSingle();

  const row = (data as unknown as DbCategoryRow | null) ?? null;
  return row ? mapCategory(row) : undefined;
}

export async function getAllCategories() {
  if (!isLiveMode) {
    return demoData.categories;
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("categories")
    .select(
      "id, slug, name, short_description, hero_description, color, typical_price_range"
    )
    .order("name", { ascending: true });

  return ((data as unknown as DbCategoryRow[] | null) ?? []).map(mapCategory);
}

export async function getListingsByCategory(slug: string) {
  if (!isLiveMode) {
    return searchDemoListings({ categorySlug: slug, sort: "recommended" });
  }

  return fetchActiveListings({ categorySlug: slug, sort: "recommended" });
}

export async function getConversations(userId?: string) {
  if (!isLiveMode) {
    const resolvedUserId = userId ?? demoCurrentUserId;
    return demoData.conversations.filter(
      (conversation) =>
        conversation.buyerId === resolvedUserId ||
        conversation.sellerId === resolvedUserId
    );
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const { data } = await supabase
    .from("conversations")
    .select(
      "id, listing_id, buyer_id, seller_id, blocked_by, unread_count, quick_actions"
    )
    .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
    .order("updated_at", { ascending: false });

  return ((data as unknown as DbConversationRow[] | null) ?? []).map(mapConversation);
}

export async function getConversationById(id: string) {
  if (!isLiveMode) {
    return demoData.conversations.find((conversation) => conversation.id === id);
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return undefined;
  }

  const { data } = await supabase
    .from("conversations")
    .select(
      "id, listing_id, buyer_id, seller_id, blocked_by, unread_count, quick_actions"
    )
    .eq("id", id)
    .maybeSingle();

  const row = (data as unknown as DbConversationRow | null) ?? null;
  return row ? mapConversation(row) : undefined;
}

export async function getTransactionsForUser(userId?: string) {
  if (!isLiveMode) {
    const resolvedUserId = userId ?? demoCurrentUserId;
    return demoData.transactions.filter(
      (transaction) =>
        transaction.buyerId === resolvedUserId ||
        transaction.sellerId === resolvedUserId
    );
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const { data } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, amount, fulfillment_method, shipping_amount, platform_fee, total_amount, conversation_id, meetup_spot, meetup_window, created_at, updated_at, reserved_at, paid_at, ready_at, shipped_at, delivered_at, cancelled_at, completed_at"
    )
    .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
    .order("updated_at", { ascending: false });

  return ((data as unknown as DbTransactionRow[] | null) ?? []).map(mapTransaction);
}

export async function getTransactionForConversation(
  conversationId: string
): Promise<Transaction | undefined> {
  if (!isLiveMode) {
    return demoData.transactions.find(
      (transaction) =>
        demoData.conversations.find((conversation) => conversation.id === conversationId)
          ?.listingId === transaction.listingId &&
        demoData.conversations.find((conversation) => conversation.id === conversationId)
          ?.buyerId === transaction.buyerId &&
        demoData.conversations.find((conversation) => conversation.id === conversationId)
          ?.sellerId === transaction.sellerId
    );
  }

  const supabase = await getSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, checkout_status, stripe_checkout_session_id, stripe_payment_intent_id, amount, fulfillment_method, shipping_amount, platform_fee, total_amount, conversation_id, meetup_spot, meetup_window, created_at, updated_at, reserved_at, paid_at, ready_at, shipped_at, delivered_at, cancelled_at, completed_at"
    )
    .eq("conversation_id", conversationId)
    .maybeSingle();

  const row = (data as unknown as DbTransactionRow | null) ?? null;
  return row ? mapTransaction(row) : undefined;
}

export async function getListingTransactionContext(
  listingId: string,
  currentUserId: string
): Promise<ListingTransactionContext> {
  if (!isLiveMode) {
    const activeTransaction =
      demoData.transactions.find(
        (transaction) =>
          transaction.listingId === listingId &&
          (isHeldTransactionState(transaction.state) ||
            transaction.state === "completed")
      ) ??
      demoData.transactions.find(
        (transaction) =>
          transaction.listingId === listingId &&
          transaction.state === "pending"
      );
    const viewerTransaction = demoData.transactions.find(
      (transaction) =>
        transaction.listingId === listingId &&
        transaction.buyerId === currentUserId &&
        transaction.state !== "cancelled"
    );
    const buyer = activeTransaction
      ? demoData.users.find((candidate) => candidate.id === activeTransaction.buyerId)
      : undefined;
    const seller = activeTransaction
      ? demoData.users.find((candidate) => candidate.id === activeTransaction.sellerId)
      : undefined;
    const activeTransactionState = activeTransaction?.state;
    const activeTransactionBuyerId = activeTransaction?.buyerId;
    const activeTransactionHeld = activeTransactionState
      ? isHeldTransactionState(activeTransactionState)
      : false;

    return {
      activeTransaction,
      viewerTransaction,
      latestOffer: undefined,
      reservedForCurrentUser:
        activeTransactionHeld && activeTransactionBuyerId === currentUserId,
      reservedForOtherBuyer:
        activeTransactionHeld && activeTransactionBuyerId !== currentUserId,
      buyer,
      seller
    };
  }

  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      reservedForCurrentUser: false,
      reservedForOtherBuyer: false
    };
  }

  const { data } = await supabase
    .from("transactions")
    .select(
      `
        id,
        listing_id,
        buyer_id,
        seller_id,
        state,
        checkout_status,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        amount,
        fulfillment_method,
        shipping_amount,
        platform_fee,
        total_amount,
        conversation_id,
        meetup_spot,
        meetup_window,
        created_at,
        updated_at,
        reserved_at,
        paid_at,
        ready_at,
        shipped_at,
        delivered_at,
        cancelled_at,
        completed_at,
        buyer:users!transactions_buyer_id_fkey (
          id,
          email,
          role,
          verification_status,
          avatar_url,
          joined_at,
          last_seen_at,
          profile:profiles (
            user_id,
            full_name,
            university,
            student_status,
            neighborhood,
            bio,
            preferred_categories,
            buyer_intent,
            seller_intent,
            notification_preferences,
            rating_average,
            review_count,
            response_rate,
            verified_badge
          )
        ),
        seller:users!transactions_seller_id_fkey (
          id,
          email,
          role,
          verification_status,
          avatar_url,
          joined_at,
          last_seen_at,
          profile:profiles (
            user_id,
            full_name,
            university,
            student_status,
            neighborhood,
            bio,
            preferred_categories,
            buyer_intent,
            seller_intent,
            notification_preferences,
            rating_average,
            review_count,
            response_rate,
            verified_badge
          )
        )
      `
    )
    .eq("listing_id", listingId)
    .in("state", [
      "pending",
      "reserved",
      "paid",
      "ready-for-pickup",
      "shipped",
      "delivered",
      "completed"
    ])
    .order("updated_at", { ascending: false });

  const rows = (data as unknown as DbTransactionWithUsers[] | null) ?? [];
  const activeRow =
    rows.find((row) => isHeldTransactionState(normalizeExchangeStatus(row.state))) ??
    rows.find((row) => row.state === "completed") ??
    rows.find((row) => normalizeExchangeStatus(row.state) === "pending");
  const viewerRow = rows.find(
    (row) =>
      row.buyer_id === currentUserId &&
      !["cancelled", "reported"].includes(normalizeExchangeStatus(row.state))
  );
  const latestOffer = viewerRow?.conversation_id || activeRow?.conversation_id
    ? await fetchLatestOfferForConversation(
        viewerRow?.conversation_id ?? activeRow?.conversation_id ?? ""
      )
    : undefined;
  const activeRowState = activeRow ? normalizeExchangeStatus(activeRow.state) : undefined;
  const activeRowHeld = activeRowState ? isHeldTransactionState(activeRowState) : false;

  return {
    activeTransaction: activeRow ? mapTransaction(activeRow) : undefined,
    viewerTransaction: viewerRow ? mapTransaction(viewerRow) : undefined,
    latestOffer,
    reservedForCurrentUser: activeRowHeld && activeRow?.buyer_id === currentUserId,
    reservedForOtherBuyer: activeRowHeld && activeRow?.buyer_id !== currentUserId,
    buyer: activeRow?.buyer ? mapUser(activeRow.buyer) : undefined,
    seller: activeRow?.seller ? mapUser(activeRow.seller) : undefined
  };
}

export async function getSellerListingTransactions(
  sellerId: string
): Promise<Record<string, SellerListingTransaction>> {
  if (!isLiveMode) {
    return demoData.transactions
      .filter(
        (transaction) =>
          transaction.sellerId === sellerId &&
          [
            "pending",
            "reserved",
            "paid",
            "ready-for-pickup",
            "shipped",
            "delivered",
            "completed"
          ].includes(transaction.state)
      )
      .reduce<Record<string, SellerListingTransaction>>((accumulator, transaction) => {
        const buyer = demoData.users.find((candidate) => candidate.id === transaction.buyerId);

        if (buyer) {
          accumulator[transaction.listingId] = {
            transaction,
            buyer
          };
        }

        return accumulator;
      }, {});
  }

  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {};
  }

  const { data } = await supabase
    .from("transactions")
    .select(
      `
        id,
        listing_id,
        buyer_id,
        seller_id,
        state,
        checkout_status,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        amount,
        fulfillment_method,
        shipping_amount,
        platform_fee,
        total_amount,
        conversation_id,
        meetup_spot,
        meetup_window,
        created_at,
        updated_at,
        reserved_at,
        paid_at,
        ready_at,
        shipped_at,
        delivered_at,
        cancelled_at,
        completed_at,
        buyer:users!transactions_buyer_id_fkey (
          id,
          email,
          role,
          verification_status,
          avatar_url,
          joined_at,
          last_seen_at,
          profile:profiles (
            user_id,
            full_name,
            university,
            student_status,
            neighborhood,
            bio,
            preferred_categories,
            buyer_intent,
            seller_intent,
            notification_preferences,
            rating_average,
            review_count,
            response_rate,
            verified_badge
          )
        )
      `
    )
    .eq("seller_id", sellerId)
    .in("state", [
      "pending",
      "reserved",
      "paid",
      "ready-for-pickup",
      "shipped",
      "delivered",
      "completed"
    ])
    .order("updated_at", { ascending: false });

  return (((data as unknown as DbTransactionWithUsers[] | null) ?? [])).reduce<
    Record<string, SellerListingTransaction>
  >((accumulator, row) => {
    if (!accumulator[row.listing_id] && row.buyer) {
      accumulator[row.listing_id] = {
        transaction: mapTransaction(row),
        buyer: mapUser(row.buyer)
      };
    }

    return accumulator;
  }, {});
}

export async function getReviewsForUser(userId: string) {
  if (!isLiveMode) {
    return demoData.reviews.filter(
      (review) => review.authorId === userId || review.targetUserId === userId
    );
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("reviews")
    .select("id, transaction_id, author_id, target_user_id, rating, text, created_at")
    .or(`author_id.eq.${userId},target_user_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  return ((data as unknown as DbReviewRow[] | null) ?? []).map(mapReview);
}

export async function getNotificationsForUser(userId?: string) {
  if (!isLiveMode) {
    const resolvedUserId = userId ?? demoCurrentUserId;
    return demoData.notifications.filter((notification) => notification.userId === resolvedUserId);
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, destination_href, read, created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error?.code === "42703" || error?.message.includes("destination_href")) {
    const fallback = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, read, created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    return ((fallback.data as unknown as DbNotificationRow[] | null) ?? []).map(
      mapNotification
    );
  }

  return ((data as unknown as DbNotificationRow[] | null) ?? []).map(mapNotification);
}

export async function getReportsForUser(userId?: string) {
  if (!isLiveMode) {
    const resolvedUserId = userId ?? demoCurrentUserId;
    return demoData.reports.filter((report) => report.reporterId === resolvedUserId);
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const { data } = await supabase
    .from("reports")
    .select("id, reporter_id, target_type, target_id, status, reason, created_at")
    .eq("reporter_id", currentUser.id)
    .order("created_at", { ascending: false });

  return ((data as unknown as DbReportRow[] | null) ?? []).map(mapReport);
}

export async function getSupportTicketsForUser(userId?: string) {
  if (!isLiveMode) {
    const resolvedUserId = userId ?? demoCurrentUserId;
    return demoData.supportTickets.filter((ticket) => ticket.userId === resolvedUserId);
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const { data } = await supabase
    .from("support_tickets")
    .select(
      "id, user_id, type, status, subject, details, listing_id, conversation_id, transaction_id, target_user_id, admin_note, created_at, updated_at"
    )
    .eq("user_id", currentUser.id)
    .order("updated_at", { ascending: false });

  return ((data as unknown as DbSupportTicketRow[] | null) ?? []).map(mapSupportTicket);
}

export async function getListingsForSeller(userId: string) {
  if (!isLiveMode) {
    return demoData.listings.filter(
      (listing) => listing.sellerId === userId && !listing.removedAt
    );
  }

  const rows = await fetchListingRows({
    includeStatuses: ["active", "reserved", "sold", "archived", "pending-review", "hidden"],
    includeRemoved: false
  });

  const sellerRows = rows.filter((row) => row.seller_id === userId);
  const sellerMetricsByUserId = await fetchSellerMetricsMap([userId]);
  const listingAnalyticsByListingId = await fetchListingAnalyticsMap(
    sellerRows.map((row) => row.id)
  );

  return sellerRows.map((row) =>
    mapListing(row, {
      sellerMetricsByUserId,
      listingAnalyticsByListingId
    })
  );
}

export async function getHomeFeed() {
  const listings = await fetchActiveListings({ sort: "recommended", limit: 24 });
  return sortFeaturedListingsFirst(listings);
}

export async function getForYouFeed(userId?: string) {
  if (!isLiveMode) {
    const resolvedUserId = userId ?? demoCurrentUserId;
    return recommendDemoListings(resolvedUserId);
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const [candidateRows, favoriteRows, searchRows, viewRows] = await Promise.all([
    fetchListingRows({ sort: "recommended", limit: 36 }),
    supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", currentUser.id),
    supabase
      .from("search_events")
      .select("query")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("view_events")
      .select("listing_id")
      .eq("user_id", currentUser.id)
      .order("viewed_at", { ascending: false })
      .limit(20)
  ]);

  const favoriteListingIds = new Set(
    (((favoriteRows.data as { listing_id: string }[] | null) ?? []).map(
      (row) => row.listing_id
    ))
  );
  const recentQueries = (((searchRows.data as { query: string }[] | null) ?? []).map(
    (row) => row.query.toLowerCase()
  ));
  const viewedIds = new Set(
    (((viewRows.data as { listing_id: string }[] | null) ?? []).map(
      (row) => row.listing_id
    ))
  );

  const candidates = candidateRows
    .map((row) => ({
      row,
      listing: mapListing(row, { savedListingIds: favoriteListingIds })
    }))
    .filter((entry) => entry.listing.sellerId !== currentUser.id);

  const ranked = candidates
    .map((entry) => {
      let score = 0;
      const reasons: string[] = [];

      if (currentUser.profile.preferredCategories.includes(entry.listing.categorySlug)) {
        score += 30;
        reasons.push("matches your preferred categories");
      }

      if (favoriteListingIds.has(entry.listing.id)) {
        score -= 16;
      } else if (
        entry.listing.tags.some((tag) =>
          [...favoriteListingIds].some((favoriteId) =>
            candidateRows
              .find((row) => row.id === favoriteId)
              ?.tags?.some((favoriteTag) => favoriteTag === tag)
          )
        )
      ) {
        score += 14;
        reasons.push("similar to items you saved");
      }

      if (
        recentQueries.some((query) =>
          `${entry.listing.title} ${entry.listing.description}`.toLowerCase().includes(query)
        )
      ) {
        score += 12;
        reasons.push("close to your recent searches");
      }

      if (viewedIds.has(entry.listing.id)) {
        score -= 12;
      }

      if (entry.listing.featured) {
        score += 18;
        reasons.push("featured listing boost");
      }

      if (entry.listing.outlet && entry.listing.price <= 20) {
        score += 12;
        reasons.push("strong value for low-budget setup");
      }

      if (entry.listing.urgent) {
        score += 6;
        reasons.push("seller wants a fast pickup");
      }

      score += Math.round(entry.listing.sellerRating * 4);
      score += Math.round(entry.listing.sellerResponseRate * 10);
      score += Math.max(
        2,
        15 -
          Math.round(
            (Date.now() - Date.parse(entry.listing.createdAt)) / (1000 * 60 * 60 * 18)
          )
      );

      return {
        listing: entry.listing,
        breakdown: {
          listingId: entry.listing.id,
          score,
          reasons
        } satisfies RecommendationBreakdown
      };
    })
    .filter((entry) => entry.breakdown.score > 0)
    .sort((left, right) => right.breakdown.score - left.breakdown.score)
    .slice(0, 8);

  return ranked;
}

export async function getBecauseYouViewedFeed(userId?: string) {
  if (!isLiveMode) {
    return [] as { listing: Listing; reasons: string[] }[];
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!supabase || !currentUser) {
    return [];
  }

  const [candidateListings, viewRows] = await Promise.all([
    fetchActiveListings({ sort: "recommended", limit: 36 }),
    supabase
      .from("view_events")
      .select("listing_id")
      .eq("user_id", currentUser.id)
      .order("viewed_at", { ascending: false })
      .limit(12)
  ]);

  const viewedIds = [
    ...new Set(
      (((viewRows.data as { listing_id: string }[] | null) ?? []).map(
        (row) => row.listing_id
      ))
    )
  ];

  if (!viewedIds.length) {
    return [];
  }

  const viewedListings = candidateListings.filter((listing) => viewedIds.includes(listing.id));

  if (!viewedListings.length) {
    return [];
  }

  const viewedCategories = new Set(viewedListings.map((listing) => listing.categorySlug));
  const viewedAreas = new Set(
    viewedListings.map((listing) =>
      resolvePickupArea({ pickupArea: listing.pickupArea }).areaId
    )
  );
  const viewedAveragePrice =
    viewedListings.reduce((sum, listing) => sum + listing.price, 0) / viewedListings.length;

  return candidateListings
    .filter(
      (listing) =>
        listing.sellerId !== currentUser.id &&
        !viewedIds.includes(listing.id)
    )
    .map((listing) => {
      let score = 0;
      const reasons: string[] = [];

      if (viewedCategories.has(listing.categorySlug)) {
        score += 24;
        reasons.push("same category as a recent view");
      }

      if (
        viewedAreas.has(resolvePickupArea({ pickupArea: listing.pickupArea }).areaId)
      ) {
        score += 14;
        reasons.push("same meetup area as something you viewed");
      }

      if (Math.abs(listing.price - viewedAveragePrice) <= Math.max(15, viewedAveragePrice * 0.2)) {
        score += 12;
        reasons.push("close to the price range you were checking");
      }

      const recentListingMatch = viewedListings.some((viewedListing) =>
        viewedListing.tags.some((tag) => listing.tags.includes(tag))
      );

      if (recentListingMatch) {
        score += 10;
        reasons.push("shares tags with recent views");
      }

      score += listing.featured ? 8 : 0;
      score += listing.saveCount * 2 + Math.min(10, listing.viewCount);

      return { listing, reasons, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 6)
    .map(({ listing, reasons }) => ({ listing, reasons }));
}

export async function getMostPopularInAreaFeed(userId?: string) {
  if (!isLiveMode) {
    return [] as Listing[];
  }

  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const supabase = await getSupabaseClient();

  if (!currentUser || !supabase) {
    return [];
  }

  const areaSeed = currentUser.profile.neighborhood || "Maastricht";
  const rows = await fetchListingRows({
    pickupArea: areaSeed,
    distance: "nearby",
    sort: "newest",
    limit: 24
  });

  if (!rows.length) {
    return [];
  }

  const [{ data: favoriteRows }, sellerMetricsByUserId, listingAnalyticsByListingId] =
    await Promise.all([
      supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", currentUser.id)
        .in(
          "listing_id",
          rows.map((row) => row.id)
        ),
      fetchSellerMetricsMap(rows.map((row) => row.seller_id)),
      fetchListingAnalyticsMap(rows.map((row) => row.id))
    ]);

  const savedListingIds = new Set(
    (((favoriteRows as { listing_id: string }[] | null) ?? []).map((row) => row.listing_id))
  );
  const listings = rows.map((row) =>
    mapListing(row, {
      savedListingIds,
      sellerMetricsByUserId,
      listingAnalyticsByListingId
    })
  );

  return listings
      .filter((listing) => listing.sellerId !== currentUser.id)
      .sort((left, right) => {
        const leftScore =
          left.saveCount * 4 +
          left.viewCount +
          (left.analytics?.messagesReceived ?? 0) * 3 +
          (left.analytics?.offersReceived ?? 0) * 5 +
          Math.round(left.sellerRating * 5) +
          (left.featured ? 10 : 0) +
          (left.urgent ? 4 : 0);
        const rightScore =
          right.saveCount * 4 +
          right.viewCount +
          (right.analytics?.messagesReceived ?? 0) * 3 +
          (right.analytics?.offersReceived ?? 0) * 5 +
          Math.round(right.sellerRating * 5) +
          (right.featured ? 10 : 0) +
          (right.urgent ? 4 : 0);

        return rightScore - leftScore;
      })
      .slice(0, 6);
}

export async function getNewTodayFeed(userId?: string) {
  const currentUser = userId ? await getUserById(userId) : await getCurrentUser();
  const listings = await fetchActiveListings({
    pickupArea: currentUser?.profile.neighborhood,
    distance: currentUser?.profile.neighborhood ? "nearby" : undefined,
    sort: "newest",
    limit: 18
  });
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const fallbackThreshold = Date.now() - 1000 * 60 * 60 * 72;

  const primary = listings.filter(
    (listing) =>
      Date.parse(listing.createdAt) >= startOfDay.getTime() &&
      listing.sellerId !== currentUser?.id
  );

  if (primary.length >= 3) {
    return primary.slice(0, 6);
  }

  return listings
    .filter(
      (listing) =>
        Date.parse(listing.createdAt) >= fallbackThreshold &&
        listing.sellerId !== currentUser?.id
      )
    .slice(0, 6);
}

export async function getLastChanceFeed() {
  if (!isLiveMode) {
    return demoData.listings
      .filter((listing) => listing.status === "active" && (listing.urgent || listing.outlet))
      .sort(
        (left, right) =>
          Number(right.urgent) - Number(left.urgent) ||
          Date.parse(right.createdAt) - Date.parse(left.createdAt)
      )
      .slice(0, 6);
  }

  const listings = await fetchActiveListings({ sort: "newest", limit: 18 });

  return listings
    .filter((listing) => listing.urgent || listing.outlet)
    .sort((left, right) => {
      const leftScore =
        (left.urgent ? 20 : 0) +
        (left.outlet ? 10 : 0) +
        left.saveCount * 2 +
        Math.max(0, 18 - Math.round((Date.now() - Date.parse(left.createdAt)) / (1000 * 60 * 60 * 12)));
      const rightScore =
        (right.urgent ? 20 : 0) +
        (right.outlet ? 10 : 0) +
        right.saveCount * 2 +
        Math.max(0, 18 - Math.round((Date.now() - Date.parse(right.createdAt)) / (1000 * 60 * 60 * 12)));

      return rightScore - leftScore;
    })
    .slice(0, 6);
}

export async function getActiveSponsoredPlacements(location?: string) {
  if (!isLiveMode) {
    return demoData.sponsoredPlacements.filter(
      (placement) => placement.active && (!location || placement.location === location)
    );
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("sponsored_placements")
    .select("id, name, label, location, copy, cta, href, active")
    .eq("active", true);

  if (location) {
    query = query.eq("location", location);
  }

  const { data } = await query.order("updated_at", { ascending: false });

  return (((data as SponsoredPlacement[] | null) ?? [])).map((placement) => ({
    ...placement
  }));
}

export async function getAllowedEmailDomains() {
  if (!isLiveMode) {
    return demoData.allowedEmailDomains;
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("allowed_email_domains")
    .select("id, domain, university_id, auto_verify")
    .order("domain", { ascending: true });

  return (((data as unknown as DbAllowedEmailDomainRow[] | null) ?? [])).map(
    (row): AllowedEmailDomain => ({
      id: row.id,
      domain: row.domain,
      universityId: row.university_id,
      autoVerify: row.auto_verify
    })
  );
}
