create table if not exists app_events (
  id uuid primary key default gen_random_uuid(),
  event_name varchar(80) not null,
  actor_user_id uuid references users(id),
  listing_id uuid references listings(id),
  conversation_id uuid references conversations(id),
  transaction_id uuid references transactions(id),
  support_ticket_id uuid references support_tickets(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_events_name_created_idx
  on app_events (event_name, created_at desc);

create index if not exists app_events_actor_created_idx
  on app_events (actor_user_id, created_at desc);

create index if not exists app_events_transaction_idx
  on app_events (transaction_id, created_at desc);

create table if not exists app_error_logs (
  id uuid primary key default gen_random_uuid(),
  source varchar(60) not null,
  message text not null,
  digest varchar(255),
  stack text,
  pathname text,
  actor_user_id uuid references users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_error_logs_created_idx
  on app_error_logs (created_at desc);

create index if not exists app_error_logs_source_created_idx
  on app_error_logs (source, created_at desc);
