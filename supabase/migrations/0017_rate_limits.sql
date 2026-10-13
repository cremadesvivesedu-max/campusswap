-- Anti-spam limits, enforced by the database so they also cover inserts made
-- straight from the browser (chat messages) or by scripts calling the API.
-- Errors start with "rate_limited:" so the app can show a friendly message.
-- Admins are exempt.

create or replace function public.enforce_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_column text := tg_argv[0];
  time_column text := tg_argv[1];
  short_window interval := tg_argv[2]::interval;
  short_max integer := tg_argv[3]::integer;
  long_window interval := tg_argv[4]::interval;
  long_max integer := tg_argv[5]::integer;
  owner_id uuid;
  recent_count integer;
begin
  if public.is_admin() then
    return new;
  end if;

  execute format('select ($1).%I', owner_column) into owner_id using new;
  if owner_id is null then
    return new;
  end if;

  execute format(
    'select count(*) from %I.%I where %I = $1 and %I > now() - $2',
    tg_table_schema, tg_table_name, owner_column, time_column
  ) into recent_count using owner_id, short_window;
  if recent_count >= short_max then
    raise exception 'rate_limited: % per %', short_max, short_window using errcode = 'P0001';
  end if;

  execute format(
    'select count(*) from %I.%I where %I = $1 and %I > now() - $2',
    tg_table_schema, tg_table_name, owner_column, time_column
  ) into recent_count using owner_id, long_window;
  if recent_count >= long_max then
    raise exception 'rate_limited: % per %', long_max, long_window using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- Chat: 40 messages per 10 minutes, 400 per day.
drop trigger if exists rate_limit_messages on public.messages;
create trigger rate_limit_messages
  before insert on public.messages
  for each row execute procedure public.enforce_rate_limit('sender_id', 'sent_at', '10 minutes', '40', '1 day', '400');

-- New chats: 15 per hour, 60 per day.
drop trigger if exists rate_limit_conversations on public.conversations;
create trigger rate_limit_conversations
  before insert on public.conversations
  for each row execute procedure public.enforce_rate_limit('buyer_id', 'created_at', '1 hour', '15', '1 day', '60');

-- Listings: 10 per hour, 40 per day.
drop trigger if exists rate_limit_listings on public.listings;
create trigger rate_limit_listings
  before insert on public.listings
  for each row execute procedure public.enforce_rate_limit('seller_id', 'created_at', '1 hour', '10', '1 day', '40');

-- Offers: 20 per hour, 80 per day.
drop trigger if exists rate_limit_listing_offers on public.listing_offers;
create trigger rate_limit_listing_offers
  before insert on public.listing_offers
  for each row execute procedure public.enforce_rate_limit('buyer_id', 'created_at', '1 hour', '20', '1 day', '80');

-- Reports and support tickets: 10 per hour, 30 per day.
drop trigger if exists rate_limit_reports on public.reports;
create trigger rate_limit_reports
  before insert on public.reports
  for each row execute procedure public.enforce_rate_limit('reporter_id', 'created_at', '1 hour', '10', '1 day', '30');

drop trigger if exists rate_limit_support_tickets on public.support_tickets;
create trigger rate_limit_support_tickets
  before insert on public.support_tickets
  for each row execute procedure public.enforce_rate_limit('user_id', 'created_at', '1 hour', '10', '1 day', '30');

-- The limit queries look up recent rows per person; make them cheap.
create index if not exists messages_sender_sent_idx on public.messages (sender_id, sent_at desc);
create index if not exists conversations_buyer_created_idx on public.conversations (buyer_id, created_at desc);
create index if not exists listings_seller_created_idx on public.listings (seller_id, created_at desc);
create index if not exists listing_offers_buyer_created_idx on public.listing_offers (buyer_id, created_at desc);
create index if not exists reports_reporter_created_idx on public.reports (reporter_id, created_at desc);
