# CampusSwap

CampusSwap is a mobile-first student marketplace for Maastricht built with Next.js App Router, Supabase Auth/Postgres/Storage/Realtime, and a launch-oriented admin back office.

This repo is prepared for deployment on Vercel with a Supabase backend.

## Current Deployment Status

- Production build passes with the current deployment-safe setup.
- Real auth callback route exists at `/auth/callback`.
- Supabase SSR clients are configured for cookie refresh in middleware and server usage.
- Production metadata, sitemap, and robots now resolve against the deployment URL instead of hardcoded localhost.
- Node is pinned to `22.x`.
- The project supports both `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Zero To Live URL

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill in local values and set:
   - `NEXT_PUBLIC_APP_MODE=live`
   - `APP_MODE=live`
4. Install dependencies:

```bash
pnpm install
```

5. Apply the SQL migrations:

```powershell
psql "$env:DATABASE_URL" -f ".\supabase\migrations\0001_initial.sql"
psql "$env:DATABASE_URL" -f ".\supabase\migrations\0002_auth_storage_rls.sql"
```

6. Optional: seed demo content in staging:

```bash
pnpm seed
```

7. In Supabase Auth, configure:
   - Site URL
   - redirect URLs
   - email/password auth

8. In Vercel:
   - import the repo
   - use Node.js 22
   - add the required environment variables
   - deploy

9. Add the final production domain in Vercel.
10. Update Supabase Auth Site URL and redirect URLs to the final production domain.
11. Promote at least one real admin:

```sql
update public.users set role = 'admin' where email = 'you@example.com';
```

12. Verify the live flows:
   - sign up
   - email confirmation
   - onboarding
   - listing creation with image upload
   - save listing
   - message seller
   - admin report update

## Vercel Environment Variables

Required in the Vercel runtime:

- `NEXT_PUBLIC_APP_MODE=live`
- `APP_MODE=live`
- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...`
  or `NEXT_PUBLIC_SUPABASE_ANON_KEY=...` as a compatibility fallback
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `SUPPORT_EMAIL=hello@your-domain.com`

Not required in the Vercel runtime, but needed locally or in CI/CD ops:

- `DATABASE_URL=...`

Optional now, useful later:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `DEMO_USER_PASSWORD`
- `DEMO_ADMIN_PASSWORD`

Notes:

- Keep `APP_MODE` and `NEXT_PUBLIC_APP_MODE` aligned.
- `NEXT_PUBLIC_SITE_URL` is used for production-safe absolute URLs.
- `NEXT_PUBLIC_APP_URL` is still supported for compatibility and should match the same production domain.
- Vercel automatically exposes `NEXT_PUBLIC_VERCEL_URL` and `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`.
- Preview deployments fall back to the preview deployment URL automatically when `NEXT_PUBLIC_SITE_URL` is not explicitly set for Preview.
- Production should still be configured with an explicit `NEXT_PUBLIC_SITE_URL` for stable canonical URLs and auth redirects.

## Supabase Manual Configuration

### Auth

Required for launch:

- Enable Email provider and email/password sign-in
- Set Site URL to your production domain, for example:
  `https://your-domain.com`
- Add redirect URL:
  `https://your-domain.com/auth/callback`
- Add local redirect URL for development:
  `http://localhost:3000/auth/callback`

Recommended:

- If you use Vercel preview deployments, add preview wildcard redirect URLs following Supabase redirect URL rules, for example:
  `https://*-your-project.vercel.app/auth/callback`
- Customize verification email templates with CampusSwap branding

### Storage

Required for launch:

- Confirm the `avatars` bucket exists
- Confirm the `listing-images` bucket exists
- Confirm both buckets are public
- Confirm the storage RLS policies from `0002_auth_storage_rls.sql` are applied

Recommended:

- Add image size limits in policy or product ops docs
- Add cleanup jobs for replaced avatars or deleted listing images later

### Database

Required for launch:

- Apply both SQL migrations
- Confirm RLS is enabled
- Confirm tables exist for:
  - users
  - profiles
  - listings
  - listing_images
  - favorites
  - conversations
  - messages
  - reviews
  - reports
  - notifications
  - sponsored_placements
  - content_blocks
  - pricing_settings
- Create at least one real admin by updating `public.users.role` to `admin`

Recommended:

- Run the seed only in staging unless you explicitly want demo inventory in production
- Review indexes and query plans once real traffic grows

## Local Validation

```bash
pnpm typecheck
pnpm build
```

## Already Ready

- Vercel-compatible Next.js production build
- Supabase email/password auth callback handling
- Supabase SSR cookie refresh middleware
- Production-safe metadata URL handling
- Supabase storage bucket and RLS migration for avatars and listing images
- Dynamic auth/app/admin shells to avoid static caching of session-aware routes

## Still Needs Manual Configuration

- Vercel project env vars
- Supabase Auth Site URL and redirect URLs
- Supabase buckets and RLS migration execution
- Real admin promotion in the database
- Optional Stripe and Resend configuration if you want those flows live

## Launch Checklist

See:
[LAUNCH_CHECKLIST.md](C:/Users/Edu/AppData/Local/Temp/campusswap/LAUNCH_CHECKLIST.md)
