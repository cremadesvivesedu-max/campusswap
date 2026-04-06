"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  avatarsBucket,
  extractPublicStoragePath,
  listingImagesBucket,
  uploadPublicFile
} from "@/lib/supabase/storage";
import { isLiveMode } from "@/lib/env";
import { createFeaturedCheckoutSession, stripe } from "@/lib/payments/stripe";
import { getCurrentUser } from "@/server/queries/marketplace";
import { shouldModerateListing } from "@/server/services/moderation";
import type { PromotionPurchaseStatus } from "@/types/domain";

interface ActionState {
  success: boolean;
  message: string;
  redirectTo?: string;
  promotionStatus?: "none" | "pending" | "active" | "cancelled";
}

interface ListingFormValues {
  listingId?: string;
  title: string;
  description: string;
  pickupArea: string;
  categorySlug: string;
  condition: string;
  price: number;
  negotiable: boolean;
  outlet: boolean;
  urgent: boolean;
  requestFeatured: boolean;
  replaceImages: boolean;
  imageFiles: File[];
}

interface PromotionPurchaseRow {
  id: string;
  amount: number | string;
  active: boolean;
  status: PromotionPurchaseStatus;
  stripe_checkout_session_id?: string | null;
}

function readListingFormValues(formData: FormData): ListingFormValues {
  return {
    listingId: String(formData.get("listingId") ?? "").trim() || undefined,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    pickupArea: String(formData.get("pickupArea") ?? "").trim(),
    categorySlug: String(formData.get("category") ?? "").trim(),
    condition: String(formData.get("condition") ?? "good").trim(),
    price: Number(formData.get("price") ?? 0),
    negotiable: formData.get("negotiable") === "on",
    outlet: formData.get("outlet") === "on",
    urgent: formData.get("urgent") === "on",
    requestFeatured: formData.get("requestFeatured") === "on",
    replaceImages: formData.get("replaceImages") === "on",
    imageFiles: formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0)
  };
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toPromotionUiState(
  purchase?: Pick<PromotionPurchaseRow, "active" | "status"> | null
) {
  if (!purchase) {
    return "none" as const;
  }

  if (purchase.active || purchase.status === "paid") {
    return "active" as const;
  }

  if (purchase.status === "cancelled") {
    return "cancelled" as const;
  }

  return "pending" as const;
}

async function resolveCategoryId(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  categorySlug: string
) {
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  return category?.id;
}

async function replaceListingImagesIfNeeded(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  listingId: string,
  title: string,
  userId: string,
  imageFiles: File[],
  replaceImages: boolean
) {
  if (!imageFiles.length) {
    return;
  }

  if (replaceImages) {
    const { data: existingImages } = await supabase
      .from("listing_images")
      .select("id, url")
      .eq("listing_id", listingId);

    const removablePaths =
      existingImages
        ?.map((image) => extractPublicStoragePath(listingImagesBucket, image.url))
        .filter((value): value is string => Boolean(value)) ?? [];

    if (removablePaths.length) {
      await supabase.storage.from(listingImagesBucket).remove(removablePaths);
    }

    if (existingImages?.length) {
      await supabase.from("listing_images").delete().eq("listing_id", listingId);
    }
  }

  const { count } = await supabase
    .from("listing_images")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId);

  const uploadedImages = await Promise.all(
    imageFiles.map(async (file, index) => {
      const upload = await uploadPublicFile(
        supabase,
        listingImagesBucket,
        [userId, listingId],
        file
      );

      return {
        listing_id: listingId,
        url: upload.publicUrl,
        alt: title,
        is_primary: (count ?? 0) === 0 && index === 0
      };
    })
  );

  const { error: imagesError } = await supabase
    .from("listing_images")
    .insert(uploadedImages);

  if (imagesError) {
    throw new Error(imagesError.message);
  }
}

async function getFeaturedListingPrice() {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return 2;
  }

  const { data } = await admin
    .from("pricing_settings")
    .select("value")
    .eq("module", "promoted-listings")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Number(data?.value ?? 2);
}

