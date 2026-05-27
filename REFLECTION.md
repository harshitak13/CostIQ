# Reflection — Cost IQ

## 1. The hardest bug I hit this week

On Day 3, the confirmation email sent via Resend was generating broken share URLs. The symptom was subtle — the email sent fine, the subject line was correct, but clicking "View your full audit report" led to a page that showed `undefined/results/abc-123` in the browser. My first hypothesis was that the Resend API was stripping the URL somehow, but inspecting the sent email HTML showed the `href` itself was `undefined/results/...`. 

I traced it back to `email.ts` where I'd written `process.env.NEXT_PUBLIC_APP_URL` — but the actual environment variable defined in `.env.example` and used everywhere else in the codebase was `NEXT_PUBLIC_BASE_URL`. A classic copy-paste naming mismatch. The reason it didn't surface during development is that I was testing the audit flow and lead capture flow separately. The audit POST worked because `results/[id]/page.tsx` used the correct variable. Only when I tested the full end-to-end flow — submit audit → capture lead → receive email → click link — did the broken URL appear.

What made it harder was that `process.env.NEXT_PUBLIC_APP_URL` doesn't throw an error when undefined — it silently returns `undefined`, which JavaScript happily concatenates into a string. TypeScript strict mode doesn't catch this either because `process.env` properties are typed as `string | undefined` by default. I fixed it by standardizing on `NEXT_PUBLIC_BASE_URL` everywhere. The lesson: environment variable names should be grepped across the entire codebase before deployment. One mismatched key in a server-only file can hide for days because it only fires in a specific code path (email sending) that you're not testing on every run.

## 2. A decision I reversed mid-week

I originally built the results display as a separate route at `/results` — when the user submitted the audit form, the client would POST to `/api/audit`, receive a UUID, and then `router.push(/results/${id})` to a server-rendered results page. My reasoning was clean separation: the form is client-side, the results are server-rendered, and the shareable URL works identically whether you ran the audit yourself or received a link.

On Day 2, after wiring up the audit engine as a pure client-side function, I realized the navigation was adding 2–3 seconds of unnecessary latency. The audit result was already computed in the browser — the page transition meant throwing it away, making a server round-trip to Supabase, and re-fetching the same data I just had in memory. One of my interview subjects (Arjun) had said "I don't need another dashboard" — the speed was the feature.

I reversed course and rendered `AuditResults` inline below the `SpendForm` on the same page, passing the result via React state. The Supabase persistence and UUID generation happen asynchronously in the background via `POST /api/audit`, and the shareable `/results/[id]` route still exists for recipients of shared links. This gave me the best of both worlds: instant results for the person running the audit, and a clean server-rendered page for shared links. In hindsight, this was clearly the right call — the inline render feels instantaneous, which is the product's core value proposition.

## 3. What I would build in week 2

**Benchmark mode** — "Your AI spend per developer is $X/month; companies your size average $Y/month." This moves the North Star metric because even users with $0 savings get something shareable and valuable. The data could start with hardcoded medians from our user interviews and evolve into real aggregates from the `audits` table. This alone would increase email capture rate from the "already optimal" segment, which currently gets a dead-end "you're spending well" card.

**PDF export** — A downloadable one-page PDF of the full audit report. This directly enables the user journey surfaced in Interview #3 (Rohit): "I'd forward it to my engineering manager with a subject line like 'here's how we save ₹2L/year.'" A PDF travels better than a link in corporate environments where Slack links get ignored. Implementation: use `@react-pdf/renderer` to generate server-side, cache the PDF keyed by audit UUID.

**Slack/email digest when pricing changes** — Subscribe to pricing change alerts for the tools in your stack. This turns Cost IQ from a one-shot tool into a recurring touchpoint. When Cursor changes its pricing (which happened during my research — they rebranded Pro to Individual), subscribers get an email saying "Cursor pricing changed — your savings estimate is now $X." This drives re-engagement and repeat lead capture. Implementation: a cron job comparing `pricingData.ts` snapshots weekly and firing Resend emails to subscribed leads.

**Saved audit history** — Requires authentication (likely Supabase Auth with magic links). Users can see how their AI spend changes over time. This is lower priority than the above three because it requires auth infrastructure, but it's the natural next step toward a sticky product.

## 4. How I used AI tools

I used Claude (via the Anthropic API) for the product itself — generating the audit summary paragraph — and I used Cursor with Claude Sonnet as my coding assistant throughout the build. I also used Claude directly in conversation for brainstorming the audit engine's check priority order and for rubber-ducking the Supabase schema design.

Tasks I used AI for: generating boilerplate (the initial Next.js component stubs), writing the Tailwind CSS design tokens, drafting the CSS animation keyframes, and iterating on the Anthropic prompt until the summary output was consistently useful. For the prompt engineering specifically, I went through 4 iterations — the first version asked for "recommendations" which conflicted with the deterministic audit engine output; the final version asks only for a "summary paragraph" which complements rather than contradicts the rule-based cards.

What I did NOT trust AI with: the audit engine math in `auditEngine.ts`. This is the core business logic — every savings number must be verifiable by a human reading the code. I wrote every check by hand, traced the math on paper for edge cases (seat count × price difference × seats), and verified with unit tests. I also didn't trust AI-generated pricing data — every number in `pricingData.ts` was manually verified against the vendor's pricing page with a URL and date recorded in `PRICING_DATA.md`.

One specific moment where AI was wrong: Cursor suggested using `Math.floor` instead of `Math.round` for the savings calculation, which would have systematically underreported savings by up to $0.99. I caught this because the test for "annual savings is exactly monthly × 12" was failing by 1 cent intermittently. The fix was `Math.round(n * 100) / 100` for consistent two-decimal rounding.

## 5. Self-ratings

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| Discipline | 8/10 | Committed every day, maintained the devlog, followed the brief's structure closely. Lost a point for not setting up Supabase env vars until Day 4 — should have done it Day 1. |
| Code quality | 7/10 | TypeScript strict mode, pure functions, good separation of concerns. But the env variable naming inconsistency (`APP_URL` vs `BASE_URL`) is exactly the kind of bug that better naming conventions and a shared constants file would have prevented. |
| Design sense | 8/10 | The dark glassmorphic UI with gradient accents looks polished and professional. The skeleton loaders and fade-up animations add perceived quality. Could improve mobile spacing — some cards feel cramped on iPhone SE. |
| Problem-solving | 8/10 | The four-check priority system in the audit engine is clean and extensible. The fallback summary strategy for API failures is robust. Deducted points because the inline-vs-separate-page decision should have been obvious from Day 1, not reversed on Day 2. |
| Entrepreneurial thinking | 7/10 | The shareable URL viral loop, high-value lead flagging, and Credex CTA placement show product thinking. But I didn't instrument any analytics events — without data, the funnel math in ECONOMICS.md is pure assumption. Week 2 should start with Posthog integration. |
