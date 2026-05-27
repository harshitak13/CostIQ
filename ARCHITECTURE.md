# Architecture — Cost IQ

## System Diagram

```mermaid
graph TD
  A[User fills SpendForm] --> B[runAudit — client-side pure fn]
  B --> C{Savings > $200/mo?}
  C -->|Yes| D[Show Credex buy_via_credits CTA]
  C -->|No| E[Show optimisation tips]
  B --> F[AuditResults renders inline]
  F --> G[LeadCapture — email gate]
  G --> H[POST /api/lead → Supabase]
  G --> I[POST /api/audit → save result with UUID]
  I --> J[/results/:id — shareable URL]
  H --> K[Resend — confirmation email to user]
  I --> L[GET /api/audit/id → Anthropic summary]
  L --> F
```

## Data Flow

1. **User inputs** tool spend in `SpendForm` (tool, plan, monthly spend, seat count × N tools)
2. **On submit**, `runAudit()` runs entirely in the browser — **zero network calls**. The result is an `AuditResult` object passed via prop to `AuditResults`.
3. **Results render inline** below the form. Decision rationale: the audit is deterministic and instantaneous; a page navigation would add a round-trip with no UX benefit. The shareable `/results/:id` URL is generated only after the lead is captured (Day 3).
4. **Anthropic summary** is fetched server-side via `GET /api/audit` after the result is saved, enriching `AuditResult.summary` with a plain-English paragraph.
5. **Email gate**: user submits email → `POST /api/lead` (saves to Supabase `leads` table) and `POST /api/audit` (saves `AuditResult` JSON to `audits` table with a UUID primary key).
6. **Confirmation email** sent via Resend with the shareable link.
7. **Shareable URL**: `costiq.app/results/:uuid` — the results page fetches the audit by UUID from Supabase and renders read-only `AuditResults`.

## Stack Choice

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 14 App Router** | File-based routing, server components, built-in API routes — perfect for a lean SaaS with both static and dynamic pages |
| Language | **TypeScript (strict)** | `AuditResult` types flow end-to-end from engine → API → UI with zero casting |
| Styling | **Tailwind CSS v4** | Utility-first with custom CSS design tokens in `globals.css` — fastest iteration for a solo build |
| Database | **Supabase** | Postgres + auto-generated REST API + Row-Level Security — free tier covers 10k audits/day easily |
| Email | **Resend** | Simplest transactional email API, generous free tier (3k/month), React Email templates on Day 3 |
| Hosting | **Vercel** | Zero-config Next.js deployment, edge network, preview URLs per PR |
| Audit engine | **Client-side pure function** | No infra cost, no latency, fully testable with Vitest, scales to infinite concurrent users |

## Scaling to 10k Audits/Day

The audit engine is a **stateless pure function** — it runs in the user's browser.
Server-side load is limited to:

- **`POST /api/audit`** — one Supabase `INSERT` per audit saved (after email gate). At 10k/day ≈ 7 req/sec, well within Supabase free tier (500 req/sec).
- **Anthropic API** — one `claude-sonnet-4-20250514` call per audit for the summary paragraph (~200 output tokens). At 10k/day and $3.00/1M input tokens, estimated cost: ~$2/day.
- **Resend** — one email per lead. 10k/day requires Resend Pro ($20/month, 50k emails/month).

Current bottleneck: the Anthropic API call in `POST /api/audit`. At 10k audits/day (~7 audits/minute peak), this becomes 7 concurrent Anthropic requests per minute — well within API rate limits but adds ~3–8s latency to every audit save.

Changes needed at scale:

1. **Move summary generation to a background job** (Inngest or a Supabase Edge Function) — return the UUID immediately after the Supabase insert, generate the summary asynchronously, and poll or push the summary to the client separately. This removes the 8s blocking wait from the user's critical path.

2. **Replace in-memory rate limiter with Upstash Redis sliding window** — the current `Map` in `/api/lead/route.ts` resets on every serverless cold start, making it trivially bypassable under Vercel's auto-scaling. Upstash Redis provides a persistent sliding window with a single HTTP call per check.

3. **Add a CDN cache layer on `/results/[id]`** — audit results are immutable once saved. A 24-hour `Cache-Control: s-maxage=86400, stale-while-revalidate` header on the results page eliminates the Supabase read on every share link open. At 10k shared URLs/day, this removes ~10k DB reads daily.

4. **Connection pooling via Supabase's pgBouncer** — serverless functions open a new DB connection per invocation at high concurrency. At 7 req/sec, this can exhaust Postgres connection limits. Supabase offers pgBouncer pooling on port 6543 with zero config.

