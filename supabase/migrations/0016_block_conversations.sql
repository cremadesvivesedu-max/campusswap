-- Blocking: once either participant blocks a conversation, nobody can post in it
-- until the person who blocked it unblocks it.
drop policy if exists messages_participant_insert on public.messages;
create policy messages_participant_insert
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and conversations.blocked_by is null
        and (
          conversations.buyer_id = auth.uid()
          or conversations.seller_id = auth.uid()
          or public.is_admin()
        )
    )
  );
