alter table public.notifications
  add column if not exists destination_href text;
