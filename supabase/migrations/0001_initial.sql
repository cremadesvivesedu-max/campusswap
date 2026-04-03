create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type user_role as enum ('student', 'moderator', 'admin');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type listing_condition as enum ('new', 'like-new', 'good', 'fair', 'needs-love');
create type listing_status as enum ('active', 'reserved', 'sold', 'archived', 'pending-review', 'hidden');
create type exchange_status as enum ('inquiry', 'negotiating', 'reserved', 'completed', 'cancelled', 'reported');
create type report_target_type as enum ('listing', 'user', 'conversation');
create type report_status as enum ('open', 'in-review', 'actioned', 'dismissed');
create type promotion_type as enum ('featured', 'seller-boost');
create type notification_type as enum ('message', 'promotion', 'review', 'listing', 'safety', 'system');
create type content_block_type as enum ('hero', 'faq', 'trust', 'testimonial', 'footer', 'seo');
create type monetization_module as enum ('promoted-listings', 'seller-boost', 'sponsor-cards', 'commission-ready');

create table universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  is_target boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table allowed_email_domains (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id),
  domain text not null unique,
  auto_verify boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table university_verification_rules (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id),
  require_email_otp boolean not null default true,
  block_posting_until_verified boolean not null default true,
  block_messaging_until_verified boolean not null default true,
  notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role user_role not null default 'student',
  verification_status verification_status not null default 'pending',
  avatar_url text,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  user_id uuid primary key references users(id),
  full_name text not null,
  university text not null,
  student_status text not null,
  neighborhood text not null,
  bio text not null,
  preferred_categories jsonb not null default '[]'::jsonb,
  buyer_intent boolean not null default true,
  seller_intent boolean not null default false,
  notification_preferences jsonb not null default '[]'::jsonb,
  rating_average numeric(3,2) not null default 0,
  review_count integer not null default 0,
  response_rate numeric(4,2) not null default 0,
  verified_badge boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  hero_description text not null,
  color text not null,
  typical_price_range text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references users(id),
  category_id uuid not null references categories(id),
  title text not null,
  description text not null,
  condition listing_condition not null,
  price numeric(10,2) not null,
  negotiable boolean not null default false,
  location text not null,
  pickup_area text not null,
  status listing_status not null default 'active',
  outlet boolean not null default false,
  featured boolean not null default false,
  urgent boolean not null default false,
  view_count integer not null default 0,
  save_count integer not null default 0,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_category_idx on listings(status, category_id);
create index listings_title_trgm_idx on listings using gin (title gin_trgm_ops);

create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  url text not null,
  alt text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table listing_tags (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table favorites (
  user_id uuid not null references users(id),
  listing_id uuid not null references listings(id),
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table view_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  listing_id uuid not null references listings(id),
  viewed_at timestamptz not null default now()
);

create table search_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  query text not null,
  category_slug text,
  created_at timestamptz not null default now()
);

create table recommendation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  listing_id uuid not null references listings(id),
  score numeric(10,2) not null,
  reason jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  buyer_id uuid not null references users(id),
  seller_id uuid not null references users(id),
  blocked_by uuid references users(id),
  unread_count integer not null default 0,
  quick_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id),
  sender_id uuid not null references users(id),
  text text not null,
  read boolean not null default false,
  sent_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  buyer_id uuid not null references users(id),
  seller_id uuid not null references users(id),
  state exchange_status not null default 'inquiry',
  meetup_spot text not null,
  meetup_window text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id),
  author_id uuid not null references users(id),
  target_user_id uuid not null references users(id),
  rating integer not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references users(id),
  target_type report_target_type not null,
  target_id uuid not null,
  status report_status not null default 'open',
  reason text not null,
  created_at timestamptz not null default now()
);

create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id),
  actor_id uuid not null references users(id),
  action text not null,
  created_at timestamptz not null default now()
);

create table sponsored_placements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  label text not null,
  location text not null,
  copy text not null,
  cta text not null,
  href text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table promotion_purchases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  seller_id uuid not null references users(id),
  type promotion_type not null,
  amount numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  type notification_type not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  intent text not null,
  created_at timestamptz not null default now()
);

create table content_blocks (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  type content_block_type not null,
  title text not null,
  body text not null,
  cta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pricing_settings (
  id uuid primary key default gen_random_uuid(),
  module monetization_module not null,
  label text not null,
  value numeric(10,2) not null,
  unit text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references users(id),
  entity text not null,
  entity_id uuid not null,
  action text not null,
  created_at timestamptz not null default now()
);
