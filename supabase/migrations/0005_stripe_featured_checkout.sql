do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'promotion_purchase_status'
  ) then
    create type public.promotion_purchase_status as enum (
      'pending',
      'checkout_opened',
      'paid',
      'cancelled'
    );
  end if;
end
$$;

alter table public.promotion_purchases
  add column if not exists status public.promotion_purchase_status,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists updated_at timestamptz default now() not null;

update public.promotion_purchases
set
  status = case
    when active = true then 'paid'::public.promotion_purchase_status
    else 'pending'::public.promotion_purchase_status
  end,
  paid_at = case
    when active = true and paid_at is null then created_at
    else paid_at
  end,
  updated_at = coalesce(updated_at, created_at, now())
where status is null;

alter table public.promotion_purchases
  alter column status set default 'pending'::public.promotion_purchase_status,
  alter column status set not null;

create unique index if not exists promotion_purchases_stripe_checkout_session_uidx
  on public.promotion_purchases(stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists promotion_purchases_listing_seller_type_created_idx
  on public.promotion_purchases(listing_id, seller_id, type, created_at);
