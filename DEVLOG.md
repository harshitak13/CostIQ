# Dev Log — Cost IQ

## Day 5 — 2026-05-27
**Hours worked:** ~4 hours
**What I did:** Full end-to-end QA pass across happy path and edge cases. Fixed env variable naming bug in email.ts. Added custom 404 not-found page matching the app's dark theme. Confirmed CI green: lint (0 errors), tests (7/7 passing), production build (zero errors). Completed README.md with live URL, screenshots section, quick start, env vars table, and 5 design decisions. Completed REFLECTION.md with all 5 answers (hardest bug, reversed decision, week 2 features, AI tool usage, self-ratings). Updated ARCHITECTURE.md scaling section with detailed changes needed at 10k audits/day (background jobs, Redis, CDN cache, connection pooling). Filled GTM.md with target user, distribution channels, first 100 users plan, and week-1 projections. Filled LANDING_COPY.md with headline, CTA, social proof, and complete FAQ answers. Verified all 13 markdown files are complete with no stubs. Confirmed git log shows commits on 5+ distinct calendar days.

**Bugs found and fixed:**
- **Bug 1: Broken share URL in confirmation emails** — `email.ts` used `process.env.NEXT_PUBLIC_APP_URL` but the actual env variable is `NEXT_PUBLIC_BASE_URL`. This caused the share link in Resend emails to resolve to `undefined/results/...`. Fixed by changing to `NEXT_PUBLIC_BASE_URL` to match `.env.example` and all other code. Root cause: copy-paste naming mismatch between files, not caught by TypeScript because `process.env` properties are `string | undefined` by default.
- **Bug 2: No custom 404 page** — navigating to `/results/invalid-uuid` showed the default Next.js 404 page (plain white, no branding). Fixed by creating `src/app/not-found.tsx` with the app's dark theme, gradient "404" heading, and a CTA to run a new audit.

**What I learned:** End-to-end testing is not optional — the env variable bug only surfaced when testing the complete flow (audit → lead → email → click link). Unit tests and type checks don't catch environment variable naming mismatches. A grep for env variable names across the entire codebase should be a pre-deployment checklist item.
**Blockers / what I'm stuck on:** None — submitted.
**Plan for tomorrow:** Wait for Round 2 invitation.


