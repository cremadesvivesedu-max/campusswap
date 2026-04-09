"use client";

import { useEffect, useMemo, useState } from "react";
import {
  messageAttachmentsBucket,
  uploadPublicFile
} from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";
import type {
  Conversation,
  ConversationPreview,
  ConversationThreadData,
  Listing,
  ListingOffer,
  Message,
  Transaction,
  User
} from "@/types/domain";

const defaultQuickActions = [
  "Is this available?",
  "Can you reserve it?",
  "Can we meet on campus?",
  "Is the price negotiable?"
];

interface DbProfileRow {
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
}

interface DbUserWithProfile {
  id: string;
  email: string;
  role: User["role"];
  verification_status: User["verificationStatus"];
  avatar_url: string | null;
  joined_at: string;
  last_seen_at: string | null;
  profile: DbProfileRow | null;
}

interface DbListingRow {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  condition: Listing["condition"];
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
  category: {
    slug: string;
  } | null;
  listing_images:
    | {
        id: string;
        url: string;
        alt: string;
        is_primary: boolean;
        created_at?: string;
      }[]
    | null;
  seller: DbUserWithProfile | null;
}

interface DbMessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  sent_at: string;
  read: boolean;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_mime_type: string | null;
}

interface DbTransactionRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  state: Transaction["state"];
  amount: number | string;
  fulfillment_method: Transaction["fulfillmentMethod"] | null;
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
  state: ListingOffer["state"];
  expires_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbConversationWithRelations {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  blocked_by: string | null;
  unread_count: number;
  buyer_unread_count: number | null;
  seller_unread_count: number | null;
  quick_actions: string[] | null;
  listing: DbListingRow | null;
  buyer: DbUserWithProfile | null;
  seller: DbUserWithProfile | null;
  transaction: DbTransactionRow[] | DbTransactionRow | null;
  messages: DbMessageRow[] | null;
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

function freshnessLabel(createdAt: string, status: Listing["status"], outlet: boolean) {
  if (status === "sold") {
    return "Sold";
  }

  if (status === "reserved") {
    return "Reserved";
  }

  if (outlet) {
    return "Outlet";
  }

  if (status === "hidden") {
    return "Removed";
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

function mapUser(row: DbUserWithProfile): User {
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
      fullName: row.profile?.full_name ?? "CampusSwap student",
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

function mapListing(row: DbListingRow): Listing {
  const images = [...(row.listing_images ?? [])].sort(
    (left, right) =>
      Number(right.is_primary) - Number(left.is_primary) ||
      Date.parse(left.created_at ?? "") - Date.parse(right.created_at ?? "")
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
    pickupAvailable: row.pickup_available,
    shippingAvailable: row.shipping_available,
    shippingCost: numberValue(row.shipping_cost),
    outlet: row.outlet,
    featured: row.featured,
    urgent: row.urgent,
    status: row.status,
    createdAt: row.created_at,
    freshnessLabel: freshnessLabel(row.created_at, row.status, row.outlet),
    sellerId: row.seller_id,
    sellerRating: numberValue(row.seller?.profile?.rating_average),
    sellerResponseRate: numberValue(row.seller?.profile?.response_rate),
    viewCount: row.view_count,
    saveCount: row.save_count,
    tags: row.tags ?? [],
    removedAt: row.removed_at ?? undefined,
    images: images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      isPrimary: image.is_primary
    }))
  };
}

function mapMessage(row: DbMessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    text: row.text,
    sentAt: row.sent_at,
    read: row.read,
    attachment:
      row.attachment_url && row.attachment_name && row.attachment_mime_type
        ? {
            id: `attachment-${row.id}`,
            url: row.attachment_url,
            name: row.attachment_name,
            mimeType: row.attachment_mime_type
          }
        : undefined
  };
}

