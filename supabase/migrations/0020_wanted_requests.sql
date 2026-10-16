-- "I'm looking for…" requests: students post what they need; sellers see the board and
-- the requester is notified when a matching listing is published.
create table if not exists public.wanted_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(120) not null,
  category_slug text,
  max_price numeric(10,2),
  note varchar(300),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '45 days')
);

create index if not exists wanted_requests_open_idx
  on public.wanted_requests(status, created_at desc);

create index if not exists wanted_requests_user_idx
  on public.wanted_requests(user_id, created_at desc);

alter table public.wanted_requests enable row level security;

drop policy if exists wanted_requests_read on public.wanted_requests;
create policy wanted_requests_read
  on public.wanted_requests for select
  using (auth.role() = 'authenticated' and (status = 'open' or user_id = auth.uid()));

drop policy if exists wanted_requests_owner_insert on public.wanted_requests;
create policy wanted_requests_owner_insert
  on public.wanted_requests for insert
  with check (user_id = auth.uid());

drop policy if exists wanted_requests_owner_update on public.wanted_requests;
create policy wanted_requests_owner_update
  on public.wanted_requests for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists wanted_requests_owner_delete on public.wanted_requests;
create policy wanted_requests_owner_delete
  on public.wanted_requests for delete
  using (user_id = auth.uid());
