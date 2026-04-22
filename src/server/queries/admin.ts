import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoAdminUserId, demoData } from "@/lib/demo-data";
import { isLiveMode } from "@/lib/env";
import { getCurrentUser } from "@/server/queries/marketplace";
import type {
  AllowedEmailDomain,
  Category,
  ContentBlock,
  PricingSetting,
  Report,
  SponsoredPlacement,
  SupportTicket,
  User,
  UniversityVerificationRule
} from "@/types/domain";

interface DbMetricCountRow {
  count: number;
}

interface DbUserAdminRow {
  id: string;
  email: string;
  role: User["role"];
  verification_status: User["verificationStatus"];
  avatar_url: string | null;
  joined_at: string;
  last_seen_at: string | null;
  profile: {
    user_id: string;
    full_name: string;
    university: string;
    student_status: User["profile"]["studentStatus"];
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
  } | null;
}

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

async function safeCount(
  queryFactory: () => any
) {
  try {
    const result = await queryFactory();
    return result.error ? 0 : (result.count ?? 0);
  } catch {
    return 0;
  }
}

function mapAdminUser(row: DbUserAdminRow): User {
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
      fullName: row.profile?.full_name ?? "CampusSwap user",
      university: row.profile?.university ?? "CampusSwap",
      studentStatus: row.profile?.student_status ?? "current",
      neighborhood: row.profile?.neighborhood ?? "Maastricht",
      bio: row.profile?.bio ?? "",
      preferredCategories: row.profile?.preferred_categories ?? [],
      buyerIntent: row.profile?.buyer_intent ?? true,
      sellerIntent: row.profile?.seller_intent ?? false,
      notificationPreferences: row.profile?.notification_preferences ?? [],
      ratingAverage: numberValue(row.profile?.rating_average),
      reviewCount: row.profile?.review_count ?? 0,
      responseRate: numberValue(row.profile?.response_rate),
      verifiedBadge: row.profile?.verified_badge ?? false
    }
  };
}

async function requireAdminAccess() {
  const user = await getCurrentUser();

  if (user.role !== "admin") {
    redirect("/app");
  }

  return user;
}

export async function getAdminUser() {
  if (!isLiveMode) {
    return (
      demoData.users.find((user) => user.id === demoAdminUserId) ?? demoData.users[0]
    );
  }

  return requireAdminAccess();
}

