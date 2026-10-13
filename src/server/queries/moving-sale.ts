import { isLiveMode } from "@/lib/env";
import { demoData } from "@/lib/demo-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { daysUntilMoveOut, MOVE_OUT_METADATA_KEY } from "@/features/profile/moving-sale";
import { getListingsForSeller } from "@/server/queries/marketplace";
import type { Listing } from "@/types/domain";

export interface MovingSale {
  sellerId: string;
  firstName: string;
  moveOutDate: string | null;
  daysLeft: number | null;
  listings: Listing[];
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function firstNameOf(fullName: string | null | undefined) {
  return String(fullName ?? "").trim().split(/\s+/)[0] ?? "";
}

/** Only items a buyer can still get: active first, then reserved. */
function forSale(listings: Listing[]) {
  return listings
    .filter((listing) => listing.status === "active" || listing.status === "reserved")
    .sort((a, b) => Number(a.status === "reserved") - Number(b.status === "reserved"));
}

/**
 * Public data for a seller's moving sale: first name, moving day and listings still
 * for sale. Uses the service-role client because profiles are not readable anonymously;
 * it only ever returns the first name.
 */
export async function getMovingSale(sellerId: string): Promise<MovingSale | null> {
  if (!isLiveMode) {
    const seller = demoData.users.find((user) => user.id === sellerId);
    if (!seller) {
      return null;
    }
    const demoDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return {
      sellerId,
      firstName: firstNameOf(seller.profile.fullName),
      moveOutDate: demoDate,
      daysLeft: daysUntilMoveOut(demoDate),
      listings: forSale(await getListingsForSeller(sellerId))
    };
  }

  if (!uuidPattern.test(sellerId)) {
    return null;
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return null;
  }

  const [{ data: authData }, { data: profile }, listings] = await Promise.all([
    admin.auth.admin.getUserById(sellerId),
    admin.from("profiles").select("full_name").eq("user_id", sellerId).maybeSingle(),
    getListingsForSeller(sellerId)
  ]);

  if (!authData?.user) {
    return null;
  }

  const rawDate = authData.user.user_metadata?.[MOVE_OUT_METADATA_KEY];
  const moveOutDate = typeof rawDate === "string" ? rawDate : null;

  return {
    sellerId,
    firstName: firstNameOf((profile as { full_name?: string | null } | null)?.full_name),
    moveOutDate,
    daysLeft: daysUntilMoveOut(moveOutDate),
    listings: forSale(listings)
  };
}

/** The signed-in seller's own moving day, for the My listings card. */
export async function getMyMoveOutDate() {
  if (!isLiveMode) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const rawDate = user?.user_metadata?.[MOVE_OUT_METADATA_KEY];
  return typeof rawDate === "string" && daysUntilMoveOut(rawDate) !== null ? rawDate : null;
}
