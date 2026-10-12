alter table public.conversations
  add column if not exists buyer_unread_count integer not null default 0,
  add column if not exists seller_unread_count integer not null default 0;

create unique index if not exists conversations_listing_buyer_seller_idx
  on public.conversations(listing_id, buyer_id, seller_id);

do $$
begin
  alter table public.users
    add constraint users_auth_fkey
    foreign key (id)
    references auth.users(id)
    on delete cascade;
exception
  when duplicate_object then null;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_auth_user_created();

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

alter table public.universities enable row level security;
alter table public.allowed_email_domains enable row level security;
alter table public.university_verification_rules enable row level security;
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.view_events enable row level security;
alter table public.search_events enable row level security;
alter table public.recommendation_events enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.transactions enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.sponsored_placements enable row level security;
alter table public.promotion_purchases enable row level security;
alter table public.notifications enable row level security;
alter table public.waitlist_leads enable row level security;
alter table public.content_blocks enable row level security;
alter table public.pricing_settings enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists universities_public_read on public.universities;
create policy universities_public_read
  on public.universities for select
  using (true);

drop policy if exists allowed_domains_public_read on public.allowed_email_domains;
create policy allowed_domains_public_read
  on public.allowed_email_domains for select
  using (true);

drop policy if exists verification_rules_admin_read on public.university_verification_rules;
create policy verification_rules_admin_read
  on public.university_verification_rules for select
  using (public.is_admin());

drop policy if exists verification_rules_admin_write on public.university_verification_rules;
create policy verification_rules_admin_write
  on public.university_verification_rules for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists users_authenticated_read on public.users;
create policy users_authenticated_read
  on public.users for select
  using (auth.role() = 'authenticated');

drop policy if exists users_self_update on public.users;
create policy users_self_update
  on public.users for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_authenticated_read on public.profiles;
create policy profiles_authenticated_read
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update
  on public.profiles for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
  on public.categories for select
  using (true);

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists listings_public_read on public.listings;
create policy listings_public_read
  on public.listings for select
  using (
    status in ('active', 'reserved', 'sold')
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists listings_owner_insert on public.listings;
create policy listings_owner_insert
  on public.listings for insert
  with check (seller_id = auth.uid() or public.is_admin());

drop policy if exists listings_owner_update on public.listings;
create policy listings_owner_update
  on public.listings for update
  using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

drop policy if exists listing_images_public_read on public.listing_images;
create policy listing_images_public_read
  on public.listing_images for select
  using (true);

drop policy if exists listing_images_owner_write on public.listing_images;
create policy listing_images_owner_write
  on public.listing_images for all
  using (
    exists (
      select 1
      from public.listings
      where listings.id = listing_images.listing_id
        and (listings.seller_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.listings
      where listings.id = listing_images.listing_id
        and (listings.seller_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists favorites_owner_read on public.favorites;
create policy favorites_owner_read
  on public.favorites for select
  using (user_id = auth.uid());

drop policy if exists favorites_owner_write on public.favorites;
create policy favorites_owner_write
  on public.favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists view_events_owner_read on public.view_events;
create policy view_events_owner_read
  on public.view_events for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists view_events_owner_insert on public.view_events;
create policy view_events_owner_insert
  on public.view_events for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists search_events_owner_read on public.search_events;
create policy search_events_owner_read
  on public.search_events for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists search_events_owner_insert on public.search_events;
create policy search_events_owner_insert
  on public.search_events for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists recommendation_events_owner_read on public.recommendation_events;
create policy recommendation_events_owner_read
  on public.recommendation_events for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists recommendation_events_owner_insert on public.recommendation_events;
create policy recommendation_events_owner_insert
  on public.recommendation_events for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists conversations_participant_read on public.conversations;
create policy conversations_participant_read
  on public.conversations for select
  using (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists conversations_participant_insert on public.conversations;
create policy conversations_participant_insert
  on public.conversations for insert
  with check (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists conversations_participant_update on public.conversations;
create policy conversations_participant_update
  on public.conversations for update
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

drop policy if exists messages_participant_read on public.messages;
create policy messages_participant_read
  on public.messages for select
  using (
    exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.buyer_id = auth.uid()
          or conversations.seller_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists messages_participant_insert on public.messages;
create policy messages_participant_insert
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.buyer_id = auth.uid()
          or conversations.seller_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists messages_participant_update on public.messages;
create policy messages_participant_update
  on public.messages for update
  using (
    exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.buyer_id = auth.uid()
          or conversations.seller_id = auth.uid()
          or public.is_admin()
        )
    )
  )
  with check (
    exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.buyer_id = auth.uid()
          or conversations.seller_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists transactions_participant_access on public.transactions;
create policy transactions_participant_access
  on public.transactions for all
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

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read
  on public.reviews for select
  using (true);

drop policy if exists reviews_author_insert on public.reviews;
create policy reviews_author_insert
  on public.reviews for insert
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists reports_owner_read on public.reports;
create policy reports_owner_read
  on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists reports_owner_insert on public.reports;
create policy reports_owner_insert
  on public.reports for insert
  with check (reporter_id = auth.uid() or public.is_admin());

drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists moderation_actions_admin_access on public.moderation_actions;
create policy moderation_actions_admin_access
  on public.moderation_actions for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists sponsored_public_read on public.sponsored_placements;
create policy sponsored_public_read
  on public.sponsored_placements for select
  using (true);

drop policy if exists sponsored_admin_write on public.sponsored_placements;
create policy sponsored_admin_write
  on public.sponsored_placements for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists promotion_purchase_owner_read on public.promotion_purchases;
create policy promotion_purchase_owner_read
  on public.promotion_purchases for select
  using (seller_id = auth.uid() or public.is_admin());

drop policy if exists promotion_purchase_owner_insert on public.promotion_purchases;
create policy promotion_purchase_owner_insert
  on public.promotion_purchases for insert
  with check (seller_id = auth.uid() or public.is_admin());

drop policy if exists notifications_owner_access on public.notifications;
create policy notifications_owner_access
  on public.notifications for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists waitlist_admin_read on public.waitlist_leads;
create policy waitlist_admin_read
  on public.waitlist_leads for select
  using (public.is_admin());

drop policy if exists waitlist_public_insert on public.waitlist_leads;
create policy waitlist_public_insert
  on public.waitlist_leads for insert
  with check (true);

drop policy if exists content_blocks_public_read on public.content_blocks;
create policy content_blocks_public_read
  on public.content_blocks for select
  using (true);

drop policy if exists content_blocks_admin_write on public.content_blocks;
create policy content_blocks_admin_write
  on public.content_blocks for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists pricing_public_read on public.pricing_settings;
create policy pricing_public_read
  on public.pricing_settings for select
  using (true);

drop policy if exists pricing_admin_write on public.pricing_settings;
create policy pricing_admin_write
  on public.pricing_settings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists audit_logs_admin_access on public.audit_logs;
create policy audit_logs_admin_access
  on public.audit_logs for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists listing_images_public_read_storage on storage.objects;
create policy listing_images_public_read_storage
  on storage.objects for select
  using (bucket_id = 'listing-images');

drop policy if exists listing_images_owner_insert_storage on storage.objects;
create policy listing_images_owner_insert_storage
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
