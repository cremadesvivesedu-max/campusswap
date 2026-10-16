import { isLiveMode } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface WantedRequest {
  id: string;
  userId: string;
  title: string;
  categorySlug?: string;
  maxPrice?: number;
  note?: string;
  status: "open" | "closed";
  createdAt: string;
  requesterName: string;
  requesterAvatar?: string;
}

interface WantedRow {
  id: string;
  user_id: string;
  title: string;
  category_slug: string | null;
  max_price: number | string | null;
  note: string | null;
  status: "open" | "closed";
  created_at: string;
}

const demoRequests: WantedRequest[] = [
  {
    id: "wanted-demo-1",
    userId: "user-mila",
    title: "Women's city bike with lights",
    categorySlug: "bikes",
    maxPrice: 80,
    note: "Arriving 1 Feb, can pick up anywhere in Maastricht.",
    status: "open",
    createdAt: "2026-10-12T09:00:00.000Z",
    requesterName: "Mila Novak"
  },
  {
    id: "wanted-demo-2",
    userId: "user-sanne",
    title: "Duvet and pillow (single)",
    categorySlug: "essentials-daily-living",
    maxPrice: 25,
    status: "open",
    createdAt: "2026-10-10T18:30:00.000Z",
    requesterName: "Sanne Jacobs"
  },
  {
    id: "wanted-demo-3",
    userId: "user-lina",
    title: "Monitor 24 inch",
    categorySlug: "electronics",
    status: "open",
    createdAt: "2026-10-08T12:00:00.000Z",
    requesterName: "Lina Vermeer"
  }
];

async function attachRequesters(rows: WantedRow[]): Promise<WantedRequest[]> {
  if (!rows.length) return [];
  const admin = createAdminSupabaseClient();
  const ids = [...new Set(rows.map((row) => row.user_id))];
  const [profiles, users] = admin
    ? await Promise.all([
        admin.from("profiles").select("user_id, full_name").in("user_id", ids),
        admin.from("users").select("id, avatar_url").in("id", ids)
      ])
    : [{ data: [] }, { data: [] }];
  const names = new Map(
    ((profiles.data as { user_id: string; full_name: string | null }[] | null) ?? []).map((row) => [row.user_id, row.full_name])
  );
  const avatars = new Map(
    ((users.data as { id: string; avatar_url: string | null }[] | null) ?? []).map((row) => [row.id, row.avatar_url])
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    categorySlug: row.category_slug ?? undefined,
    maxPrice: row.max_price === null ? undefined : Number(row.max_price),
    note: row.note ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    requesterName: names.get(row.user_id) || "CampusSwap student",
    requesterAvatar: avatars.get(row.user_id) ?? undefined
  }));
}

/** Open requests, newest first. Returns [] (never throws) before the table exists. */
export async function getOpenWantedRequests(limit = 60): Promise<WantedRequest[]> {
  if (!isLiveMode) return demoRequests;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("wanted_requests")
    .select("id, user_id, title, category_slug, max_price, note, status, created_at")
    .eq("status", "open")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Wanted requests failed:", error.message);
    return [];
  }

  return attachRequesters((data as WantedRow[] | null) ?? []);
}