async function getLatestFeaturedPromotionPurchase({
  listingId,
  sellerId
}: {
  listingId: string;
  sellerId: string;
}) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return null;
  }

  const { data } = await admin
    .from("promotion_purchases")
    .select("id, amount, active, status, stripe_checkout_session_id")
    .eq("listing_id", listingId)
    .eq("seller_id", sellerId)
    .eq("type", "featured")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as PromotionPurchaseRow | null) ?? null;
}

async function createFeaturedCheckoutForPurchase({
  listingId,
  listingTitle,
  purchaseId,
  sellerId,
  amount
}: {
  listingId: string;
  listingTitle: string;
  purchaseId: string;
  sellerId: string;
  amount: number;
}) {
  const admin = createAdminSupabaseClient();

  if (!admin || !stripe) {
    return null;
  }

  const session = await createFeaturedCheckoutSession({
    listingId,
    sellerId,
    promotionPurchaseId: purchaseId,
    listingTitle,
    amount
  });

  const { error } = await admin
    .from("promotion_purchases")
    .update({
      status: "checkout_opened",
      active: false,
      stripe_checkout_session_id: session.id,
      cancelled_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", purchaseId);

  if (error) {
    throw new Error(error.message);
  }

  return session.url;
}

async function syncFeaturedPromotionRequest({
  listingId,
  listingTitle,
  sellerId,
  requestFeatured
}: {
  listingId: string;
  listingTitle: string;
  sellerId: string;
  requestFeatured: boolean;
}) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return {
      state: "none" as const,
      shouldLaunchCheckout: false
    };
  }

  const existing = await getLatestFeaturedPromotionPurchase({ listingId, sellerId });

  if (!requestFeatured) {
    if (existing?.id && !existing.active && existing.status !== "paid") {
      await admin
        .from("promotion_purchases")
        .update({
          status: "cancelled",
          active: false,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id);
    }

    return {
      state: existing?.active ? ("active" as const) : ("none" as const),
      shouldLaunchCheckout: false
    };
  }

  if (existing?.active || existing?.status === "paid") {
    return {
      state: "active" as const,
      purchaseId: existing.id,
      amount: toNumber(existing.amount),
      shouldLaunchCheckout: false
    };
  }

  const amount = existing ? toNumber(existing.amount) : await getFeaturedListingPrice();
  const now = new Date().toISOString();

  if (!existing?.id) {
    const { data: created, error } = await admin
      .from("promotion_purchases")
      .insert({
        listing_id: listingId,
        seller_id: sellerId,
        type: "featured",
        amount,
        status: "pending",
        active: false
      })
      .select("id")
      .single();

    if (error || !created?.id) {
      throw new Error(error?.message ?? "Unable to save the promotion request.");
    }

    await admin.from("notifications").insert({
      user_id: sellerId,
      type: "promotion",
      title: "Promotion request recorded",
      body: `CampusSwap saved your EUR ${amount} highlight request for ${listingTitle}. The listing stays non-featured until payment is completed.`
    });

    return {
      state: "pending" as const,
      purchaseId: created.id,
      amount,
      shouldLaunchCheckout: true
    };
  }

  if (existing.status === "cancelled") {
    await admin
      .from("promotion_purchases")
      .update({
        status: "pending",
        active: false,
        cancelled_at: null,
        updated_at: now
      })
      .eq("id", existing.id);

    return {
      state: "pending" as const,
      purchaseId: existing.id,
      amount,
      shouldLaunchCheckout: true
    };
  }

  if (existing.status !== "pending") {
    await admin
      .from("promotion_purchases")
      .update({
        status: "pending",
        active: false,
        updated_at: now
      })
      .eq("id", existing.id);
  }

  return {
    state: "pending" as const,
    purchaseId: existing.id,
    amount,
    shouldLaunchCheckout: false
  };
}

export async function joinWaitlistAction(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const intent = String(formData.get("intent") ?? "both").trim();

  if (!email) {
    return {
      success: false,
      message: "Please provide an email."
    } satisfies ActionState;
  }

  if (!isLiveMode) {
    return {
      success: true,
      message: `Saved ${email} for ${intent}.`
    } satisfies ActionState;
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase is not configured for waitlist capture."
    } satisfies ActionState;
  }

  const { error } = await supabase.from("waitlist_leads").insert({
    email,
    intent
  });

  return {
    success: !error,
    message: error ? error.message : "You are on the CampusSwap waitlist."
  } satisfies ActionState;
}

