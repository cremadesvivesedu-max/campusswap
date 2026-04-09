do $$
begin
  create type public.offer_status as enum (
    'open',
    'countered',
    'accepted',
    'rejected',
    'expired',
    'withdrawn'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.listing_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  buyer_id uuid not null references public.users(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  created_by_user_id uuid not null references public.users(id) on delete cascade,
  parent_offer_id uuid references public.listing_offers(id) on delete set null,
  amount numeric(10,2) not null,
  state public.offer_status not null default 'open',
  expires_at timestamptz not null default (now() + interval '72 hours'),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listing_offers_conversation_updated_idx
  on public.listing_offers(conversation_id, updated_at desc);

create index if not exists listing_offers_transaction_idx
  on public.listing_offers(transaction_id, updated_at desc);

create unique index if not exists listing_offers_open_per_conversation_uidx
  on public.listing_offers(conversation_id)
  where state = 'open';

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  dedupe_key text not null,
  notification_type public.notification_type not null,
  created_at timestamptz not null default now()
);

create unique index if not exists notification_events_dedupe_uidx
  on public.notification_events(dedupe_key);

create index if not exists notification_events_user_created_idx
  on public.notification_events(user_id, created_at desc);

alter table public.listing_offers enable row level security;
alter table public.notification_events enable row level security;

drop policy if exists listing_offers_participant_read on public.listing_offers;
create policy listing_offers_participant_read
  on public.listing_offers for select
  using (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists listing_offers_participant_insert on public.listing_offers;
create policy listing_offers_participant_insert
  on public.listing_offers for insert
  with check (
    created_by_user_id = auth.uid()
    and (
      buyer_id = auth.uid()
      or seller_id = auth.uid()
      or public.is_admin()
    )
  );

drop policy if exists listing_offers_participant_update on public.listing_offers;
create policy listing_offers_participant_update
  on public.listing_offers for update
  using (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or public.is_admin()
  )
  with check (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists notification_events_owner_read on public.notification_events;
create policy notification_events_owner_read
  on public.notification_events for select
  using (user_id = auth.uid() or public.is_admin());

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'listing_offers'
    ) then
      alter publication supabase_realtime add table public.listing_offers;
    end if;
  end if;
end
$$;
