-- 0024 Funnel counters and university email verification (17/11/2026)
--
-- 1. funnel_daily: one row per day with the number of visits (page loads).
--    Only a number per day: no ids, no IP, no cookies.
-- 2. funnel_weeks(): visits → sign-ups → listings → sales per week, used by
--    /admin and by the n8n alert (service_role only).
-- 3. University email verification for people who signed up with another
--    address (e.g. Google): a 6-digit code is emailed to the university
--    address. The address is kept only until the code is used or expires;
--    afterwards we keep a keyed hash of it (HMAC-SHA-256, key only in the
--    server env; columns keep the *_sha256 name) so one university address
--    can't verify many accounts, plus the date.
-- 4. maastrichtuniversity.nl (staff, PhD) joins student.maastrichtuniversity.nl.

-- 1 ---------------------------------------------------------------------
create table if not exists public.funnel_daily (
  day date primary key,
  visits integer not null default 0
);
alter table public.funnel_daily enable row level security;
revoke all on public.funnel_daily from anon, authenticated;

create or replace function public.bump_funnel_visit()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.funnel_daily (day, visits)
  values ((now() at time zone 'Europe/Amsterdam')::date, 1)
  on conflict (day) do update set visits = public.funnel_daily.visits + 1;
$$;
revoke execute on function public.bump_funnel_visit() from public, anon, authenticated;
grant execute on function public.bump_funnel_visit() to service_role;

-- 2 ---------------------------------------------------------------------
create or replace function public.funnel_weeks(p_weeks integer default 6)
returns table (
  week_start date,
  visits bigint,
  signups bigint,
  listings bigint,
  sales bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with weeks as (
    select (date_trunc('week', (now() at time zone 'Europe/Amsterdam')) - make_interval(weeks => g))::date as week_start
    from generate_series(0, greatest(1, least(p_weeks, 52)) - 1) as g
  ),
  real_users as (
    select id, created_at from public.users
    where role <> 'admin' and email not ilike '%@campusswap.app'
  )
  select
    w.week_start,
    coalesce((select sum(f.visits) from public.funnel_daily f
              where f.day >= w.week_start and f.day < w.week_start + 7), 0),
    (select count(*) from real_users u
      where (u.created_at at time zone 'Europe/Amsterdam')::date >= w.week_start
        and (u.created_at at time zone 'Europe/Amsterdam')::date < w.week_start + 7),
    (select count(*) from public.listings l
      join real_users u on u.id = l.seller_id
      where (l.created_at at time zone 'Europe/Amsterdam')::date >= w.week_start
        and (l.created_at at time zone 'Europe/Amsterdam')::date < w.week_start + 7),
    (select count(*) from public.transactions t
      join real_users u on u.id = t.seller_id
      where t.state = 'completed' and t.completed_at is not null
        and (t.completed_at at time zone 'Europe/Amsterdam')::date >= w.week_start
        and (t.completed_at at time zone 'Europe/Amsterdam')::date < w.week_start + 7)
    + (select count(*) from public.listings l
      join real_users u on u.id = l.seller_id
      where l.status = 'sold'
        and (l.updated_at at time zone 'Europe/Amsterdam')::date >= w.week_start
        and (l.updated_at at time zone 'Europe/Amsterdam')::date < w.week_start + 7
        and not exists (select 1 from public.transactions t
                        where t.listing_id = l.id and t.state = 'completed'))
  from weeks w
  order by w.week_start desc;
$$;
revoke execute on function public.funnel_weeks(integer) from public, anon, authenticated;
grant execute on function public.funnel_weeks(integer) to service_role;

-- 3 ---------------------------------------------------------------------
create table if not exists public.university_email_codes (
  user_id uuid primary key references public.users(id) on delete cascade,
  email text not null,
  code_sha256 text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  sent_at timestamptz not null default now()
);
alter table public.university_email_codes enable row level security;
revoke all on public.university_email_codes from anon, authenticated;

alter table public.users
  add column if not exists university_email_sha256 text,
  add column if not exists university_verified_at timestamptz;
create unique index if not exists users_university_email_sha256_key
  on public.users (university_email_sha256)
  where university_email_sha256 is not null;

-- Only our server may set these (otherwise someone could "reserve" another
-- student's address by writing its hash into their own row).
create or replace function public.protect_university_email_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    if new.university_email_sha256 is distinct from old.university_email_sha256
      or new.university_verified_at is distinct from old.university_verified_at then
      raise exception 'university verification can only be changed by CampusSwap';
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.protect_university_email_columns() from public, anon, authenticated;
drop trigger if exists protect_university_email_columns on public.users;
create trigger protect_university_email_columns
  before update on public.users
  for each row execute function public.protect_university_email_columns();

-- 4 ---------------------------------------------------------------------
insert into public.allowed_email_domains (university_id, domain, auto_verify)
select d.university_id, 'maastrichtuniversity.nl', true
from public.allowed_email_domains d
where d.domain = 'student.maastrichtuniversity.nl'
  and not exists (select 1 from public.allowed_email_domains where domain = 'maastrichtuniversity.nl')
limit 1;