export async function signupAction(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { success: false, message: "Email is required." } satisfies ActionState;
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function saveOnboardingAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();

  if (!isLiveMode) {
    return {
      success: true,
      message: "Onboarding saved in demo mode."
    } satisfies ActionState;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase is not configured for onboarding."
    } satisfies ActionState;
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const studentStatus = String(formData.get("studentStatus") ?? "current").trim();
  const preferredCategories = formData
    .getAll("preferredCategories")
    .map((value) => String(value))
    .filter(Boolean);
  const notificationPreferences = formData
    .getAll("notificationPreferences")
    .map((value) => String(value))
    .filter(Boolean);
  const buyerIntent = formData.get("buyerIntent") === "on";
  const sellerIntent = formData.get("sellerIntent") === "on";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      neighborhood,
      bio,
      student_status: studentStatus,
      preferred_categories: preferredCategories,
      notification_preferences: notificationPreferences,
      buyer_intent: buyerIntent,
      seller_intent: sellerIntent
    })
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message
    } satisfies ActionState;
  }

  revalidatePath("/app");
  revalidatePath("/app/profile");

  return {
    success: true,
    message: "Onboarding saved."
  } satisfies ActionState;
}

export async function updateProfileAvatarAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return {
      success: false,
      message: "Choose an image before uploading."
    } satisfies ActionState;
  }

  if (!isLiveMode) {
    return {
      success: false,
      message: "Switch to live mode to persist avatars in Supabase Storage."
    } satisfies ActionState;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase Storage is not configured."
    } satisfies ActionState;
  }

  try {
    const upload = await uploadPublicFile(supabase, avatarsBucket, [user.id], file);
    const { error } = await supabase
      .from("users")
      .update({ avatar_url: upload.publicUrl })
      .eq("id", user.id);

    if (error) {
      return {
        success: false,
        message: error.message
      } satisfies ActionState;
    }

    revalidatePath("/app/profile");
    revalidatePath("/app/profile/edit");
    revalidatePath("/app");

    return {
      success: true,
      message: "Profile photo updated."
    } satisfies ActionState;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to upload the avatar."
    } satisfies ActionState;
  }
}

export async function clearProfileAvatarAction() {
  const user = await getCurrentUser();

  if (!isLiveMode) {
    return {
      success: true,
      message: "Reverted to the default avatar state in demo mode."
    } satisfies ActionState;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase is not configured."
    } satisfies ActionState;
  }

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message
    } satisfies ActionState;
  }

  revalidatePath("/app/profile");
  revalidatePath("/app/profile/edit");
  revalidatePath("/app");

  return {
    success: true,
    message: "Profile photo reset."
  } satisfies ActionState;
}

