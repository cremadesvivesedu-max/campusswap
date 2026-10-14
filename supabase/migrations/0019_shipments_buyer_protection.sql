-- Shipping with buyer protection: one row per shipped order with the carrier and
-- tracking number, and the record of when the held payment was released to the seller.
-- Kept in its own table so pages that read transactions keep working without it.
create table if not exists public.shipments (
  transaction_id uuid primary key references public.transactions(id) on delete cascade,
  carrier text not null,
  tracking_number text not null,
  tracking_url text,
  shipped_at timestamptz not null default now(),
  stripe_transfer_id text,
  payout_released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shipments enable row level security;

-- Buyer, seller and admins can read; all writes go through the server (service role).
drop policy if exists shipments_participant_read on public.shipments;
create policy shipments_participant_read
  on public.shipments for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.transactions t
      where t.id = shipments.transaction_id
        and (t.buyer_id = auth.uid() or t.seller_id = auth.uid())
    )
  );

-- The daily job looks for shipped orders whose protection window has ended.
create index if not exists transactions_state_shipped_idx
  on public.transactions(state, shipped_at)
  where state in ('shipped', 'delivered');
