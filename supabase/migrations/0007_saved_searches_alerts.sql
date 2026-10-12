create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(200) not null,
  query text,
  category_slug varchar(120),
  subcategory_slug varchar(120),
  price_min numeric(10,2),
  price_max numeric(10,2),
  conditions jsonb not null default '[]'::jsonb,
  outlet_only boolean not null default false,
  featured_only boolean not null default false,
  minimum_seller_rating numeric(3,2),
  pickup_area varchar(160),
  distance_bucket varchar(30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_searches_user_created_idx
  on public.saved_searches(user_id, created_at desc);

create table if not exists public.listing_alert_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  saved_search_id uuid references public.saved_searches(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  event_type varchar(40) not null,
  dedupe_key text not null,
  price_from numeric(10,2),
  price_to numeric(10,2),
  created_at timestamptz not null default now()
);

create unique index if not exists listing_alert_events_dedupe_uidx
  on public.listing_alert_events(dedupe_key);

create index if not exists listing_alert_events_user_created_idx
  on public.listing_alert_events(user_id, created_at desc);

alter table public.saved_searches enable row level security;
alter table public.listing_alert_events enable row level security;

drop policy if exists saved_searches_owner_access on public.saved_searches;
create policy saved_searches_owner_access
  on public.saved_searches for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists listing_alert_events_owner_read on public.listing_alert_events;
create policy listing_alert_events_owner_read
  on public.listing_alert_events for select
  using (user_id = auth.uid() or public.is_admin());
