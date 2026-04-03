import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthUser } from "@/lib/auth/server";
import { demoCurrentUserId, demoData } from "@/lib/demo-data";
import { isLiveMode } from "@/lib/env";
import { filterListings, type DiscoveryFilters } from "@/features/search/discovery";
import { recommendListingsForUser as recommendDemoListings } from "@/server/services/recommendations";
import { searchListings as searchDemoListings } from "@/server/services/search";
import type {
  AllowedEmailDomain,
  Category,
  Conversation,
  Listing,
  ListingCondition,
  ListingSearchInput,
  Notification,
  Profile,
  RecommendationBreakdown,
  Review,
  SponsoredPlacement,
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
  status: Listing["status"];
  outlet: boolean;
  featured: boolean;
  urgent: boolean;
  view_count: number;
  save_count: number;
  tags: string[] | null;
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
  meetup_spot: string;
  meetup_window: string;
  completed_at: string | null;
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
  read: boolean;
  created_at: string;
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
  status,
  outlet,
  featured,
  urgent,
  view_count,
  save_count,
  tags,
  created_at,
  updated_at,
  listing_images (
    id,
    url,
    alt,
    is_primary
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

function mapUser(row: DbUserWithProfile): User {
  const profile = row.profile;

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
    }
  };
}

function mapListing(
  row: DbListingWithRelations,
  options?: {
    savedListingIds?: Set<string>;
  }
): Listing {
  const images = [...(row.listing_images ?? [])].sort((left, right) =>
    Number(right.is_primary) - Number(left.is_primary)
  );

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
    outlet: row.outlet,
    featured: row.featured,
    urgent: row.urgent,
    status: row.status,
    createdAt: row.created_at,
    freshnessLabel: getFreshnessLabel(row.created_at, row.status, row.outlet),
    sellerId: row.seller_id,
    sellerRating: numberValue(row.seller?.profile?.rating_average),
    sellerResponseRate: numberValue(row.seller?.profile?.response_rate),
    viewCount: row.view_count,
    saveCount: row.save_count,
    isSaved: options?.savedListingIds?.has(row.id) ?? false,
    tags: row.tags ?? [],
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
    state: row.state,
    meetupSpot: row.meetup_spot,
    meetupWindow: row.meetup_window,
    completedAt: row.completed_at ?? undefined
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
    read: row.read,
    createdAt: row.created_at
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

async function fetchListingRows(input: ListingSearchInput & { includeStatuses?: Listing["status"][] } = {}) {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    return [];
  }

  let query = supabase.from("listings").select(listingSelect);
  const visibleStatuses =
    input.includeStatuses ?? ["active", "reserved"];

  query = query.in("status", visibleStatuses);

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

  const { data } = await query.limit(60);
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

  const listings = rows.map((row) => mapListing(row, { savedListingIds }));
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

  if (existing) {
    return existing;
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return null;
  }

  const email = authUser.email ?? "";
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const { data: allowedDomain } = await admin
    .from("allowed_email_domains")
    .select("id, domain, university_id, auto_verify")
    .eq("domain", domain)
    .maybeSingle();

  const verificationStatus: VerificationStatus = allowedDomain?.auto_verify
    ? "verified"
    : "pending";
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

  return mapUser(row);
}

export async function getUserById(userId: string) {
  if (!isLiveMode) {
    return demoData.users.find((user) => user.id === userId);
  }

  const row = await fetchUserRowById(userId);
  return row ? mapUser(row) : undefined;
}

export async function getFeaturedListings() {
  if (!isLiveMode) {
    return demoData.listings.filter(
      (listing) => listing.featured && listing.status === "active"
    );
  }

  return fetchActiveListings({ featured: true, sort: "recommended" });
}

export async function getOutletListings() {
  if (!isLiveMode) {
    return demoData.listings.filter(
      (listing) => listing.outlet && listing.status === "active"
    );
  }

  return fetchActiveListings({ outlet: true, sort: "recommended" });
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
  return rows
    .map((row) => row.listing)
    .filter((listing): listing is DbListingWithRelations => Boolean(listing))
    .map((listing) => mapListing(listing, { savedListingIds: new Set([listing.id]) }));
}

export async function getListingById(id: string) {
  if (!isLiveMode) {
    return demoData.listings.find((listing) => listing.id === id);
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

  return mapListing(row, { savedListingIds });
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
      "id, listing_id, buyer_id, seller_id, state, meetup_spot, meetup_window, completed_at"
    )
    .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
    .order("updated_at", { ascending: false });

  return ((data as unknown as DbTransactionRow[] | null) ?? []).map(mapTransaction);
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

  const { data } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, read, created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  return ((data as unknown as DbNotificationRow[] | null) ?? []).map(mapNotification);
}

export async function getListingsForSeller(userId: string) {
  if (!isLiveMode) {
    return demoData.listings.filter((listing) => listing.sellerId === userId);
  }

  const rows = await fetchListingRows({
    includeStatuses: ["active", "reserved", "sold", "archived", "pending-review", "hidden"]
  });

  return rows.filter((row) => row.seller_id === userId).map((row) => mapListing(row));
}

export async function getHomeFeed() {
  return fetchActiveListings({ sort: "recommended" });
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
    fetchListingRows({ sort: "recommended" }),
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
