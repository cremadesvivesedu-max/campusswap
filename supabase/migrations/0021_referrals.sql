-- "Invite a friend": every user gets a short code taken from their id, and each new
-- account that arrived through someone's link is recorded once.
alter table public.users
  add column if not exists referral_code text
  generated always as (substr(replace(id::text, '-', ''), 1, 8)) stored;

create unique index if not exists users_referral_code_uidx
  on public.users(referral_code);

create table if not exists public.referrals (
  referred_id uuid primary key references public.users(id) on delete cascade,
  referrer_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (referred_id <> referrer_id)
);

create index if not exists referrals_referrer_idx
  on public.referrals(referrer_id, created_at desc);

alter table public.referrals enable row level security;

-- Writes happen on the server (service role); people can see their own rows.
drop policy if exists referrals_participant_read on public.referrals;
create policy referrals_participant_read
  on public.referrals for select
  using (referrer_id = auth.uid() or referred_id = auth.uid() or public.is_admin());
