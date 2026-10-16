"use server";

import { demoData } from "@/lib/demo-data";
import { isLiveMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { suggestPrice, type PricePoint, type PriceSuggestion } from "@/features/listings/price-suggestion";

/** "Similar items sell for 15–25 €" on the sell form, from real CampusSwap listings. */
export async function getPriceSuggestionAction(
  categorySlug: string,
  title: string,
  excludeListingId?: string
): Promise<PriceSuggestion | null> {
  if (!categorySlug) {
    return null;
  }

  if (!isLiveMode) {
    return suggestPrice(
      title,
      demoData.listings
        .filter((listing) => listing.categorySlug === categorySlug && listing.id !== excludeListingId)
        .map((listing) => ({ title: listing.title, price: listing.price, sold: listing.status === "sold" }))
    );
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (!category?.id) {
    return null;
  }

  let query = supabase
    .from("listings")
    .select("title, price, status")
    .eq("category_id", category.id)
    .in("status", ["active", "reserved", "sold"])
    .order("created_at", { ascending: false })
    .limit(300);

  if (excludeListingId) {
    query = query.neq("id", excludeListingId);
  }

  const { data } = await query;
  const points: PricePoint[] = ((data as { title: string; price: number | string; status: string }[] | null) ?? []).map(
    (row) => ({ title: row.title, price: Number(row.price), sold: row.status === "sold" })
  );

  return suggestPrice(title, points);
}
