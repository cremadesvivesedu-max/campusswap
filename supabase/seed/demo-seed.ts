import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { demoData } from "../../src/lib/demo-data";
import { env } from "../../src/lib/env";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRole);

function stableUuid(key: string) {
  const hash = createHash("sha1").update(key).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

async function getOrCreateAuthUser(user: (typeof demoData.users)[number]) {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error(error.message);
  }

  const existing = data.users.find((candidate) => candidate.email === user.email);
  const password =
    user.role === "admin" ? env.DEMO_ADMIN_PASSWORD : env.DEMO_USER_PASSWORD;

  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      email: user.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: user.profile.fullName,
        university: user.profile.university,
        student_status: user.profile.studentStatus,
        neighborhood: user.profile.neighborhood,
        bio: user.profile.bio
      }
    });

    return existing.id;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: user.profile.fullName,
      university: user.profile.university,
      student_status: user.profile.studentStatus,
      neighborhood: user.profile.neighborhood,
      bio: user.profile.bio
    }
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? `Unable to create auth user for ${user.email}.`);
  }

  return created.user.id;
}

async function main() {
  const userIdMap = new Map<string, string>();

  for (const user of demoData.users) {
    const authUserId = await getOrCreateAuthUser(user);
    userIdMap.set(user.id, authUserId);
  }

  const universityIdMap = new Map(
    demoData.universities.map((item) => [item.id, stableUuid(`university:${item.id}`)])
  );
  const categoryIdMap = new Map(
    demoData.categories.map((item) => [item.slug, stableUuid(`category:${item.slug}`)])
  );
  const listingIdMap = new Map(
    demoData.listings.map((item) => [item.id, stableUuid(`listing:${item.id}`)])
  );

  await supabase.from("universities").upsert(
    demoData.universities.map((item) => ({
      id: universityIdMap.get(item.id),
      name: item.name,
      city: item.city,
      is_target: item.isTarget
    }))
  );

  await supabase.from("allowed_email_domains").upsert(
    demoData.allowedEmailDomains.map((item) => ({
      id: stableUuid(`allowed-domain:${item.id}`),
      university_id: universityIdMap.get(item.universityId),
      domain: item.domain,
      auto_verify: item.autoVerify
    }))
  );

  await supabase.from("university_verification_rules").upsert(
    demoData.verificationRules.map((item) => ({
      id: stableUuid(`verification-rule:${item.id}`),
      university_id: universityIdMap.get(item.universityId),
      require_email_otp: item.requireEmailOtp,
      block_posting_until_verified: item.blockPostingUntilVerified,
      block_messaging_until_verified: item.blockMessagingUntilVerified,
      notes: item.notes
    }))
  );

  await supabase.from("users").upsert(
    demoData.users.map((item) => ({
      id: userIdMap.get(item.id),
      email: item.email,
      role: item.role,
      verification_status: item.verificationStatus,
      avatar_url: item.avatar,
      joined_at: item.joinedAt,
      last_seen_at: item.lastSeenAt
    }))
  );

  await supabase.from("profiles").upsert(
    demoData.users.map((item) => ({
      user_id: userIdMap.get(item.id),
      full_name: item.profile.fullName,
      university: item.profile.university,
      student_status: item.profile.studentStatus,
      neighborhood: item.profile.neighborhood,
      bio: item.profile.bio,
      preferred_categories: item.profile.preferredCategories,
      buyer_intent: item.profile.buyerIntent,
      seller_intent: item.profile.sellerIntent,
      notification_preferences: item.profile.notificationPreferences,
      rating_average: item.profile.ratingAverage,
      review_count: item.profile.reviewCount,
      response_rate: item.profile.responseRate,
      verified_badge: item.profile.verifiedBadge
    }))
  );

  await supabase.from("categories").upsert(
    demoData.categories.map((item) => ({
      id: categoryIdMap.get(item.slug),
      slug: item.slug,
      name: item.name,
      short_description: item.shortDescription,
      hero_description: item.heroDescription,
      color: item.color,
      typical_price_range: item.typicalPriceRange
    }))
  );

  await supabase.from("listings").upsert(
    demoData.listings.map((item) => ({
      id: listingIdMap.get(item.id),
      seller_id: userIdMap.get(item.sellerId),
      category_id: categoryIdMap.get(item.categorySlug),
      title: item.title,
      description: item.description,
      condition: item.condition,
      price: item.price,
      negotiable: item.negotiable,
      location: item.location,
      pickup_area: item.pickupArea,
      status: item.status,
      outlet: item.outlet,
      featured: item.featured,
      urgent: item.urgent,
      view_count: item.viewCount,
      save_count: item.saveCount,
      tags: item.tags,
      created_at: item.createdAt,
      updated_at: item.createdAt
    }))
  );

  await supabase.from("listing_images").upsert(
    demoData.listings.flatMap((listing) =>
      listing.images.map((image, index) => ({
        id: stableUuid(`listing-image:${image.id}`),
        listing_id: listingIdMap.get(listing.id),
        url: image.url,
        alt: image.alt,
        is_primary: index === 0 || image.isPrimary
      }))
    )
  );

  await supabase.from("favorites").upsert(
    demoData.favorites.map((favorite) => ({
      user_id: userIdMap.get(favorite.userId),
      listing_id: listingIdMap.get(favorite.listingId)
    }))
  );

  await supabase.from("view_events").upsert(
    demoData.viewEvents.map((event) => ({
      id: stableUuid(`view-event:${event.userId}:${event.listingId}:${event.viewedAt}`),
      user_id: userIdMap.get(event.userId),
      listing_id: listingIdMap.get(event.listingId),
      viewed_at: event.viewedAt
    }))
  );

  await supabase.from("search_events").upsert(
    demoData.searchEvents.map((event) => ({
      id: stableUuid(`search-event:${event.userId}:${event.query}:${event.createdAt}`),
      user_id: userIdMap.get(event.userId),
      query: event.query,
      category_slug: event.categorySlug,
      created_at: event.createdAt
    }))
  );

  await supabase.from("recommendation_events").upsert(
    demoData.recommendationEvents.map((event, index) => ({
      id: stableUuid(`recommendation-event:${index}:${event.userId}:${event.listingId}`),
      user_id: userIdMap.get(event.userId),
      listing_id: listingIdMap.get(event.listingId),
      score: event.score,
      reason: event.reason
    }))
  );

  await supabase.from("conversations").upsert(
    demoData.conversations.map((conversation) => {
      const latestMessage = conversation.messages[conversation.messages.length - 1];
      const sellerUnreadCount =
        latestMessage?.senderId === conversation.buyerId ? conversation.unreadCount : 0;
      const buyerUnreadCount =
        latestMessage?.senderId === conversation.sellerId ? conversation.unreadCount : 0;

      return {
        id: stableUuid(`conversation:${conversation.id}`),
        listing_id: listingIdMap.get(conversation.listingId),
        buyer_id: userIdMap.get(conversation.buyerId),
        seller_id: userIdMap.get(conversation.sellerId),
        blocked_by: conversation.blockedBy
          ? userIdMap.get(conversation.blockedBy)
          : null,
        unread_count: conversation.unreadCount,
        buyer_unread_count: buyerUnreadCount,
        seller_unread_count: sellerUnreadCount,
        quick_actions: conversation.quickActions
      };
    })
  );

  await supabase.from("messages").upsert(
    demoData.conversations.flatMap((conversation) =>
      conversation.messages.map((message) => ({
        id: stableUuid(`message:${message.id}`),
        conversation_id: stableUuid(`conversation:${conversation.id}`),
        sender_id: userIdMap.get(message.senderId),
        text: message.text,
        read: message.read,
        sent_at: message.sentAt
      }))
    )
  );

  await supabase.from("transactions").upsert(
    demoData.transactions.map((transaction) => ({
      id: stableUuid(`transaction:${transaction.id}`),
      listing_id: listingIdMap.get(transaction.listingId),
      buyer_id: userIdMap.get(transaction.buyerId),
      seller_id: userIdMap.get(transaction.sellerId),
      state: transaction.state,
      meetup_spot: transaction.meetupSpot,
      meetup_window: transaction.meetupWindow,
      completed_at: transaction.completedAt ?? null
    }))
  );

  await supabase.from("reviews").upsert(
    demoData.reviews.map((review) => ({
      id: stableUuid(`review:${review.id}`),
      transaction_id: stableUuid(`transaction:${review.transactionId}`),
      author_id: userIdMap.get(review.authorId),
      target_user_id: userIdMap.get(review.targetUserId),
      rating: review.rating,
      text: review.text,
      created_at: review.createdAt
    }))
  );

  await supabase.from("reports").upsert(
    demoData.reports.map((report) => ({
      id: stableUuid(`report:${report.id}`),
      reporter_id: userIdMap.get(report.reporterId),
      target_type: report.targetType,
      target_id:
        report.targetType === "listing"
          ? listingIdMap.get(report.targetId)
          : report.targetType === "user"
            ? userIdMap.get(report.targetId)
            : stableUuid(`conversation:${report.targetId}`),
      status: report.status,
      reason: report.reason,
      created_at: report.createdAt
    }))
  );

  await supabase.from("moderation_actions").upsert(
    demoData.moderationActions.map((action) => ({
      id: stableUuid(`moderation-action:${action.id}`),
      report_id: stableUuid(`report:${action.reportId}`),
      actor_id: userIdMap.get(action.actorId),
      action: action.action,
      created_at: action.createdAt
    }))
  );

  await supabase.from("sponsored_placements").upsert(
    demoData.sponsoredPlacements.map((item) => ({
      id: stableUuid(`sponsor:${item.id}`),
      name: item.name,
      label: item.label,
      location: item.location,
      copy: item.copy,
      cta: item.cta,
      href: item.href,
      active: item.active
    }))
  );

  await supabase.from("promotion_purchases").upsert(
    demoData.promotionPurchases.map((item) => ({
      id: stableUuid(`promotion-purchase:${item.id}`),
      listing_id: listingIdMap.get(item.listingId),
      seller_id: userIdMap.get(item.sellerId),
      type: item.type,
      amount: item.amount,
      active: item.active,
      created_at: item.createdAt
    }))
  );

  await supabase.from("notifications").upsert(
    demoData.notifications.map((item) => ({
      id: stableUuid(`notification:${item.id}`),
      user_id: userIdMap.get(item.userId),
      type: item.type,
      title: item.title,
      body: item.body,
      read: item.read,
      created_at: item.createdAt
    }))
  );

  await supabase.from("waitlist_leads").upsert(
    demoData.waitlistLeads.map((item) => ({
      id: stableUuid(`waitlist:${item.id}`),
      email: item.email,
      intent: item.intent,
      created_at: item.createdAt
    }))
  );

  await supabase.from("content_blocks").upsert(
    demoData.contentBlocks.map((item) => ({
      id: stableUuid(`content-block:${item.id}`),
      key: item.key,
      type: item.type,
      title: item.title,
      body: item.body,
      cta: item.cta
    }))
  );

  await supabase.from("pricing_settings").upsert(
    demoData.pricingSettings.map((item) => ({
      id: stableUuid(`pricing-setting:${item.id}`),
      module: item.module,
      label: item.label,
      value: item.value,
      unit: item.unit,
      active: item.active
    }))
  );

  await supabase.from("audit_logs").upsert(
    demoData.auditLogs.map((item) => ({
      id: stableUuid(`audit-log:${item.id}`),
      actor_id: userIdMap.get(item.actorId),
      entity: item.entity,
      entity_id:
        listingIdMap.get(item.entityId) ??
        stableUuid(`entity:${item.entity}:${item.entityId}`),
      action: item.action,
      created_at: item.createdAt
    }))
  );

  console.log("CampusSwap Supabase seed complete.");
  console.log("");
  console.log("Demo accounts:");
  console.log(`- Omar: ${demoData.users[1]?.email} / ${env.DEMO_USER_PASSWORD}`);
  console.log(`- Lina: ${demoData.users[0]?.email} / ${env.DEMO_USER_PASSWORD}`);
  console.log(`- Sanne: ${demoData.users[2]?.email} / ${env.DEMO_USER_PASSWORD}`);
  console.log(`- Mila: ${demoData.users[3]?.email} / ${env.DEMO_USER_PASSWORD}`);
  console.log(`- Admin: ${demoData.users[4]?.email} / ${env.DEMO_ADMIN_PASSWORD}`);
}

void main();