function pickTransactionRow(
  value: DbConversationWithRelations["transaction"]
): DbTransactionRow | undefined {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function mapTransaction(row: DbTransactionRow): Transaction {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    state: row.state,
    amount: numberValue(row.amount),
    fulfillmentMethod: row.fulfillment_method ?? undefined,
    shippingAmount: numberValue(row.shipping_amount),
    platformFee: numberValue(row.platform_fee),
    totalAmount: numberValue(row.total_amount),
    conversationId: row.conversation_id ?? undefined,
    meetupSpot: row.meetup_spot,
    meetupWindow: row.meetup_window,
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

function mapConversation(row: DbConversationWithRelations): Conversation {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    blockedBy: row.blocked_by ?? undefined,
    unreadCount: row.unread_count,
    quickActions: row.quick_actions ?? defaultQuickActions,
    messages: ((row.messages ?? []) as DbMessageRow[]).map(mapMessage).sort(
      (left, right) => Date.parse(left.sentAt) - Date.parse(right.sentAt)
    )
  };
}

function getUnreadCount(row: DbConversationWithRelations, currentUserId: string) {
  if (row.buyer_id === currentUserId) {
    return row.buyer_unread_count ?? row.unread_count ?? 0;
  }

  return row.seller_unread_count ?? row.unread_count ?? 0;
}

const conversationSelect = `
  id,
  listing_id,
  buyer_id,
  seller_id,
  blocked_by,
  unread_count,
  buyer_unread_count,
  seller_unread_count,
  quick_actions,
  listing:listings!conversations_listing_id_fkey (
    id,
    seller_id,
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
    listing_images (
      id,
      url,
      alt,
      is_primary,
      created_at
    ),
    category:categories (
      slug
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
    )
  ),
  buyer:users!conversations_buyer_id_fkey (
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
  seller:users!conversations_seller_id_fkey (
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
  transaction:transactions!transactions_conversation_id_fkey (
    id,
    listing_id,
    buyer_id,
    seller_id,
    state,
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
    completed_at
  ),
  messages (
    id,
    conversation_id,
    sender_id,
    text,
    sent_at,
    read,
    attachment_url,
    attachment_name,
    attachment_mime_type
  )
`;

async function fetchUserConversations(currentUserId: string) {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(conversationSelect)
    .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const previews: ConversationPreview[] = [];

  for (const row of (data as unknown as DbConversationWithRelations[] | null) ?? []) {
    const conversation = mapConversation(row);
    const listing = row.listing ? mapListing(row.listing) : undefined;
    const counterpartRow = row.seller_id === currentUserId ? row.buyer : row.seller;
    const counterpart = counterpartRow ? mapUser(counterpartRow) : undefined;

    if (!listing || !counterpart) {
      continue;
    }

    previews.push({
      conversation: {
        ...conversation,
        unreadCount: getUnreadCount(row, currentUserId)
      },
      listing,
      counterpart,
      latestMessage: conversation.messages[conversation.messages.length - 1],
      unreadCount: getUnreadCount(row, currentUserId)
    });
  }

  return previews;
}

async function fetchConversationThread(conversationId: string, currentUserId: string) {
  const supabase = createClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(conversationSelect)
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = (data as unknown as DbConversationWithRelations | null) ?? null;

  if (!row?.listing || !row.buyer || !row.seller) {
    return undefined;
  }

  const conversation = mapConversation(row);
  const transactionRow = pickTransactionRow(row.transaction);
  const { data: offerData } = await supabase
    .from("listing_offers")
    .select(
      "id, listing_id, transaction_id, conversation_id, buyer_id, seller_id, created_by_user_id, parent_offer_id, amount, state, expires_at, responded_at, created_at, updated_at"
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const offerRow = (offerData as unknown as DbOfferRow | null) ?? null;

  return {
    conversation: {
      ...conversation,
      unreadCount: getUnreadCount(row, currentUserId)
    },
    listing: mapListing(row.listing),
    buyer: mapUser(row.buyer),
    seller: mapUser(row.seller),
    messages: conversation.messages,
    unreadCount: getUnreadCount(row, currentUserId),
    transaction: transactionRow ? mapTransaction(transactionRow) : undefined,
    latestOffer: offerRow ? mapOffer(offerRow) : undefined
  } satisfies ConversationThreadData;
}

export async function ensureLiveConversationForListing(
  listingId: string,
  buyerId: string,
  sellerId: string
) {
  const supabase = createClient();

  if (!supabase) {
    throw new Error("Supabase messaging is not configured.");
  }

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
    return existing;
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
      quick_actions: defaultQuickActions
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function sendLiveConversationMessage(
  conversationId: string,
  senderId: string,
  text: string,
  files: File[] = []
) {
  const supabase = createClient();

  if (!supabase) {
    throw new Error("Supabase messaging is not configured.");
  }

  const cleanText = text.trim();
  const imageFiles = files.filter((file) => file.size > 0);

  if (!cleanText && !imageFiles.length) {
    throw new Error("Write a message before sending.");
  }

  for (const file of imageFiles) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image attachments are supported.");
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Each image must be 8 MB or smaller.");
    }
  }

  if (cleanText) {
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text: cleanText,
      read: false
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const file of imageFiles) {
    const upload = await uploadPublicFile(
      supabase,
      messageAttachmentsBucket,
      [senderId, conversationId],
      file
    );

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text: "",
      read: false,
      attachment_url: upload.publicUrl,
      attachment_name: file.name,
      attachment_mime_type: file.type || "image/jpeg"
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}

async function markConversationRead(conversationId: string, currentUserId: string) {
  const supabase = createClient();

  if (!supabase) {
    return;
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation) {
    return;
  }

  const isBuyer = conversation.buyer_id === currentUserId;

  await Promise.all([
    supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", currentUserId)
      .eq("read", false),
    supabase
      .from("conversations")
      .update(
        isBuyer
          ? { buyer_unread_count: 0, unread_count: 0 }
          : { seller_unread_count: 0, unread_count: 0 }
      )
      .eq("id", conversationId)
  ]);
}

export function useLiveConversationPreviews(currentUserId: string) {
  const [previews, setPreviews] = useState<ConversationPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        const nextPreviews = await fetchUserConversations(currentUserId);

        if (active) {
          setPreviews(nextPreviews);
          setError(null);
        }
      } catch (syncError) {
        if (active) {
          setError(
            syncError instanceof Error
              ? syncError.message
              : "Unable to load conversations."
          );
        }
      }
    };

    void sync();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const channel = supabase
      .channel(`conversation-previews-${currentUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        void sync();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        void sync();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => {
        void sync();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "listing_offers" }, () => {
        void sync();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => {
        void sync();
      })
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  return { previews, error };
}

export function useLiveConversationThread(
  conversationId: string,
  currentUserId: string
) {
  const [thread, setThread] = useState<ConversationThreadData | undefined>();
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const listingId = thread?.listing.id;

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        const nextThread = await fetchConversationThread(conversationId, currentUserId);

        if (active) {
          setThread(nextThread);
          setError(null);
        }

        if (nextThread?.unreadCount) {
          await markConversationRead(conversationId, currentUserId);
        }
      } catch (syncError) {
        if (active) {
          setError(
            syncError instanceof Error
              ? syncError.message
              : "Unable to load this conversation."
          );
        }
      }
    };

    void sync();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const channel = supabase
      .channel(`conversation-thread-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          void sync();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          void sync();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listing_offers",
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          void sync();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversationId}`
        },
        () => {
          void sync();
        }
      );

    const subscribedChannel = listingId
      ? channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "listings",
            filter: `id=eq.${listingId}`
          },
          () => {
            void sync();
          }
        )
      : channel;

    const activeChannel = subscribedChannel.subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(activeChannel);
    };
  }, [conversationId, currentUserId, listingId, supabase]);

  return { thread, error };
}