export async function createListingAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();
  const {
    title,
    description,
    pickupArea,
    categorySlug,
    condition,
    price,
    negotiable,
    outlet,
    urgent,
    requestFeatured,
    imageFiles
  } = readListingFormValues(formData);
  const flaggedForModeration = shouldModerateListing(title, description);
  const requiresTrustReview = user.verificationStatus !== "verified";
  const needsReview = flaggedForModeration || requiresTrustReview;

  if (!title || !description || !pickupArea || !categorySlug || !price) {
    return {
      success: false,
      message: "Fill in the required title, description, price, category, and pickup area."
    } satisfies ActionState;
  }

  if (!isLiveMode) {
    return {
      success: true,
      message: needsReview
        ? "Listing captured and queued for review."
        : "Listing draft captured in demo mode."
    } satisfies ActionState;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase is not configured for listing creation."
    } satisfies ActionState;
  }

  const categoryId = await resolveCategoryId(supabase, categorySlug);

  if (!categoryId) {
    return {
      success: false,
      message: "That category could not be found."
    } satisfies ActionState;
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      category_id: categoryId,
      title,
      description,
      condition,
      price,
      negotiable,
      location: user.profile.neighborhood,
      pickup_area: pickupArea,
      status: needsReview ? "pending-review" : "active",
      outlet,
      featured: false,
      urgent,
      tags: []
    })
    .select("id")
    .single();

  if (listingError || !listing?.id) {
    return {
      success: false,
      message: listingError?.message ?? "Unable to create the listing."
    } satisfies ActionState;
  }

  if (imageFiles.length > 0) {
    try {
      await replaceListingImagesIfNeeded(
        supabase,
        listing.id,
        title,
        user.id,
        imageFiles,
        false
      );
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unable to upload listing images."
      } satisfies ActionState;
    }
  }

  const promotionResult = await syncFeaturedPromotionRequest({
    listingId: listing.id,
    listingTitle: title,
    sellerId: user.id,
    requestFeatured
  });

  let checkoutUrl: string | null = null;

  if (
    requestFeatured &&
    promotionResult.purchaseId &&
    promotionResult.amount &&
    promotionResult.shouldLaunchCheckout
  ) {
    try {
      checkoutUrl = await createFeaturedCheckoutForPurchase({
        listingId: listing.id,
        listingTitle: title,
        purchaseId: promotionResult.purchaseId,
        sellerId: user.id,
        amount: promotionResult.amount
      });
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to start Stripe Checkout for this promotion."
      } satisfies ActionState;
    }
  }

  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "listing",
    title: needsReview ? "Listing submitted for review" : "Listing is live",
    body: needsReview
      ? requiresTrustReview
        ? `${title} is waiting for trust review because your account is not student-verified yet.`
        : `${title} is waiting for moderation before it becomes visible.`
      : `${title} is now visible on CampusSwap.`
  });

  revalidatePath("/app");
  revalidatePath("/app/my-listings");
  revalidatePath("/app/profile");

  return {
    success: true,
    message: `${needsReview
      ? requiresTrustReview
        ? "Listing submitted. It will go live after a quick trust review because your account is not student-verified yet."
        : "Listing submitted and queued for moderation review."
        : "Listing published."}${
      promotionResult.state === "pending"
        ? checkoutUrl
          ? " Redirecting you to Stripe Checkout to complete the EUR 2 featured payment."
          : " Promotion request recorded. The listing will only appear as featured after payment is completed."
        : ""
    }`,
    redirectTo: checkoutUrl ?? undefined,
    promotionStatus: promotionResult.state
  } satisfies ActionState;
}

