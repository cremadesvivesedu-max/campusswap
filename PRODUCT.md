# CampusSwap Product Foundations

## Positioning

CampusSwap helps students in Maastricht buy, sell, and reuse everyday essentials with more structure, trust, and speed than broad second-hand channels.

## Product principles

1. Student-first: every major flow should reduce friction for incoming and outgoing students.
2. Local relevance: copy, categories, pickup patterns, and discovery should feel native to Maastricht student life.
3. Trust by default: verification, moderation, identity signals, and safe meetup prompts appear throughout the app.
4. Fast liquidity: sellers should be able to create, promote, reserve, and sell quickly.
5. Sustainable practicality: outlet listings and reuse messaging are first-class, not side features.

## Information architecture

### Public

- `/`
- `/how-it-works`
- `/categories`
- `/featured`
- `/outlet`
- `/trust-safety`
- `/faq`
- `/join`
- `/privacy`
- `/terms`

### Authentication

- `/login`
- `/signup`
- `/verify-email`
- `/onboarding`

### Marketplace

- `/app`
- `/app/for-you`
- `/app/search`
- `/app/categories/[slug]`
- `/app/listings/[id]`
- `/app/sell`
- `/app/messages`
- `/app/messages/[conversationId]`
- `/app/saved`
- `/app/profile`
- `/app/profile/edit`
- `/app/my-listings`
- `/app/my-purchases`
- `/app/reviews`
- `/app/notifications`
- `/app/settings`

### Admin

- `/admin`
- `/admin/users`
- `/admin/listings`
- `/admin/reports`
- `/admin/categories`
- `/admin/sponsors`
- `/admin/monetization`
- `/admin/content`
- `/admin/analytics`
- `/admin/settings`

## Verification model

- Public visitors can browse marketing pages and listing previews.
- Posting, saving, messaging, and reviewing require a verified-student account.
- University domain allowlists are configurable in admin.
- Verification rules are content-managed and can optionally block unverified users from posting or messaging.

## Recommendation formula

`score = category_affinity + saved_similarity + search_similarity + recent_views + freshness + seller_quality + featured_boost + outlet_affinity - negative_trust_penalties`

Signals are deterministic, explainable, and event-driven so the engine can be replaced later without changing UI contracts.

## Monetization

Phase 1:

- promoted listings
- seller boost
- sponsor placements
- admin pricing controls

Phase 2-ready:

- transaction commission
- premium seller analytics
- highlighted profiles
- promotion bundles

## Trust and safety

- suspicious keyword detection
- listing and user reports
- block user controls
- moderation queue
- audit trail
- safe meetup guidance
- review gating after completed exchange

## Content constraints

- English-first
- concise and student-friendly
- do not claim official university affiliation by default
- demo testimonials and sponsor cards must always be labeled
