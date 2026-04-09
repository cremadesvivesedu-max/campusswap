alter type public.exchange_status add value if not exists 'pending';
alter type public.exchange_status add value if not exists 'paid';
alter type public.exchange_status add value if not exists 'ready-for-pickup';
alter type public.exchange_status add value if not exists 'shipped';
alter type public.exchange_status add value if not exists 'delivered';

do $$
begin
  create type public.fulfillment_method as enum ('pickup', 'shipping');
exception
  when duplicate_object then null;
end
$$;

alter table public.listings
  add column if not exists pickup_available boolean not null default true,
  add column if not exists shipping_available boolean not null default false,
  add column if not exists shipping_cost numeric(10,2) not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_fulfillment_available_check'
      and conrelid = 'public.listings'::regclass
  ) then
    alter table public.listings
      add constraint listings_fulfillment_available_check
      check (pickup_available or shipping_available);
  end if;
end
$$;

update public.listings
set pickup_available = true
where pickup_available is null;

update public.listings
set shipping_available = false
where shipping_available is null;

update public.listings
set shipping_cost = 0
where shipping_cost is null;

alter table public.transactions
  add column if not exists fulfillment_method public.fulfillment_method,
  add column if not exists shipping_amount numeric(10,2) not null default 0,
  add column if not exists platform_fee numeric(10,2) not null default 0,
  add column if not exists total_amount numeric(10,2) not null default 0,
  add column if not exists paid_at timestamptz,
  add column if not exists ready_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;

update public.transactions
set state = 'pending'
where state in ('inquiry', 'negotiating');

update public.transactions
set fulfillment_method = 'pickup'
where fulfillment_method is null;

update public.transactions
set shipping_amount = 0
where shipping_amount is null;

update public.transactions
set platform_fee = 0
where platform_fee is null;

update public.transactions
set total_amount = coalesce(amount, 0) + coalesce(shipping_amount, 0) + coalesce(platform_fee, 0)
where total_amount is null
   or total_amount = 0;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'notifications'
    ) then
      alter publication supabase_realtime add table public.notifications;
    end if;
  end if;
end
$$;
