do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'seller_payout_status'
  ) then
    create type public.seller_payout_status as enum (
      'blocked',
      'ready',
      'paid_to_connected_account'
    );
  end if;
end
$$;

alter table public.users
  add column if not exists stripe_connected_account_id text,
  add column if not exists stripe_details_submitted boolean not null default false,
  add column if not exists stripe_charges_enabled boolean not null default false,
  add column if not exists stripe_transfers_enabled boolean not null default false,
  add column if not exists stripe_payouts_enabled boolean not null default false,
  add column if not exists stripe_onboarding_completed_at timestamp with time zone;

create unique index if not exists users_stripe_connected_account_uidx
  on public.users(stripe_connected_account_id)
  where stripe_connected_account_id is not null;

alter table public.transactions
  add column if not exists seller_stripe_account_id text,
  add column if not exists seller_net_amount numeric(10, 2) not null default 0,
  add column if not exists seller_payout_status public.seller_payout_status not null default 'blocked';

update public.transactions
set seller_net_amount = coalesce(amount, 0) + coalesce(shipping_amount, 0)
where seller_net_amount = 0;

create index if not exists transactions_seller_payout_status_updated_idx
  on public.transactions(seller_id, seller_payout_status, updated_at desc);
