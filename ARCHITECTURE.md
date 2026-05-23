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
- **Anthropic API** — one `claude-haiku` call per audit for the summary paragraph (~200 output tokens). At 10k/day and $0.80/1M input tokens, estimated cost: ~$0.50/day.
- **Resend** — one email per lead. 10k/day requires Resend Pro ($20/month, 50k emails/month).

Bottleneck is the Anthropic API (rate limit: 4,000 req/min on Tier 1 → ~66/sec → headroom at 10k/day).
Mitigation: queue summary generation via Supabase Edge Functions and deliver asynchronously.