export async function updateListingAction(_: unknown, formData: FormData) {
  const user = await getCurrentUser();
  const {
    listingId,
    title,
    description,
    pickupArea,
    categorySlug,
    condition,
    price,
    negotiable,
    outlet,
    urgent,
    requestFeatured,
    replaceImages,
    imageFiles
  } = readListingFormValues(formData);

  if (!listingId) {
    return {
      success: false,
      message: "That listing could not be found."
    } satisfies ActionState;
  }

  if (!title || !description || !pickupArea || !categorySlug || !price) {
    return {
      success: false,
      message: "Fill in the required title, description, price, category, and pickup area."
    } satisfies ActionState;
  }

  if (replaceImages && imageFiles.length === 0) {
    return {
      success: false,
      message: "Upload at least one replacement image before clearing the current gallery."
    } satisfies ActionState;
  }

  if (!isLiveMode) {
    return {
      success: true,
      message: "Listing changes saved in demo mode."
    } satisfies ActionState;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase is not configured for listing updates."
    } satisfies ActionState;
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return {
      success: false,
      message: listingError?.message ?? "That listing could not be found."
    } satisfies ActionState;
  }

  const canEdit = listing.seller_id === user.id || user.role === "admin";

  if (!canEdit) {
    return {
      success: false,
      message: "Only the seller or an admin can edit this listing."
    } satisfies ActionState;
  }

  const categoryId = await resolveCategoryId(supabase, categorySlug);

  if (!categoryId) {
    return {
      success: false,
      message: "That category could not be found."
    } satisfies ActionState;
  }

  const flaggedForModeration = shouldModerateListing(title, description);
  const requiresTrustReview = user.verificationStatus !== "verified";
  const shouldReturnToReview =
    ["active", "pending-review"].includes(listing.status) &&
    (flaggedForModeration || requiresTrustReview);
  const nextStatus = shouldReturnToReview
    ? "pending-review"
    : listing.status === "pending-review"
      ? "active"
      : listing.status;

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      category_id: categoryId,
      title,
      description,
      condition,
      price,
      negotiable,
      pickup_area: pickupArea,
      outlet,
      urgent,
      status: nextStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", listingId);

  if (updateError) {
    return {
      success: false,
      message: updateError.message
    } satisfies ActionState;
  }

  if (imageFiles.length > 0) {
    try {
      await replaceListingImagesIfNeeded(
        supabase,
        listingId,
        title,
        listing.seller_id,
        imageFiles,
        replaceImages
      );
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unable to update listing images."
      } satisfies ActionState;
    }
  }

  const promotionResult = await syncFeaturedPromotionRequest({
    listingId,
    listingTitle: title,
    sellerId: listing.seller_id,
    requestFeatured
  });

  let checkoutUrl: string | null = null;

  if (
    requestFeatured &&
    promotionResult.purchaseId &&
    promotionResult.amount &&
    promotionResult.shouldLaunchCheckout
  ) {
    try {
      checkoutUrl = await createFeaturedCheckoutForPurchase({
        listingId,
        listingTitle: title,
        purchaseId: promotionResult.purchaseId,
        sellerId: listing.seller_id,
        amount: promotionResult.amount
      });
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to start Stripe Checkout for this promotion."
      } satisfies ActionState;
    }
  }

  await supabase.from("notifications").insert({
    user_id: listing.seller_id,
    type: "listing",
    title: nextStatus === "pending-review" ? "Listing updated and queued for review" : "Listing updated",
    body:
      nextStatus === "pending-review"
        ? `${title} was updated and moved back into review before returning to public browse.`
        : `${title} was updated successfully.`
  });

  revalidatePath("/app");
  revalidatePath("/app/search");
  revalidatePath("/app/for-you");
  revalidatePath("/app/saved");
  revalidatePath("/app/my-listings");
  revalidatePath("/app/profile");
  revalidatePath("/app/sell");
  revalidatePath(`/app/listings/${listingId}`);

  return {
    success: true,
    message: `${
      nextStatus === "pending-review"
        ? "Listing updated. It will return to browse after a quick trust or moderation review."
        : "Listing updated."
    }${
      promotionResult.state === "pending"
        ? checkoutUrl
          ? " Redirecting you to Stripe Checkout to complete the EUR 2 featured payment."
          : " Promotion request is pending payment."
        : ""
    }`,
    redirectTo: checkoutUrl ?? undefined,
    promotionStatus: promotionResult.state
  } satisfies ActionState;
}

export async function startFeaturedPromotionCheckoutAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const user = await getCurrentUser();

  if (!listingId) {
    redirect("/app/sell?promotion=error");
  }

  if (!isLiveMode) {
    redirect(`/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=error`);
  }

  if (!stripe) {
    redirect(
      `/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=payment-unavailable`
    );
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect(
      `/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=payment-unavailable`
    );
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, title, seller_id")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !listing) {
    redirect("/app/my-listings?promotion=error");
  }

  if (listing.seller_id !== user.id && user.role !== "admin") {
    redirect(`/app/listings/${listingId}`);
  }

  const promotionResult = await syncFeaturedPromotionRequest({
    listingId,
    listingTitle: listing.title,
    sellerId: listing.seller_id,
    requestFeatured: true
  });

  if (promotionResult.state === "active") {
    redirect(`/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=paid`);
  }

  if (!promotionResult.purchaseId || !promotionResult.amount) {
    redirect(`/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=error`);
  }

  let checkoutUrl: string | null = null;

  try {
    checkoutUrl = await createFeaturedCheckoutForPurchase({
      listingId,
      listingTitle: listing.title,
      purchaseId: promotionResult.purchaseId,
      sellerId: listing.seller_id,
      amount: promotionResult.amount
    });
  } catch {
    redirect(`/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=error`);
  }

  if (!checkoutUrl) {
    redirect(
      `/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=payment-unavailable`
    );
  }

  redirect(checkoutUrl);
}
