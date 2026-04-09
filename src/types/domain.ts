export type UserRole = "student" | "moderator" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified";
export type ListingCondition = "new" | "like-new" | "good" | "fair" | "needs-love";
export type ListingStatus = "active" | "reserved" | "sold" | "archived" | "pending-review" | "hidden";
export type ExchangeStatus = "inquiry" | "negotiating" | "reserved" | "completed" | "cancelled" | "reported";
export type OfferStatus = "open" | "countered" | "accepted" | "rejected" | "expired" | "withdrawn";
export type ListingDistanceFilter = "same-area" | "nearby" | "citywide";
export type ReportTargetType = "listing" | "user" | "conversation";
export type ReportStatus = "open" | "in-review" | "actioned" | "dismissed";
export type PromotionType = "featured" | "seller-boost";
export type PromotionPurchaseStatus =
  | "pending"
  | "checkout_opened"
  | "paid"
  | "cancelled";
export type NotificationType = "message" | "promotion" | "review" | "listing" | "safety" | "system";
export type ContentBlockType = "hero" | "faq" | "trust" | "testimonial" | "footer" | "seo";
export type MonetizationModule = "promoted-listings" | "seller-boost" | "sponsor-cards" | "commission-ready";

export interface University {
  id: string;
  name: string;
  city: string;
  domains: string[];
  isTarget: boolean;
}

export interface AllowedEmailDomain {
  id: string;
  domain: string;
  universityId: string;
  autoVerify: boolean;
}

export interface UniversityVerificationRule {
  id: string;
  universityId: string;
  requireEmailOtp: boolean;
  blockPostingUntilVerified: boolean;
  blockMessagingUntilVerified: boolean;
  notes: string;
}

export interface Profile {
  userId: string;
  fullName: string;
  university: string;
  studentStatus: "incoming" | "current" | "outgoing" | "graduated";
  neighborhood: string;
  bio: string;
  preferredCategories: string[];
  buyerIntent: boolean;
  sellerIntent: boolean;
  notificationPreferences: string[];
  ratingAverage: number;
  reviewCount: number;
  responseRate: number;
  verifiedBadge: boolean;
}

export interface SellerTrustMetrics {
  salesCount: number;
  averageRating: number;
  reviewCount: number;
  responseRate: number;
  responseRateMethod: "conversation-reply-rate" | "profile-estimate";
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  avatar?: string;
  joinedAt: string;
  lastSeenAt: string;
  profile: Profile;
  sellerMetrics?: SellerTrustMetrics;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  heroDescription: string;
  color: string;
  typicalPriceRange: string;
}

export interface ListingImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  condition: ListingCondition;
  price: number;
  negotiable: boolean;
  location: string;
  pickupArea: string;
  outlet: boolean;
  featured: boolean;
  urgent: boolean;
  status: ListingStatus;
  createdAt: string;
  freshnessLabel: string;
  sellerId: string;
  sellerName?: string;
  sellerVerificationStatus?: VerificationStatus;
  sellerRating: number;
  sellerReviewCount?: number;
  sellerResponseRate: number;
  sellerSalesCount?: number;
  sellerJoinedAt?: string;
  viewCount: number;
  saveCount: number;
  isSaved?: boolean;
  tags: string[];
  images: ListingImage[];
  removedAt?: string;
}

export interface Favorite {
  userId: string;
  listingId: string;
}

export interface ViewEvent {
  userId: string;
  listingId: string;
  viewedAt: string;
}

export interface SearchEvent {
  userId: string;
  query: string;
  categorySlug?: string;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  priceMin?: number;
  priceMax?: number;
  conditions: ListingCondition[];
  outletOnly: boolean;
  featuredOnly: boolean;
  minimumSellerRating?: number;
  pickupArea?: string;
  distance?: ListingDistanceFilter;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationEvent {
  userId: string;
  listingId: string;
  score: number;
  reason: string[];
}

export interface MessageAttachment {
  id: string;
  url: string;
  name: string;
  mimeType: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
  read: boolean;
  attachment?: MessageAttachment;
}

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  unreadCount: number;
  quickActions: string[];
  blockedBy?: string;
  messages: Message[];
}

export interface ConversationPreview {
  conversation: Conversation;
  listing: Listing;
  counterpart: User;
  latestMessage?: Message;
  unreadCount: number;
}

export interface ConversationThreadData {
  conversation: Conversation;
  listing: Listing;
  seller: User;
  buyer: User;
  messages: Message[];
  unreadCount: number;
  transaction?: Transaction;
  latestOffer?: ListingOffer;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  state: ExchangeStatus;
  amount: number;
  meetupSpot: string;
  meetupWindow: string;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
  reservedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
}

export interface ListingOffer {
  id: string;
  listingId: string;
  transactionId: string;
  conversationId: string;
  buyerId: string;
  sellerId: string;
  createdByUserId: string;
  parentOfferId?: string;
  amount: number;
  state: OfferStatus;
  expiresAt?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingTransactionContext {
  activeTransaction?: Transaction;
  viewerTransaction?: Transaction;
  latestOffer?: ListingOffer;
  reservedForCurrentUser: boolean;
  reservedForOtherBuyer: boolean;
  buyer?: User;
  seller?: User;
}

export interface SellerListingTransaction {
  transaction: Transaction;
  buyer: User;
}

export interface Review {
  id: string;
  transactionId: string;
  authorId: string;
  targetUserId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  status: ReportStatus;
  reason: string;
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  reportId: string;
  actorId: string;
  action: string;
  createdAt: string;
}

export interface SponsoredPlacement {
  id: string;
  name: string;
  label: string;
  location: string;
  copy: string;
  cta: string;
  href: string;
  active: boolean;
}

export interface PromotionPurchase {
  id: string;
  listingId: string;
  sellerId: string;
  type: PromotionType;
  amount: number;
  status: PromotionPurchaseStatus;
  active: boolean;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
  cancelledAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface WaitlistLead {
  id: string;
  email: string;
  intent: "buyer" | "seller" | "both";
  createdAt: string;
}

export interface ContentBlock {
  id: string;
  key: string;
  type: ContentBlockType;
  title: string;
  body: string;
  cta?: string;
}

export interface PricingSetting {
  id: string;
  module: MonetizationModule;
  label: string;
  value: number;
  unit: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  actorId: string;
  entity: string;
  entityId: string;
  action: string;
  createdAt: string;
}

export interface DemoDataBundle {
  universities: University[];
  allowedEmailDomains: AllowedEmailDomain[];
  verificationRules: UniversityVerificationRule[];
  users: User[];
  categories: Category[];
  listings: Listing[];
  favorites: Favorite[];
  viewEvents: ViewEvent[];
  searchEvents: SearchEvent[];
  recommendationEvents: RecommendationEvent[];
  conversations: Conversation[];
  transactions: Transaction[];
  reviews: Review[];
  reports: Report[];
  moderationActions: ModerationAction[];
  sponsoredPlacements: SponsoredPlacement[];
  promotionPurchases: PromotionPurchase[];
  notifications: Notification[];
  waitlistLeads: WaitlistLead[];
  contentBlocks: ContentBlock[];
  pricingSettings: PricingSetting[];
  auditLogs: AuditLog[];
}

export interface ListingSearchInput {
  query?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: ListingCondition[];
  outlet?: boolean;
  featured?: boolean;
  minimumSellerRating?: number;
  pickupArea?: string;
  distance?: ListingDistanceFilter;
  sort?: "newest" | "price-low-high" | "price-high-low" | "recommended" | "relevance";
}

export interface RecommendationBreakdown {
  listingId: string;
  score: number;
  reasons: string[];
}
