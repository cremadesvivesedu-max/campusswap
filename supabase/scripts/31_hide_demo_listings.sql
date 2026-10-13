-- #31 Remove the demo (seed) listings from the real site.
-- Run in the Supabase SQL Editor, one step at a time. Nothing is deleted: listings
-- are hidden and marked as removed, so step 4 can bring them back.

-- 1) LOOK FIRST (read-only): demo accounts and their listings.
select u.email, l.title, l.price, l.status, l.created_at::date, l.removed_at is not null as already_removed
from public.listings l
join public.users u on u.id = l.seller_id
where u.email in (
  'lina@student.maastrichtuniversity.nl',
  'omar@student.maastrichtuniversity.nl',
  'sanne@zuyd.nl',
  'mila@student.maastrichtuniversity.nl',
  'ops@campusswap.app',
  'future@student.maastrichtuniversity.nl'
)
order by u.email, l.created_at;

-- 2) CHECK (read-only): has any REAL person interacted with those listings?
--    If these numbers are not 0, tell Claude before step 3.
with demo_users as (
  select id from public.users where email in (
    'lina@student.maastrichtuniversity.nl', 'omar@student.maastrichtuniversity.nl',
    'sanne@zuyd.nl', 'mila@student.maastrichtuniversity.nl',
    'ops@campusswap.app', 'future@student.maastrichtuniversity.nl')
), demo_listings as (
  select id from public.listings where seller_id in (select id from demo_users)
)
select
  (select count(*) from public.favorites
     where listing_id in (select id from demo_listings)
       and user_id not in (select id from demo_users)) as real_favorites,
  (select count(*) from public.conversations
     where listing_id in (select id from demo_listings)
       and buyer_id not in (select id from demo_users)) as real_conversations,
  (select count(*) from public.transactions
     where listing_id in (select id from demo_listings)
       and buyer_id not in (select id from demo_users)) as real_transactions;

-- 3) HIDE the demo listings (only after checking steps 1 and 2).
-- update public.listings
-- set status = 'hidden', removed_at = now(), updated_at = now()
-- where removed_at is null
--   and seller_id in (select id from public.users where email in (
--     'lina@student.maastrichtuniversity.nl', 'omar@student.maastrichtuniversity.nl',
--     'sanne@zuyd.nl', 'mila@student.maastrichtuniversity.nl',
--     'ops@campusswap.app', 'future@student.maastrichtuniversity.nl'));

-- 4) UNDO (only if needed): bring them back as active.
-- update public.listings
-- set status = 'active', removed_at = null, updated_at = now()
-- where seller_id in (select id from public.users where email in (
--     'lina@student.maastrichtuniversity.nl', 'omar@student.maastrichtuniversity.nl',
--     'sanne@zuyd.nl', 'mila@student.maastrichtuniversity.nl',
--     'ops@campusswap.app', 'future@student.maastrichtuniversity.nl'));

-- Note: ops@campusswap.app is in the demo seed with role admin. Your own admin account
-- is a different one, so it is not affected. Consider also changing the demo passwords
-- (pending item) or removing those accounts in Authentication > Users.
