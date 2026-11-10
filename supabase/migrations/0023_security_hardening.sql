-- 0023 Security hardening (10/11/2026)
--
-- Closes holes that let a signed-in user talk to the database directly with
-- the public key and their own session, skipping the checks in our server code:
--   1. Writes to business tables now only work when they come from our server
--      (header x-campusswap-server, checked against a hash stored here).
--      Browser writes stay allowed only where the live chat needs them.
--   2. Nobody can make themselves admin, "verified" or change Stripe fields.
--   3. Emails and Stripe account ids in public.users are no longer readable.
--   4. Chat messages can't be edited (only marked as read); conversations can
--      only be opened as the buyer of a real listing.
--   5. Chat attachments can't be listed by strangers any more.
--
-- Safe to run before the server token is configured: until a row exists in
-- app_private.server_tokens, point 1 keeps the old behaviour.

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create table if not exists app_private.server_tokens (
  token_sha256 text primary key,
  note text,
  created_at timestamptz not null default now()
);
revoke all on app_private.server_tokens from public, anon, authenticated;

create or replace function app_private.is_trusted_server()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  headers_raw text := current_setting('request.headers', true);
  presented text;
begin
  if not exists (select 1 from app_private.server_tokens) then
    return true;
  end if;
  if headers_raw is null or headers_raw = '' then
    return false;
  end if;
  presented := headers_raw::json ->> 'x-campusswap-server';
  if presented is null or presented = '' then
    return false;
  end if;
  return exists (
    select 1 from app_private.server_tokens
    where token_sha256 = encode(sha256(convert_to(presented, 'UTF8')), 'hex')
  );
end;
$$;

-- True only for requests made with the public key (browser or server session),
-- not for the service role, the SQL editor or Supabase's own auth service.
-- Writes done by our own trigger functions (nested triggers) are trusted.
create or replace function app_private.is_untrusted_client()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.role(), '') in ('anon', 'authenticated')
    and pg_trigger_depth() <= 1
    and not app_private.is_trusted_server();
$$;

-- 1. Server-only writes --------------------------------------------------------

create or replace function app_private.require_server_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if app_private.is_untrusted_client() then
    raise exception 'Direct database writes are not allowed on %', tg_table_name
      using errcode = '42501';
  end if;
  return null;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users', 'profiles', 'transactions', 'shipments', 'listings', 'listing_images',
    'listing_tags', 'listing_offers', 'reviews', 'promotion_purchases', 'notifications',
    'favorites', 'saved_searches', 'support_tickets', 'reports', 'wanted_requests',
    'push_subscriptions', 'referrals', 'waitlist_leads', 'search_events', 'view_events',
    'recommendation_events', 'app_events', 'app_error_logs', 'audit_logs',
    'moderation_actions', 'categories', 'content_blocks', 'pricing_settings',
    'sponsored_placements', 'university_verification_rules', 'allowed_email_domains',
    'universities', 'blocked_users', 'user_blocks'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('drop trigger if exists zz_require_server_write on public.%I', table_name);
      execute format(
        'create trigger zz_require_server_write before insert or update or delete on public.%I
           for each statement execute function app_private.require_server_write()',
        table_name
      );
    end if;
  end loop;
end;
$$;

-- 2. Privileged columns on users ------------------------------------------------

create or replace function app_private.protect_user_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_admin() then
    if new.role is distinct from old.role
      or new.verification_status is distinct from old.verification_status
      or new.email is distinct from old.email
      or new.stripe_connected_account_id is distinct from old.stripe_connected_account_id
      or new.stripe_details_submitted is distinct from old.stripe_details_submitted
      or new.stripe_charges_enabled is distinct from old.stripe_charges_enabled
      or new.stripe_transfers_enabled is distinct from old.stripe_transfers_enabled
      or new.stripe_payouts_enabled is distinct from old.stripe_payouts_enabled
      or new.stripe_onboarding_completed_at is distinct from old.stripe_onboarding_completed_at
      or new.id is distinct from old.id then
      raise exception 'These account fields can only be changed by CampusSwap'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_user_privileges on public.users;
create trigger protect_user_privileges
  before update on public.users
  for each row execute function app_private.protect_user_privileges();

-- 3. Hide emails and Stripe ids -------------------------------------------------

revoke select on public.users from anon, authenticated;

do $$
declare
  readable text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into readable
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'users'
    and column_name not in ('email', 'stripe_connected_account_id');

  execute format('grant select (%s) on public.users to authenticated', readable);
end;
$$;

-- 4. Chat: messages can only be marked as read; conversations need a real listing

create or replace function app_private.protect_message_edits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if app_private.is_untrusted_client() then
    if (to_jsonb(new) - 'read') is distinct from (to_jsonb(old) - 'read') then
      raise exception 'Messages cannot be edited' using errcode = '42501';
    end if;
    if new.read is distinct from old.read and old.sender_id = auth.uid() then
      raise exception 'Only the recipient can mark a message as read' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_message_edits on public.messages;
create trigger protect_message_edits
  before update on public.messages
  for each row execute function app_private.protect_message_edits();

create or replace function app_private.protect_conversations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if app_private.is_untrusted_client() then
    if tg_op = 'INSERT' then
      if new.buyer_id is distinct from auth.uid()
        or new.seller_id is distinct from (
          select l.seller_id from public.listings l where l.id = new.listing_id
        )
        or new.buyer_id = new.seller_id then
        raise exception 'Conversations must be opened by the buyer of a listing'
          using errcode = '42501';
      end if;
      new.blocked_by := null;
    else
      if (to_jsonb(new) - array['unread_count', 'buyer_unread_count', 'seller_unread_count', 'updated_at'])
        is distinct from
        (to_jsonb(old) - array['unread_count', 'buyer_unread_count', 'seller_unread_count', 'updated_at']) then
        raise exception 'Only unread counters can be changed here' using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_conversations on public.conversations;
create trigger protect_conversations
  before insert or update on public.conversations
  for each row execute function app_private.protect_conversations();

-- 5. Chat attachments: only the two people in the conversation can list them ---

drop policy if exists message_attachments_public_read on storage.objects;
drop policy if exists message_attachments_participant_read on storage.objects;
create policy message_attachments_participant_read
  on storage.objects for select
  using (
    bucket_id = 'message-attachments'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[2]
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

revoke execute on function app_private.is_trusted_server() from public, anon, authenticated;
revoke execute on function app_private.is_untrusted_client() from public, anon, authenticated;
