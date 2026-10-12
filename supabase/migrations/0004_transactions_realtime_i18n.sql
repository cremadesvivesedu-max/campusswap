alter table public.listings
  add column if not exists removed_at timestamptz,
  add column if not exists removed_by uuid references public.users(id);

alter table public.transactions
  alter column meetup_spot set default 'To be agreed in chat',
  alter column meetup_window set default 'To be scheduled';

alter table public.transactions
  add column if not exists conversation_id uuid references public.conversations(id),
  add column if not exists amount numeric(10,2) not null default 0,
  add column if not exists reserved_at timestamptz,
  add column if not exists cancelled_at timestamptz;

create unique index if not exists transactions_conversation_id_uidx
  on public.transactions(conversation_id)
  where conversation_id is not null;

create index if not exists transactions_listing_state_idx
  on public.transactions(listing_id, state);

create unique index if not exists reviews_transaction_author_uidx
  on public.reviews(transaction_id, author_id);

update public.transactions as transaction_row
set
  amount = listing_row.price,
  conversation_id = coalesce(transaction_row.conversation_id, conversation_row.id),
  reserved_at = case
    when transaction_row.state = 'reserved' and transaction_row.reserved_at is null
      then coalesce(transaction_row.updated_at, now())
    else transaction_row.reserved_at
  end,
  cancelled_at = case
    when transaction_row.state = 'cancelled' and transaction_row.cancelled_at is null
      then coalesce(transaction_row.updated_at, now())
    else transaction_row.cancelled_at
  end
from public.listings as listing_row
left join public.conversations as conversation_row
  on conversation_row.listing_id = transaction_row.listing_id
 and conversation_row.buyer_id = transaction_row.buyer_id
 and conversation_row.seller_id = transaction_row.seller_id
where listing_row.id = transaction_row.listing_id;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  signup_domain text;
  domain_match record;
  verification verification_status;
  inferred_university text;
begin
  signup_domain := lower(split_part(new.email, '@', 2));

  select d.domain, d.auto_verify, u.name
  into domain_match
  from public.allowed_email_domains d
  join public.universities u on u.id = d.university_id
  where lower(d.domain) = signup_domain
  limit 1;

  verification := case
    when domain_match.domain is null then 'unverified'
    when domain_match.auto_verify = true then 'verified'
    else 'pending'
  end;

  inferred_university := coalesce(
    nullif(new.raw_user_meta_data ->> 'university', ''),
    domain_match.name,
    'CampusSwap'
  );

  insert into public.users (
    id,
    email,
    role,
    verification_status,
    joined_at,
    last_seen_at
  )
  values (
    new.id,
    new.email,
    'student',
    verification,
    coalesce(new.created_at, now()),
    coalesce(new.last_sign_in_at, now())
  )
  on conflict (id) do update
    set email = excluded.email,
        verification_status = excluded.verification_status,
        last_seen_at = excluded.last_seen_at,
        updated_at = now();

  insert into public.profiles (
    user_id,
    full_name,
    university,
    student_status,
    neighborhood,
    bio,
    preferred_categories,
    buyer_intent,
    seller_intent,
    notification_preferences,
    verified_badge
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    inferred_university,
    coalesce(nullif(new.raw_user_meta_data ->> 'student_status', ''), 'current'),
    coalesce(nullif(new.raw_user_meta_data ->> 'neighborhood', ''), 'Maastricht'),
    coalesce(new.raw_user_meta_data ->> 'bio', ''),
    '[]'::jsonb,
    true,
    false,
    '["messages","listing_updates"]'::jsonb,
    verification = 'verified'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.handle_message_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  conversation_row public.conversations%rowtype;
begin
  select *
  into conversation_row
  from public.conversations
  where id = new.conversation_id
  for update;

  if not found then
    return new;
  end if;

  if new.sender_id = conversation_row.buyer_id then
    update public.conversations
    set
      buyer_unread_count = 0,
      seller_unread_count = coalesce(conversation_row.seller_unread_count, 0) + 1,
      unread_count = coalesce(conversation_row.seller_unread_count, 0) + 1,
      updated_at = coalesce(new.sent_at, now())
    where id = new.conversation_id;
  else
    update public.conversations
    set
      seller_unread_count = 0,
      buyer_unread_count = coalesce(conversation_row.buyer_unread_count, 0) + 1,
      unread_count = coalesce(conversation_row.buyer_unread_count, 0) + 1,
      updated_at = coalesce(new.sent_at, now())
    where id = new.conversation_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;

create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.handle_message_created();

drop policy if exists listings_public_read on public.listings;
create policy listings_public_read
  on public.listings for select
  using (
    status in ('active', 'reserved', 'sold')
    or seller_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.conversations
      where conversations.listing_id = listings.id
        and (
          conversations.buyer_id = auth.uid()
          or conversations.seller_id = auth.uid()
        )
    )
    or exists (
      select 1
      from public.transactions
      where transactions.listing_id = listings.id
        and (
          transactions.buyer_id = auth.uid()
          or transactions.seller_id = auth.uid()
        )
    )
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'messages'
    ) then
      alter publication supabase_realtime add table public.messages;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'conversations'
    ) then
      alter publication supabase_realtime add table public.conversations;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'transactions'
    ) then
      alter publication supabase_realtime add table public.transactions;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'listings'
    ) then
      alter publication supabase_realtime add table public.listings;
    end if;
  end if;
end $$;
