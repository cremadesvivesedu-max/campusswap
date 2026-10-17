-- Trigger functions run with SECURITY DEFINER and were also exposed through the API
-- (/rest/v1/rpc/...). Postgres fires triggers without checking EXECUTE, so taking it away
-- from the API roles closes that door without changing how the triggers behave.
-- is_admin() stays callable: row-level security policies use it.
revoke execute on function public.enforce_rate_limit() from public, anon, authenticated;
revoke execute on function public.handle_auth_user_created() from public, anon, authenticated;
revoke execute on function public.handle_message_created() from public, anon, authenticated;
