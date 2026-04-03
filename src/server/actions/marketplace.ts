"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isLiveMode } from "@/lib/env";
import { getCurrentUser } from "@/server/queries/marketplace";
import type { ListingStatus } from "@/types/domain";

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

  const { error } = await supabase
    .from("listings")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
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

  if (!isParticipant || transaction.state !== "completed") {
    return {
      success: false,
      message: "Reviews only unlock after a completed exchange."
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
