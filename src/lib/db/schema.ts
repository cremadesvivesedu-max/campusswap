import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["student", "moderator", "admin"]);
export const verificationStatusEnum = pgEnum("verification_status", ["unverified", "pending", "verified"]);
export const listingConditionEnum = pgEnum("listing_condition", ["new", "like-new", "good", "fair", "needs-love"]);
export const listingStatusEnum = pgEnum("listing_status", ["active", "reserved", "sold", "archived", "pending-review", "hidden"]);
export const exchangeStatusEnum = pgEnum("exchange_status", ["inquiry", "negotiating", "reserved", "completed", "cancelled", "reported"]);
export const reportTargetTypeEnum = pgEnum("report_target_type", ["listing", "user", "conversation"]);
export const reportStatusEnum = pgEnum("report_status", ["open", "in-review", "actioned", "dismissed"]);
export const promotionTypeEnum = pgEnum("promotion_type", ["featured", "seller-boost"]);
export const notificationTypeEnum = pgEnum("notification_type", ["message", "promotion", "review", "listing", "safety", "system"]);
export const contentBlockTypeEnum = pgEnum("content_block_type", ["hero", "faq", "trust", "testimonial", "footer", "seo"]);
export const monetizationModuleEnum = pgEnum("monetization_module", ["promoted-listings", "seller-boost", "sponsor-cards", "commission-ready"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const universities = pgTable("universities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 160 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  isTarget: boolean("is_target").default(false).notNull(),
  ...timestamps
});

export const allowedEmailDomains = pgTable("allowed_email_domains", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  universityId: uuid("university_id").references(() => universities.id).notNull(),
  domain: varchar("domain", { length: 160 }).notNull(),
  autoVerify: boolean("auto_verify").default(true).notNull(),
  ...timestamps
}, (table) => ({ domainIdx: index("allowed_domains_domain_idx").on(table.domain) }));

export const universityVerificationRules = pgTable("university_verification_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  universityId: uuid("university_id").references(() => universities.id).notNull(),
  requireEmailOtp: boolean("require_email_otp").default(true).notNull(),
  blockPostingUntilVerified: boolean("block_posting_until_verified").default(false).notNull(),
  blockMessagingUntilVerified: boolean("block_messaging_until_verified").default(false).notNull(),
  notes: text("notes").notNull(),
  ...timestamps
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("student").notNull(),
  verificationStatus: verificationStatusEnum("verification_status").default("unverified").notNull(),
  avatarUrl: text("avatar_url"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  ...timestamps
}, (table) => ({ emailIdx: index("users_email_idx").on(table.email) }));

export const profiles = pgTable("profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  university: varchar("university", { length: 160 }).notNull(),
  studentStatus: varchar("student_status", { length: 30 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 120 }).notNull(),
  bio: text("bio").notNull(),
  preferredCategories: jsonb("preferred_categories").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  buyerIntent: boolean("buyer_intent").default(true).notNull(),
  sellerIntent: boolean("seller_intent").default(false).notNull(),
  notificationPreferences: jsonb("notification_preferences").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  ratingAverage: numeric("rating_average", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  responseRate: numeric("response_rate", { precision: 4, scale: 2 }).default("0").notNull(),
  verifiedBadge: boolean("verified_badge").default(false).notNull(),
  ...timestamps
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 120 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  shortDescription: text("short_description").notNull(),
  heroDescription: text("hero_description").notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  typicalPriceRange: varchar("typical_price_range", { length: 40 }).notNull(),
  ...timestamps
}, (table) => ({ slugIdx: index("categories_slug_idx").on(table.slug) }));

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: uuid("seller_id").references(() => users.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  condition: listingConditionEnum("condition").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  negotiable: boolean("negotiable").default(false).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  pickupArea: varchar("pickup_area", { length: 160 }).notNull(),
  status: listingStatusEnum("status").default("active").notNull(),
  outlet: boolean("outlet").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  urgent: boolean("urgent").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  saveCount: integer("save_count").default(0).notNull(),
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  ...timestamps
}, (table) => ({ searchIdx: index("listings_status_category_idx").on(table.status, table.categoryId) }));

export const listingImages = pgTable("listing_images", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  url: text("url").notNull(),
  alt: text("alt").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  ...timestamps
});

export const listingTags = pgTable("listing_tags", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  ...timestamps
});

export const favorites = pgTable("favorites", {
  userId: uuid("user_id").references(() => users.id).notNull(),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const viewEvents = pgTable("view_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull()
});

export const searchEvents = pgTable("search_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  query: text("query").notNull(),
  categorySlug: varchar("category_slug", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const recommendationEvents = pgTable("recommendation_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  score: numeric("score", { precision: 10, scale: 2 }).notNull(),
  reason: jsonb("reason").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  buyerId: uuid("buyer_id").references(() => users.id).notNull(),
  sellerId: uuid("seller_id").references(() => users.id).notNull(),
  blockedBy: uuid("blocked_by").references(() => users.id),
  unreadCount: integer("unread_count").default(0).notNull(),
  buyerUnreadCount: integer("buyer_unread_count").default(0).notNull(),
  sellerUnreadCount: integer("seller_unread_count").default(0).notNull(),
  quickActions: jsonb("quick_actions").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  ...timestamps
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").references(() => conversations.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  read: boolean("read").default(false).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull()
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  buyerId: uuid("buyer_id").references(() => users.id).notNull(),
  sellerId: uuid("seller_id").references(() => users.id).notNull(),
  state: exchangeStatusEnum("state").default("inquiry").notNull(),
  meetupSpot: text("meetup_spot").notNull(),
  meetupWindow: text("meetup_window").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: uuid("transaction_id").references(() => transactions.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  targetUserId: uuid("target_user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: uuid("reporter_id").references(() => users.id).notNull(),
  targetType: reportTargetTypeEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  status: reportStatusEnum("status").default("open").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const moderationActions = pgTable("moderation_actions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: uuid("report_id").references(() => reports.id).notNull(),
  actorId: uuid("actor_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const sponsoredPlacements = pgTable("sponsored_placements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 160 }).notNull(),
  label: varchar("label", { length: 80 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  copy: text("copy").notNull(),
  cta: varchar("cta", { length: 80 }).notNull(),
  href: text("href").notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps
});

export const promotionPurchases = pgTable("promotion_purchases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  sellerId: uuid("seller_id").references(() => users.id).notNull(),
  type: promotionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const waitlistLeads = pgTable("waitlist_leads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull(),
  intent: varchar("intent", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const contentBlocks = pgTable("content_blocks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 120 }).notNull(),
  type: contentBlockTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  cta: varchar("cta", { length: 160 }),
  ...timestamps
});

export const pricingSettings = pgTable("pricing_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  module: monetizationModuleEnum("module").notNull(),
  label: varchar("label", { length: 160 }).notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: uuid("actor_id").references(() => users.id).notNull(),
  entity: varchar("entity", { length: 120 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  action: varchar("action", { length: 160 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
