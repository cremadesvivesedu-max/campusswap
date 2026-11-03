import { cache } from "react";
import {
  AWAY_UNTIL_METADATA_KEY,
  BUNDLE_DISCOUNT_METADATA_KEY,
  parseAwayUntil,
  parseBundleDiscount,
  type SellerPreferences
} from "@/features/profile/seller-preferences";
import { isLiveMode } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const none: SellerPreferences = { bundleDiscount: null, awayUntil: null };

function fromMetadata(metadata: Record<string, unknown> | undefined): SellerPreferences {
  return {
    bundleDiscount: parseBundleDiscount(metadata?.[BUNDLE_DISCOUNT_METADATA_KEY]),
    awayUntil: parseAwayUntil(metadata?.[AWAY_UNTIL_METADATA_KEY])
  };
}

/** What buyers may see of a seller's settings. Only ever returns these two checked values. */
export const getSellerPreferences = cache(async (sellerId: string): Promise<SellerPreferences> => {
  if (!isLiveMode) {
    return sellerId === "user-lina"
      ? {
          bundleDiscount: 15,
          awayUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        }
      : none;
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return none;
  }

  const { data } = await admin.auth.admin.getUserById(sellerId);
  return fromMetadata(data?.user?.user_metadata);
});

/** The signed-in seller's own settings, for the My listings card. */
export async function getMySellerPreferences(): Promise<SellerPreferences> {
  if (!isLiveMode) {
    return none;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return none;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  return fromMetadata(user?.user_metadata);
}
