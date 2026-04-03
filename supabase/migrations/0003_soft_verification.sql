alter type verification_status rename value 'rejected' to 'unverified';

alter table public.users
  alter column verification_status set default 'unverified';

alter table public.university_verification_rules
  alter column block_posting_until_verified set default false,
  alter column block_messaging_until_verified set default false;

update public.university_verification_rules
set
  block_posting_until_verified = false,
  block_messaging_until_verified = false,
  updated_at = now();

update public.users as u
set
  verification_status = case
    when exists (
      select 1
      from public.allowed_email_domains as d
      where lower(d.domain) = split_part(lower(u.email), '@', 2)
        and d.auto_verify = true
    ) then 'verified'::verification_status
    when exists (
      select 1
      from public.allowed_email_domains as d
      where lower(d.domain) = split_part(lower(u.email), '@', 2)
    ) then 'pending'::verification_status
    else 'unverified'::verification_status
  end,
  updated_at = now();

update public.profiles as p
set
  verified_badge = exists (
    select 1
    from public.users as u
    where u.id = p.user_id
      and u.verification_status = 'verified'
  ),
  updated_at = now();
