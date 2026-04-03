# AGENTS

## Engineering rules

1. Use `pnpm` for package management and scripts.
2. Keep TypeScript in strict mode. Do not use `any`.
3. Centralize domain types and validation schemas before adding new data flows.
4. Prefer server components and server-side fetching for marketplace pages.
5. Use Supabase Row Level Security as the first line of access control.
6. Keep all public copy truthful. Never invent partnerships or official university affiliations.
7. Mark testimonials, sponsor cards, and seeded local businesses as demo content unless they are real.
8. Every user flow must include explicit loading, empty, and error states.
9. Accessibility is a release requirement: keyboard access, visible focus, semantic headings, and color contrast.
10. Student trust markers should remain visible on listing cards, profile surfaces, checkout prompts, and moderation actions.

## Product guardrails

1. Maastricht relevance beats generic marketplace breadth.
2. In-person meetup is the default MVP transaction mode.
3. Verification gates actions, not discovery.
4. Outlet inventory is a strategic feature, not a filter add-on.
5. Admin controls must exist for pricing, verification, content, sponsorship, and moderation.

## Testing rules

1. Add or update unit tests for recommendation, moderation, and pricing logic.
2. Add integration coverage for flows that touch auth, listings, messaging, or monetization.
3. Keep at least one Playwright path covering the core student journey end to end.
