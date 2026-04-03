# CampusSwap Deployment Checklist

## Required For Deployment

- Set `NEXT_PUBLIC_APP_MODE=live` and `APP_MODE=live`
- Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` to the final production domain
- Add all required Vercel environment variables
- Keep `DATABASE_URL` available for local or CI migrations even though the Vercel runtime does not require it
- Apply `0001_initial.sql`
- Apply `0002_auth_storage_rls.sql`
- In Supabase Auth, set the production Site URL
- In Supabase Auth, add `https://your-domain.com/auth/callback`
- In Supabase Auth, add `http://localhost:3000/auth/callback`
- In Supabase Auth, enable email/password sign-in
- In Supabase Storage, confirm `avatars` and `listing-images` buckets exist and stay public
- In Supabase Database, verify RLS is enabled on marketplace tables
- Create one real admin user and set `public.users.role = 'admin'`
- Run a production build:
  `pnpm build`
- Verify live flows:
  - sign up
  - email confirmation
  - onboarding
  - listing creation with image upload
  - save listing
  - message seller
  - admin report update

## Recommended Before Public Launch

- Replace demo listings with real launch inventory
- Add a proper custom domain in Vercel and use that as the Supabase Site URL
- Add a resend-ready support inbox and verify sender domains
- Add Stripe keys only when promoted listings are ready to sell
- Add production monitoring and error alerts
- Review moderation copy and legal copy with a real operator

## Optional Post-Launch Improvements

- Stripe checkout for promoted listings
- saved-search alerts and featured digests
- richer admin analytics funneling
- transaction completion directly from chat
- stronger typo-tolerant ranked search using dedicated Postgres search tuning
- richer moderation tooling and audit history views
