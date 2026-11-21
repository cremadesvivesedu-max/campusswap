import { cache } from "react";
import { isLiveMode } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { shortName } from "@/features/referrals/code";
import { ambassadorLevel, co2ForCategory, rankResidences, type ResidenceRow } from "@/features/impact/seller-tools";

// CO2 per person and per residence, and ambassadors. Read with the admin client on the
// server only; nothing here exposes who bought what: just totals and first names.

export interface MyImpact {
  items: number;
  kg: number;
  residence: string | null;
}

export interface AmbassadorRow {
  userId: string;
  name: string;
  residence: string | null;
  invites: number;
  level: "gold" | "ambassador";
}

export const getMyResidence = cache(async (userId: string): Promise<string | null> => {
  if (!isLiveMode) return null;
  const admin = createAdminSupabaseClient();
  if (!admin) return null;
  const { data } = await admin.from("users").select("residence").eq("id", userId).maybeSingle();
  return (data?.residence as string | null) ?? null;
});

type SoldRow = { seller_id: string; category: { slug: string } | null };

/** Items this person sold (marked sold) plus items they bought in a completed exchange. */
export async function getMyImpact(userId: string): Promise<MyImpact> {
  if (!isLiveMode) return { items: 3, kg: 153, residence: null };
  const admin = createAdminSupabaseClient();
  if (!admin) return { items: 0, kg: 0, residence: null };

  const [{ data: sold }, { data: bought }, residence] = await Promise.all([
    admin.from("listings").select("category:categories(slug)").eq("seller_id", userId).eq("status", "sold").limit(1000),
    admin
      .from("transactions")
      .select("listing:listings(category:categories(slug))")
      .eq("buyer_id", userId)
      .eq("state", "completed")
      .limit(1000),
    getMyResidence(userId)
  ]);

  const slugs = [
    ...((sold as unknown as { category: { slug: string } | null }[] | null) ?? []).map((row) => row.category?.slug),
    ...((bought as unknown as { listing: { category: { slug: string } | null } | null }[] | null) ?? []).map(
      (row) => row.listing?.category?.slug
    )
  ];
  return { items: slugs.length, kg: slugs.reduce((sum, slug) => sum + co2ForCategory(slug), 0), residence };
}

/** CO2 saved per residence, from listings sold by people who live there. */
export async function getResidenceRanking(): Promise<ResidenceRow[]> {
  if (!isLiveMode) {
    return rankResidences([
      { residence: "the-ed", items: 14, kg: 612 },
      { residence: "randwyck", items: 9, kg: 388 },
      { residence: "guesthouse-um", items: 6, kg: 240 }
    ]);
  }
  const admin = createAdminSupabaseClient();
  if (!admin) return [];

  const { data: users } = await admin.from("users").select("id, residence").not("residence", "is", null).limit(10000);
  const residenceOf = new Map(((users as { id: string; residence: string }[] | null) ?? []).map((row) => [row.id, row.residence]));
  if (!residenceOf.size) return [];

  const { data: sold } = await admin
    .from("listings")
    .select("seller_id, category:categories(slug)")
    .eq("status", "sold")
    .in("seller_id", [...residenceOf.keys()].slice(0, 1000))
    .limit(10000);

  const totals = new Map<string, ResidenceRow>();
  for (const row of (sold as unknown as SoldRow[] | null) ?? []) {
    const residence = residenceOf.get(row.seller_id);
    if (!residence) continue;
    const current = totals.get(residence) ?? { residence, items: 0, kg: 0 };
    current.items += 1;
    current.kg += co2ForCategory(row.category?.slug);
    totals.set(residence, current);
  }
  return rankResidences([...totals.values()]);
}

/** Everyone with 5+ friends who joined through their link, best first (first name + initial). */
export async function getAmbassadors(limit = 20): Promise<AmbassadorRow[]> {
  if (!isLiveMode) {
    return [
      { userId: "user-lina", name: "Lina V.", residence: "the-ed", invites: 16, level: "gold" },
      { userId: "user-sanne", name: "Sanne J.", residence: "randwyck", invites: 7, level: "ambassador" }
    ];
  }
  const admin = createAdminSupabaseClient();
  if (!admin) return [];
  const { data } = await admin.from("referrals").select("referrer_id").limit(20000);
  const counts = new Map<string, number>();
  for (const row of (data as { referrer_id: string }[] | null) ?? []) {
    counts.set(row.referrer_id, (counts.get(row.referrer_id) ?? 0) + 1);
  }
  const top = [...counts.entries()].filter(([, n]) => ambassadorLevel(n)).sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (!top.length) return [];
  const ids = top.map(([id]) => id);
  const [{ data: profiles }, { data: users }] = await Promise.all([
    admin.from("profiles").select("user_id, full_name").in("user_id", ids),
    admin.from("users").select("id, residence").in("id", ids)
  ]);
  const names = new Map(((profiles as { user_id: string; full_name: string | null }[] | null) ?? []).map((row) => [row.user_id, row.full_name ?? ""]));
  const residences = new Map(((users as { id: string; residence: string | null }[] | null) ?? []).map((row) => [row.id, row.residence]));
  return top.map(([id, invites]) => ({
    userId: id,
    name: shortName(names.get(id) || "Student"),
    residence: residences.get(id) ?? null,
    invites,
    level: ambassadorLevel(invites) as "gold" | "ambassador"
  }));
}
