# Dev Log — Cost IQ

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