## Day 4 — 2026-05-25
**Hours worked:** ~4 hours
**What I did:** Implemented shareable result page at /results/[id]
with Supabase fetch, PII stripping, and read-only per-tool breakdown.
Built dynamic OG image via Next.js ImageResponse (opengraph-image.tsx)
with 1200×630 dark card showing savings figure and Cost IQ branding.
Implemented ShareCard component with copy-to-clipboard link and X share
intent, dark bg-zinc-900 card designed for screenshot sharing.
Applied responsive layout (max-w-2xl container, mobile stacking) and
a11y fixes across all components: sr-only labels on LeadCapture inputs,
aria-label on AuditResults article cards with semantic h3 headings,
skip-to-main link in layout.tsx, skeleton min-height for CLS prevention,
aria-label on ShareCard copy button. Added sr-only CSS utility class.
Wrote ECONOMICS.md with full funnel math ($800 blended lead value,
0.59% visit-to-purchase rate, $1M ARR model needing 1,250 customers).
Wrote METRICS.md with North Star metric (qualified leads/week),
3 input metrics, instrumentation plan, and pivot trigger.
Lighthouse scores: Performance [pending deploy], Accessibility [pending deploy],
Best Practices [pending deploy] — will record after Vercel deploy.
**What I learned:** Next.js 15+ requires params to be awaited as a Promise
in both page components and generateMetadata. The opengraph-image.tsx
convention auto-generates OG images per route segment — no manual
og:image meta tag needed. Tailwind v4 may not include sr-only utility
by default, so a custom CSS class is needed for screen reader support.
**Blockers / what I'm stuck on:** Cannot run Lighthouse until deployed
to Vercel (localhost doesn't support OG image testing). Need to verify
Supabase connection works with real env vars before full QA.
**Plan for tomorrow:** Full QA pass, complete README and REFLECTION,
confirm CI green, submit Google Form.

## Day 3 — 2026-05-24
**Hours worked:** ~4 hours
**What I did:** Implemented AuditResults UI with per-tool cards,
hero savings numbers, AI summary blockquote with skeleton loader,
Credex CTA (>$500), and spending-well variant (<$100).
Built Anthropic summary generation (`anthropicSummary.ts`) with
`claude-sonnet-4-20250514`, 8s timeout, and meaningful templated fallback.
Wired up Supabase for audit + lead storage via `@supabase/supabase-js`.
Built `POST /api/audit` (save result → generate summary → return UUID).
Built `POST /api/lead` with honeypot field and in-memory IP rate limiter
(3 per hour). Created `lib/email.ts` for Resend confirmation emails with
dynamic subject lines and Credex specialist mention for high-value leads.
Built `LeadCapture.tsx` email gate with honeypot, disabled-during-flight
button, and shareable URL on success. Wired LeadCapture into page.tsx
via onLeadCapture callback. Updated PROMPTS.md with full prompt text,
variable table, design rationale, and what didn't work.
**What I learned:** The Anthropic API fallback strategy is important —
the templated fallback must be meaningful enough that users don't notice
when the API is down. Using `AbortSignal.timeout(8000)` provides a clean
way to handle slow responses without manual setTimeout/AbortController.
In-memory rate limiting is sufficient for MVP but resets on server restart;
production needs Redis (Upstash). Honeypot fields work because bots fill
all form fields — real users never see the hidden field.
**Blockers / what I'm stuck on:** Supabase tables (`audits`, `leads`)
need to be created manually in the dashboard before the API routes work.
No `.env` values configured yet for Supabase/Anthropic/Resend.
**Plan for tomorrow:** Shareable URLs (`/results/[id]` page fetching
from Supabase), OG tags with dynamic metadata, ShareCard component,
UI polish, Lighthouse audit, ECONOMICS.md and METRICS.md.

## Day 2 — 2026-05-23
**Hours worked:** ~4 hours
**What I did:** Built `pricingData.ts` with all 8 vendor tiers (prices verified from PRICING_DATA.md).
Implemented the four-check audit engine (`runAudit()`) as a pure client-side function — seat-count
flag, same-vendor downgrade, alternative tool switch (≥$5 threshold), and credits CTA (>$200/mo).
Wrote 7 unit tests, all passing. Built `SpendForm` with localStorage persistence, dynamic
plan dropdowns keyed to the selected tool, per-row validation, and a smooth scroll to results on
submit. Wired up `page.tsx` with a polished dark hero, inline results render, stat row, testimonial,
and FAQ accordions. Wrote full `AuditResults` component with savings banner, per-recommendation
cards (badge + reason + savings figure), and totals footer. Updated `ARCHITECTURE.md`,
`TESTS.md`, and `DEVLOG.md`.
**What I learned:** The four-check priority order matters — seat-count must fire before the
downgrade check or you get duplicate recommendations. The "already_optimal" path must be
reached only when no other check fires, so each check uses a `handled` flag to short-circuit.
Tailwind v4's `@import "tailwindcss"` syntax replaces the old `@tailwind` directives.
**Blockers / what I'm stuck on:** None — all 7 tests pass, lint is clean, dev server runs.
**Plan for tomorrow:** `AuditResults` polish + `LeadCapture` email gate, `anthropicSummary.ts`
(server-side Anthropic call), `POST /api/audit` → Supabase persist with UUID, `POST /api/lead`
→ Resend confirmation email, `/results/[id]` shareable page, `ShareCard` component.

## Day 1 — 2026-05-22
**Hours worked:** ~3 hours
**What I did:**
- Scaffolded the entire Next.js 14 project with TypeScript (strict mode), Tailwind CSS, App Router, and ESLint
- Installed and configured Vitest for testing; added `npm run test` script
- Created the full folder structure: `src/app/`, `src/components/`, `src/lib/`, `src/tests/`
- Built stub pages: landing page (`page.tsx`), results page (`results/[id]/page.tsx`)
- Built stub API routes: `api/audit/route.ts`, `api/lead/route.ts`
- Created 4 component stubs: `SpendForm`, `AuditResults`, `LeadCapture`, `ShareCard`
- Created 3 lib stubs: `auditEngine.ts` (with full TypeScript types), `pricingData.ts`, `anthropicSummary.ts`
- Set up root layout with OG meta tags, Twitter card metadata, and "Cost IQ" branding
- Wrote CI workflow (`.github/workflows/ci.yml`) — lint + test on push/PR to main
- Created `.env.example` with all required keys (Supabase, Anthropic, Resend, base URL)
- Created all 13 markdown documentation files with Cost IQ branding
- Researched and filled PRICING_DATA.md with real, verified pricing from 8 vendors
- Wrote 1 placeholder test — confirmed passing (`1 passed, 0 errors`)
- Confirmed `npm run lint` passes (0 errors, 4 stub warnings)

**What I learned:**
- Cursor has rebranded "Pro" to "Individual" at $20/month — the pricing page structure has changed
- GitHub Copilot now uses a premium-request credit system instead of flat unlimited usage
- Anthropic's consumer plans now include "Max" tier at $100–200/month with 5×–20× usage
- OpenAI has deprecated the "Team" plan name in favor of "Business"

**Blockers / what I'm stuck on:**
- None — Day 1 setup is complete and all checks pass

**Plan for tomorrow:**
- Implement the audit engine logic in `auditEngine.ts` with real pricing comparisons
- Populate `pricingData.ts` with structured data matching PRICING_DATA.md
- Build out the `SpendForm` component with multi-step input flow
- Write real unit tests for the audit engine
- Start on the results page UI
