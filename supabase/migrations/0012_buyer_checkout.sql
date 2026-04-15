do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'transaction_payment_status'
  ) then
    create type public.transaction_payment_status as enum (
      'pending',
      'checkout_opened',
      'paid',
      'cancelled'
    );
  end if;
end
$$;

alter table public.transactions
  add column if not exists checkout_status public.transaction_payment_status,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text;

create unique index if not exists transactions_stripe_checkout_session_uidx
  on public.transactions(stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists transactions_buyer_checkout_status_updated_idx
  on public.transactions(buyer_id, checkout_status, updated_at desc)
  where checkout_status is not null;