export async function getAdminMetrics() {
  if (!isLiveMode) {
    const users = demoData.users.filter((user) => user.role === "student");
    const listings = demoData.listings;
    const completedTransactions = demoData.transactions.filter(
      (transaction) => transaction.state === "completed"
    );
    const promotedRevenue = demoData.promotionPurchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    return {
      totalUsers: users.length,
      verifiedUsers: users.filter((user) => user.verificationStatus === "verified").length,
      signupsLast7Days: 0,
      loginsLast7Days: 0,
      listingsCreatedLast7Days: 0,
      checkoutsStartedLast7Days: 0,
      checkoutsCompletedLast7Days: 0,
      supportTicketsLast7Days: 0,
      capturedErrorsLast7Days: 0,
      newUsersThisWeek: 3,
      activeListings: listings.filter((listing) => listing.status === "active").length,
      soldListings: listings.filter((listing) => listing.status === "sold").length,
      featuredListings: listings.filter((listing) => listing.featured).length,
      outletListings: listings.filter((listing) => listing.outlet).length,
      conversationsStarted: demoData.conversations.length,
      responseRate: 0.94,
      reviewCount: demoData.reviews.length,
      averageRating: 4.85,
      topCategories: ["Furniture", "Bikes", "Electronics"],
      topSearchTerms: ["bike", "desk", "monitor"],
      gmvEstimate: completedTransactions.reduce((sum, transaction) => {
        const listing = demoData.listings.find(
          (candidate) => candidate.id === transaction.listingId
        );
        return sum + (listing?.price ?? 0);
      }, 0),
      promotedRevenue,
      sponsorshipRevenue: 150,
      landingToSignup: 0.07,
      signupToListing: 0.23,
      listingToCompletedExchange: 0.31
    };
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured for admin analytics.");
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [
    signupsLast7Days,
    loginsLast7Days,
    listingsCreatedLast7Days,
    checkoutsStartedLast7Days,
    checkoutsCompletedLast7Days,
    supportTicketsLast7Days,
    capturedErrorsLast7Days
  ] = await Promise.all([
    safeCount(() =>
      supabase
        .from("app_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "signup")
        .gte("created_at", sevenDaysAgo)
    ),
    safeCount(() =>
      supabase
        .from("app_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "login")
        .gte("created_at", sevenDaysAgo)
    ),
    safeCount(() =>
      supabase
        .from("app_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "listing_created")
        .gte("created_at", sevenDaysAgo)
    ),
    safeCount(() =>
      supabase
        .from("app_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "checkout_started")
        .gte("created_at", sevenDaysAgo)
    ),
    safeCount(() =>
      supabase
        .from("app_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "checkout_completed")
        .gte("created_at", sevenDaysAgo)
    ),
    safeCount(() =>
      supabase
        .from("app_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "support_ticket_created")
        .gte("created_at", sevenDaysAgo)
    ),
    safeCount(() =>
      supabase
        .from("app_error_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo)
    )
  ]);

  const [
    usersResult,
    verifiedUsersResult,
    activeListingsResult,
    soldListingsResult,
    featuredListingsResult,
    outletListingsResult,
    conversationsResult,
    reviewsResult,
    promotionRows,
    sponsorshipRows,
    searchRows,
    listingRows,
    transactionRows
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("verification_status", "verified"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "sold"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("featured", true),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("outlet", true),
    supabase.from("conversations").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("promotion_purchases").select("amount, active, status"),
    supabase.from("sponsored_placements").select("id").eq("active", true),
    supabase.from("search_events").select("query").order("created_at", { ascending: false }).limit(200),
    supabase.from("listings").select("id, price, category:categories(name)"),
    supabase.from("transactions").select("state, listing_id")
  ]);

  const ratingRows = await supabase.from("profiles").select("rating_average, response_rate");

  const promotedRevenue = (
    ((promotionRows.data as { amount: number | string; active: boolean; status?: string }[] | null) ??
      [])
  ).reduce(
    (sum, row) =>
      row.active || row.status === "paid" ? sum + numberValue(row.amount) : sum,
    0
  );

  const searchCounts = new Map<string, number>();
  for (const row of (searchRows.data as { query: string }[] | null) ?? []) {
    const key = row.query.trim().toLowerCase();
    if (!key) {
      continue;
    }

    searchCounts.set(key, (searchCounts.get(key) ?? 0) + 1);
  }

  const categoryCounts = new Map<string, number>();
  for (const row of (listingRows.data as { category: { name: string } | null }[] | null) ?? []) {
    const key = row.category?.name;
    if (!key) {
      continue;
    }

    categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
  }

  const completedTransactions = ((transactionRows.data as { state: string; listing_id: string }[] | null) ?? []).filter(
    (row) => row.state === "completed"
  );
  const listingPrices = new Map<string, number>();
  for (const row of (listingRows.data as { price: number | string; id?: string }[] | null) ?? []) {
    if ("id" in row && typeof row.id === "string") {
      listingPrices.set(row.id, numberValue(row.price));
    }
  }

  const ratingValues = (ratingRows.data as { rating_average: number | string; response_rate: number | string }[] | null) ?? [];
  const averageRating =
    ratingValues.length > 0
      ? ratingValues.reduce((sum, row) => sum + numberValue(row.rating_average), 0) /
        ratingValues.length
      : 0;
  const responseRate =
    ratingValues.length > 0
      ? ratingValues.reduce((sum, row) => sum + numberValue(row.response_rate), 0) /
        ratingValues.length
      : 0;

  return {
    totalUsers: usersResult.count ?? 0,
    verifiedUsers: verifiedUsersResult.count ?? 0,
    signupsLast7Days,
    loginsLast7Days,
    listingsCreatedLast7Days,
    checkoutsStartedLast7Days,
    checkoutsCompletedLast7Days,
    supportTicketsLast7Days,
    capturedErrorsLast7Days,
    newUsersThisWeek: 0,
    activeListings: activeListingsResult.count ?? 0,
    soldListings: soldListingsResult.count ?? 0,
    featuredListings: featuredListingsResult.count ?? 0,
    outletListings: outletListingsResult.count ?? 0,
    conversationsStarted: conversationsResult.count ?? 0,
    responseRate,
    reviewCount: reviewsResult.count ?? 0,
    averageRating,
    topCategories: [...categoryCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([name]) => name),
    topSearchTerms: [...searchCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([term]) => term),
    gmvEstimate: completedTransactions.reduce(
      (sum, row) => sum + (listingPrices.get(row.listing_id) ?? 0),
      0
    ),
    promotedRevenue,
    sponsorshipRevenue: (((sponsorshipRows.data as DbMetricCountRow[] | null) ?? [])).length * 150,
    landingToSignup: 0,
    signupToListing: 0,
    listingToCompletedExchange: 0
  };
}

export async function getAdminUsers() {
  if (!isLiveMode) {
    return demoData.users;
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
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
    .order("joined_at", { ascending: false });

  return (((data as unknown as DbUserAdminRow[] | null) ?? [])).map(mapAdminUser);
}

export async function getAdminListings() {
  if (!isLiveMode) {
    return demoData.listings;
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        status,
        featured,
        outlet,
        category:categories (slug)
      `
    )
    .order("updated_at", { ascending: false });

  return (
    (data as {
      id: string;
      title: string;
      status: string;
      featured: boolean;
      outlet: boolean;
      category: { slug: string } | null;
    }[] | null) ?? []
  ).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    categorySlug: row.category?.slug ?? "unknown",
    featured: row.featured,
    outlet: row.outlet
  }));
}

export async function getAdminReports() {
  if (!isLiveMode) {
    return demoData.reports;
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("reports")
    .select("id, reporter_id, target_type, target_id, status, reason, created_at")
    .order("created_at", { ascending: false });

  return (
    (data as {
      id: string;
      reporter_id: string;
      target_type: Report["targetType"];
      target_id: string;
      status: Report["status"];
      reason: string;
      created_at: string;
    }[] | null) ?? []
  ).map(
    (row): Report => ({
      id: row.id,
      reporterId: row.reporter_id,
      targetType: row.target_type,
      targetId: row.target_id,
      status: row.status,
      reason: row.reason,
      createdAt: row.created_at
    })
  );
}

export async function getAdminSupportTickets() {
  if (!isLiveMode) {
    return demoData.supportTickets;
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("support_tickets")
    .select(
      "id, user_id, type, status, subject, details, listing_id, conversation_id, transaction_id, target_user_id, admin_note, created_at, updated_at"
    )
    .order("updated_at", { ascending: false });

  return (
    (data as {
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
    }[] | null) ?? []
  ).map(
    (row): SupportTicket => ({
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
    })
  );
}

export async function getAdminCategories() {
  if (!isLiveMode) {
    return demoData.categories;
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("categories")
    .select("id, slug, name, short_description, hero_description, color, typical_price_range")
    .order("name", { ascending: true });

  return (
    (data as {
      id: string;
      slug: string;
      name: string;
      short_description: string;
      hero_description: string;
      color: string;
      typical_price_range: string;
    }[] | null) ?? []
  ).map(
    (row): Category => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description,
      heroDescription: row.hero_description,
      color: row.color,
      typicalPriceRange: row.typical_price_range
    })
  );
}

export async function getAdminSponsors() {
  if (!isLiveMode) {
    return demoData.sponsoredPlacements;
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("sponsored_placements")
    .select("id, name, label, location, copy, cta, href, active")
    .order("updated_at", { ascending: false });

  return (((data as SponsoredPlacement[] | null) ?? [])).map((placement) => ({
    ...placement
  }));
}

export async function getAdminPricingSettings() {
  if (!isLiveMode) {
    return demoData.pricingSettings;
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("pricing_settings")
    .select("id, module, label, value, unit, active")
    .order("label", { ascending: true });

  return (
    (data as {
      id: string;
      module: PricingSetting["module"];
      label: string;
      value: number | string;
      unit: string;
      active: boolean;
    }[] | null) ?? []
  ).map(
    (row): PricingSetting => ({
      id: row.id,
      module: row.module,
      label: row.label,
      value: numberValue(row.value),
      unit: row.unit,
      active: row.active
    })
  );
}

export async function getAdminContentBlocks() {
  if (!isLiveMode) {
    return demoData.contentBlocks;
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("content_blocks")
    .select("id, key, type, title, body, cta")
    .order("key", { ascending: true });

  return (
    (data as {
      id: string;
      key: string;
      type: ContentBlock["type"];
      title: string;
      body: string;
      cta: string | null;
    }[] | null) ?? []
  ).map(
    (row): ContentBlock => ({
      id: row.id,
      key: row.key,
      type: row.type,
      title: row.title,
      body: row.body,
      cta: row.cta ?? undefined
    })
  );
}

export async function getAdminSettingsData() {
  if (!isLiveMode) {
    return {
      domains: demoData.allowedEmailDomains,
      rules: demoData.verificationRules
    };
  }

  await requireAdminAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      domains: [] as AllowedEmailDomain[],
      rules: [] as UniversityVerificationRule[]
    };
  }

  const [domainRows, ruleRows] = await Promise.all([
    supabase
      .from("allowed_email_domains")
      .select("id, domain, university_id, auto_verify")
      .order("domain", { ascending: true }),
    supabase
      .from("university_verification_rules")
      .select(
        "id, university_id, require_email_otp, block_posting_until_verified, block_messaging_until_verified, notes"
      )
      .order("created_at", { ascending: true })
  ]);

  return {
    domains: (
      (domainRows.data as {
        id: string;
        domain: string;
        university_id: string;
        auto_verify: boolean;
      }[] | null) ?? []
    ).map(
      (row): AllowedEmailDomain => ({
        id: row.id,
        domain: row.domain,
        universityId: row.university_id,
        autoVerify: row.auto_verify
      })
    ),
    rules: (
      (ruleRows.data as {
        id: string;
        university_id: string;
        require_email_otp: boolean;
        block_posting_until_verified: boolean;
        block_messaging_until_verified: boolean;
        notes: string;
      }[] | null) ?? []
    ).map(
      (row): UniversityVerificationRule => ({
        id: row.id,
        universityId: row.university_id,
        requireEmailOtp: row.require_email_otp,
        blockPostingUntilVerified: row.block_posting_until_verified,
        blockMessagingUntilVerified: row.block_messaging_until_verified,
        notes: row.notes
      })
    )
  };
}
