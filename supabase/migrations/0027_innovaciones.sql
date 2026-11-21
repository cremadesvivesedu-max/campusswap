-- 0027 Seller tools and campus impact (21/11/2026)
--
--  1. Hidden minimum price: offers at or above it are accepted automatically.
--     It lives in its own table so buyers can never read it (listings are public).
--  2. 48-hour moving-out clearance: the seller cuts the price once and a
--     countdown shows until clearance_until. The original price is kept for display.
--  3. Bump: a paid "move back to the top" (EUR 0.99). sort_at = latest of created/bumped.
--  4. Residence on the user, for the CO2 ranking and ambassadors per residence.
--
-- Numbered 0027 on purpose: 0025/0026 belong to the security review of 18/11.

-- 1. Hidden minimum price ------------------------------------------------------
create table if not exists public.listing_auto_accept (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  min_amount numeric(10, 2) not null check (min_amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.listing_auto_accept enable row level security;
revoke all on public.listing_auto_accept from anon, authenticated;
grant select on public.listing_auto_accept to authenticated;
drop policy if exists listing_auto_accept_owner_read on public.listing_auto_accept;
create policy listing_auto_accept_owner_read on public.listing_auto_accept
  for select to authenticated using (seller_id = auth.uid());

drop trigger if exists zz_require_server_write on public.listing_auto_accept;
create trigger zz_require_server_write before insert or update or delete on public.listing_auto_accept
  for each statement execute function app_private.require_server_write();

-- 2. Clearance -----------------------------------------------------------------
alter table public.listings add column if not exists clearance_until timestamptz;
alter table public.listings add column if not exists clearance_original_price numeric(10, 2)
  check (clearance_original_price is null or clearance_original_price > 0);

-- 3. Bump ----------------------------------------------------------------------
alter type public.promotion_type add value if not exists 'bump';
alter table public.listings add column if not exists bumped_at timestamptz;
alter table public.listings add column if not exists sort_at timestamptz
  generated always as (coalesce(greatest(bumped_at, created_at), created_at)) stored;
create index if not exists listings_sort_at_idx on public.listings (sort_at desc);

-- 4. Residence -----------------------------------------------------------------
alter table public.users add column if not exists residence text
  check (residence is null or residence ~ '^[a-z0-9-]{2,40}$');

-- 0023 grants users columns one by one: the new column needs its own grant,
-- or "select *" on users would fail for signed-in people (and anon after 0026).
grant select (residence) on public.users to authenticated;
do $$
begin
  if exists (
    select 1 from information_schema.column_privileges
     where table_schema = 'public' and table_name = 'users' and grantee = 'anon'
  ) then
    execute 'grant select (residence) on public.users to anon';
  end if;
end;
$$;
