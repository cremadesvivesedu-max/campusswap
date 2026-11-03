"use server";

import { revalidatePath } from "next/cache";
import {
  AWAY_UNTIL_METADATA_KEY,
  BUNDLE_DISCOUNT_METADATA_KEY,
  parseAwayUntil,
  parseBundleDiscount
} from "@/features/profile/seller-preferences";
import { isLiveMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSellerPreferences } from "@/server/queries/seller-preferences";

type SellerPreferencesResult = { success: boolean; message: string };

/** Save the seller's bundle discount and away date (kept in auth user metadata). */
export async function updateSellerPreferencesAction(
  _: SellerPreferencesResult,
  formData: FormData
): Promise<SellerPreferencesResult> {
  const rawAway = formData.get("awayUntil");
  const awayUntil = rawAway ? parseAwayUntil(rawAway) : null;

  if (rawAway && !awayUntil) {
    return { success: false, message: "invalid-date" };
  }

  if (!isLiveMode) {
    return { success: true, message: "saved" };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, message: "Supabase is not configured." };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      [BUNDLE_DISCOUNT_METADATA_KEY]: parseBundleDiscount(formData.get("bundleDiscount")),
      [AWAY_UNTIL_METADATA_KEY]: awayUntil
    }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/app/my-listings");
  return { success: true, message: "saved" };
}

/** For the chat, which loads in the browser: when the seller is back, if they are away. */
export async function getSellerAwayUntilAction(sellerId: string) {
  return (await getSellerPreferences(sellerId)).awayUntil;
}
