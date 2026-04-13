do $$
begin
  create type public.support_ticket_type as enum (
    'report-user',
    'report-listing',
    'purchase-dispute',
    'payment-help',
    'shipping-help'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.support_ticket_status as enum (
    'open',
    'in-review',
    'resolved',
    'closed'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.support_ticket_type not null,
  status public.support_ticket_status not null default 'open',
  subject varchar(200) not null,
  details text not null,
  listing_id uuid references public.listings(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  transaction_id uuid references public.transactions(id) on delete set null,
  target_user_id uuid references public.users(id) on delete set null,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_user_created_idx
  on public.support_tickets(user_id, created_at desc);

create index if not exists support_tickets_status_updated_idx
  on public.support_tickets(status, updated_at desc);

create index if not exists support_tickets_transaction_idx
  on public.support_tickets(transaction_id);

alter table public.support_tickets enable row level security;

drop policy if exists support_tickets_owner_read on public.support_tickets;
create policy support_tickets_owner_read
  on public.support_tickets for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists support_tickets_owner_insert on public.support_tickets;
create policy support_tickets_owner_insert
  on public.support_tickets for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists support_tickets_admin_update on public.support_tickets;
create policy support_tickets_admin_update
  on public.support_tickets for update
  using (public.is_admin())
  with check (public.is_admin());
