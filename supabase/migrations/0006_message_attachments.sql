alter table public.messages
  add column if not exists attachment_url text,
  add column if not exists attachment_name text,
  add column if not exists attachment_mime_type text;

insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do nothing;

drop policy if exists message_attachments_public_read on storage.objects;
create policy message_attachments_public_read
  on storage.objects for select
  using (bucket_id = 'message-attachments');

drop policy if exists message_attachments_owner_insert on storage.objects;
create policy message_attachments_owner_insert
  on storage.objects for insert
  with check (
    bucket_id = 'message-attachments'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
