"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isLiveMode } from "@/lib/env";
import { getCurrentUser } from "@/server/queries/marketplace";
import type { ExchangeStatus, ListingStatus } from "@/types/domain";

interface ActionResult {
  success: boolean;
  message: string;
}

interface ToggleFavoriteResult extends ActionResult {
  isSaved: boolean;
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

async function notifyUser(userId: string, title: string, body: string) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return;
  }

  await admin.from("notifications").insert({
    user_id: userId,
    type: "system",
    title,
    body
  });
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
    .in("state", ["inquiry", "negotiating", "reserved", "completed"])
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
  );
}

async function ensureTransactionRecord(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  {
    listingId,
    buyerId,
    sellerId,
    conversationId,
    amount
  }: {
    listingId: string;
    buyerId: string;
    sellerId: string;
    conversationId: string;
    amount: number;
  }
) {
  const { data: existing } = await supabase
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, amount, conversation_id, meetup_spot, meetup_window, created_at, updated_at, reserved_at, cancelled_at, completed_at"
    )
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .in("state", ["inquiry", "negotiating", "reserved"])
    .order("updated_at", { ascending: false })
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("transactions")
      .update({
        conversation_id: existing.conversation_id ?? conversationId,
        amount,
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
      state: "inquiry",
      amount,
      conversation_id: conversationId,
      meetup_spot: "To be agreed in chat",
      meetup_window: "To be scheduled"
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create the exchange record.");
  }

  return data.id;
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
    .in("state", ["inquiry", "negotiating", "reserved"]);

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
      notifyUser(row.buyer_id, "Purchase request closed", buyerMessage)
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
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "listing",
    title: "Saved to your shortlist",
    body: "CampusSwap will keep this listing close in your saved feed."
  });

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
    body: `${listing.title} is now marked as ${nextStatus}.`
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
  listingId: string
): Promise<ActionResult & { conversationId?: string; transactionId?: string }> {
  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to create a purchase commitment."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, title, status, price")
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

  const openTransactions = await getOpenTransactionForListing(supabase, listingId);
  const reservedForAnotherBuyer = openTransactions.find(
    (transaction) =>
      transaction.state === "reserved" && transaction.buyer_id !== user.id
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
      amount: Number(listing.price)
    });

    await supabase
      .from("transactions")
      .update({
        state: "negotiating",
        amount: Number(listing.price),
        updated_at: new Date().toISOString()
      })
      .eq("id", transactionId)
      .neq("state", "completed");

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      text: "I want to buy this item. Can you reserve it for me?"
    });

    await notifyUser(
      listing.seller_id,
      "New purchase request",
      `${user.profile.fullName} wants to buy ${listing.title}.`
    );

    revalidatePath(`/app/listings/${listingId}`);
    revalidatePath("/app/messages");
    revalidatePath(`/app/messages/${conversationId}`);
    revalidatePath("/app/my-purchases");

    return {
      success: true,
      message: "Purchase request created. No online payment has been taken yet.",
      conversationId,
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
    .select("id, title, status, price")
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
    const transactionId = await ensureTransactionRecord(supabase, {
      listingId: conversation.listing_id,
      buyerId: conversation.buyer_id,
      sellerId: conversation.seller_id,
      conversationId: conversation.id,
      amount: Number(listing.price)
    });

    await supabase
      .from("transactions")
      .update({
        state: "reserved",
        amount: Number(listing.price),
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
      `${listing.title} is now reserved while you arrange the meetup.`
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
    .select("id, listing_id, buyer_id, seller_id, state, conversation_id")
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
      state: "negotiating",
      reserved_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", transaction.id);

  await supabase
    .from("listings")
    .update({
      status: "active",
      updated_at: new Date().toISOString()
    })
    .eq("id", transaction.listing_id);

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
    "The seller reopened the listing for new buyers."
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
    .select("id, listing_id, buyer_id, seller_id, state, conversation_id")
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

  await supabase
    .from("transactions")
    .update({
      state: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", transaction.id);

  if (transaction.state === "reserved") {
    await supabase
      .from("listings")
      .update({
        status: "active",
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.listing_id);
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
    "The purchase request was cancelled and the listing was updated."
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
    .select("id, listing_id, buyer_id, seller_id, state, conversation_id")
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !transaction) {
    return {
      success: false,
      message: error?.message ?? "That exchange could not be found."
    };
  }

  if (transaction.seller_id !== user.id) {
    return {
      success: false,
      message: "Only the seller can mark this exchange as completed."
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
      text: "I marked this exchange as completed. You can now leave a review."
    });
  }

  await cancelCompetingTransactions(
    transaction.listing_id,
    transaction.id,
    "The listing was sold to another buyer."
  );

  await notifyUser(
    transaction.buyer_id,
    "Sale completed",
    "The seller marked this exchange as completed. Both sides can now leave a review."
  );

  revalidatePath(`/app/listings/${transaction.listing_id}`);
  revalidatePath("/app/messages");
  revalidatePath("/app/my-purchases");
  revalidatePath("/app/my-listings");
  revalidatePath("/app/reviews");

  return {
    success: true,
    message: "Listing marked as sold and the exchange is now complete."
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
    "Listing removed from public view",
    `${listing.title} is now hidden from buyers while chats and completed history remain intact.`
  );

  revalidatePath("/app");
  revalidatePath("/app/search");
  revalidatePath("/app/for-you");
  revalidatePath("/app/saved");
  revalidatePath("/app/my-listings");
  revalidatePath(`/app/listings/${listingId}`);

  return {
    success: true,
    message: "Listing removed from public browse surfaces."
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

export async function submitListingReportAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const reason = String(formData.get("reason") ?? "").trim();
  const listingId = String(formData.get("listingId") ?? "").trim();

  if (!reason || reason.length < 12) {
    return {
      success: false,
      message: "Share a short reason so the moderation team can review it properly."
    };
  }

  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to submit marketplace reports."
    };
  }

  const { user, supabase } = await requireMarketplaceContext();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: "listing",
    target_id: listingId,
    reason
  });

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  revalidatePath(`/app/listings/${listingId}`);
  revalidatePath("/admin/reports");

  return {
    success: true,
    message: "Report submitted. CampusSwap moderation can review it now."
  };
}

export async function submitTransactionReviewAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const reviewText = String(formData.get("text") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);

  if (!transactionId || !targetUserId || rating < 1 || rating > 5 || !reviewText) {
    return {
      success: false,
      message: "Choose a rating and share a short review before submitting."
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
      body: "A completed exchange review just landed on your profile."
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
