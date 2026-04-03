"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  avatarsBucket,
  listingImagesBucket,
  uploadPublicFile
} from "@/lib/supabase/storage";
import { isLiveMode } from "@/lib/env";
import { getCurrentUser } from "@/server/queries/marketplace";
import { shouldModerateListing } from "@/server/services/moderation";

interface ActionState {
  success: boolean;
  message: string;
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

  redirect("/verify-email");
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
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const pickupArea = String(formData.get("pickupArea") ?? "").trim();
  const categorySlug = String(formData.get("category") ?? "").trim();
  const condition = String(formData.get("condition") ?? "good").trim();
  const price = Number(formData.get("price") ?? 0);
  const negotiable = formData.get("negotiable") === "on";
  const outlet = formData.get("outlet") === "on";
  const urgent = formData.get("urgent") === "on";
  const imageFiles = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const needsReview = shouldModerateListing(title, description);

  if (!title || !description || !pickupArea || !categorySlug || !price) {
    return {
      success: false,
      message: "Fill in the required title, description, price, category, and pickup area."
    } satisfies ActionState;
  }

  if (!user.profile.verifiedBadge) {
    return {
      success: false,
      message: "Verify your student profile before publishing a listing."
    } satisfies ActionState;
  }

  if (!isLiveMode) {
    return {
      success: true,
      message: needsReview
        ? "Listing captured and queued for moderation review."
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

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (!category?.id) {
    return {
      success: false,
      message: "That category could not be found."
    } satisfies ActionState;
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      category_id: category.id,
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
    const uploadedImages = await Promise.all(
      imageFiles.map(async (file, index) => {
        const upload = await uploadPublicFile(
          supabase,
          listingImagesBucket,
          [user.id, listing.id],
          file
        );

        return {
          listing_id: listing.id,
          url: upload.publicUrl,
          alt: title,
          is_primary: index === 0
        };
      })
    );

    const { error: imagesError } = await supabase
      .from("listing_images")
      .insert(uploadedImages);

    if (imagesError) {
      return {
        success: false,
        message: imagesError.message
      } satisfies ActionState;
    }
  }

  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "listing",
    title: needsReview ? "Listing submitted for review" : "Listing is live",
    body: needsReview
      ? `${title} is waiting for moderation before it becomes visible.`
      : `${title} is now visible on CampusSwap.`
  });

  revalidatePath("/app");
  revalidatePath("/app/my-listings");
  revalidatePath("/app/profile");

  return {
    success: true,
    message: needsReview
      ? "Listing submitted and queued for moderation review."
      : "Listing published."
  } satisfies ActionState;
}
