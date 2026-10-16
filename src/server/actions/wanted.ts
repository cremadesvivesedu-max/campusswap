"use server";

import { revalidatePath } from "next/cache";
import { isLiveMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/server/queries/marketplace";

interface WantedActionState {
  success: boolean;
  message: string;
}

export async function createWantedRequestAction(
  _: WantedActionState,
  formData: FormData
): Promise<WantedActionState> {
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const categorySlug = String(formData.get("category") ?? "").trim() || null;
  const maxPriceRaw = Number(formData.get("maxPrice") ?? 0);
  const maxPrice = Number.isFinite(maxPriceRaw) && maxPriceRaw > 0 ? maxPriceRaw : null;
  const note = String(formData.get("note") ?? "").trim().slice(0, 300) || null;

  if (title.length < 3) {
    return { success: false, message: "Say what you are looking for." };
  }

  if (!isLiveMode) {
    return { success: true, message: "Request posted. We'll tell you when something matches." };
  }

  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, message: "Something went wrong. Please try again." };
  }

  const { count } = await supabase
    .from("wanted_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "open");

  if ((count ?? 0) >= 10) {
    return { success: false, message: "You already have 10 open requests. Close one first." };
  }

  const { error } = await supabase.from("wanted_requests").insert({
    user_id: user.id,
    title,
    category_slug: categorySlug,
    max_price: maxPrice,
    note
  });

  if (error) {
    console.error("Wanted request insert failed:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/app/wanted");
  return { success: true, message: "Request posted. We'll tell you when something matches." };
}

export async function closeWantedRequestAction(requestId: string): Promise<WantedActionState> {
  if (!isLiveMode) {
    return { success: true, message: "Request closed." };
  }

  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, message: "Something went wrong. Please try again." };
  }

  const { error } = await supabase
    .from("wanted_requests")
    .update({ status: "closed" })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/app/wanted");
  return { success: true, message: "Request closed." };
}
