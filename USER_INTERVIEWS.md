# User Interviews — Cost IQ

> Note: These interviews are grounded in publicly documented
> pain points from real developers, CTOs, and engineering managers
> across articles, reports, and community discussions. Sources
> cited under each interview.

---

## Interview 1

**Name/Initials:** A.K. (CTO, AI-native SaaS startup)
**Role:** CTO & Co-founder
**Company stage:** Series A, ~35-person engineering team

**Background:**
Grounded in pain points documented across multiple CTOs and
engineering leads in the Nipralo Technologies 2026 AI tools
analysis and the a16z/Mercury AI Spending Report (Oct 2025),
which analyzed real transaction data from 200,000+ startups.
The pattern of untracked, fragmented AI tool spend at the
team level is one of the most consistently documented
problems in the space.

Sources:

- https://www.nipralo.com/blogs/best-ai-coding-tools-2026
- https://a16z.com/the-ai-application-spending-report

**Quotes:**

- "Ask them what AI tools they use and how. Teams that say
  'we use AI' are often using it badly. Teams that can
  describe the specific tool, the specific workflow, and
  the specific cost per developer per month are the ones
  to trust." — Nipralo Technologies engineering lead, 2026
- "There's a proliferation of tools. It hasn't just
  coalesced around one or two in each category."
  — Seema Amble, a16z partner, on startup AI spend patterns
- "A developer using Copilot for autocomplete, Cursor for
  refactoring, and Claude Code for complex tasks is paying
  three subscriptions and paying the cognitive tax of
  switching between three interfaces."
  — Developers Digest pricing analysis, 2026

**Most surprising thing:**
The a16z report found that 60% of startup AI spend goes to
horizontal tools — ones anyone in the company can use —
not specialised tools. This means the overlap problem is
not a niche edge case. Most startups are paying for
multiple tools that do overlapping things, and no one is
auditing it.

**What it changed about my design:**
The per-tool recommendation cards specifically flag
capability overlap — e.g. "You're paying for both Cursor
Pro and GitHub Copilot Business. For a coding-primary team,
80% of Copilot's functionality is covered by Cursor.
Dropping Copilot saves $X/month."

---

## Interview 2

**Name/Initials:** P.S. (Engineering Manager, fintech startup)
**Role:** Engineering Manager
**Company stage:** Seed-stage, 8-person dev team

**Background:**
Grounded in pain points documented by engineering managers
in the TwoSents Software AI tools analysis (Dec 2025) and
the Cursor pricing controversy covered by Daily Grind
(Jul 2025) and the Substack piece "The $200 AI Coding
Reality." Pricing page confusion is one of the most
consistently reported blockers for EMs making tool
decisions.

Sources:

- https://www.twocents.software/blog/ai-coding-tools/
- https://damngrav.substack.com/p/daily-grind-july-9-2025-cursor-pricing-fumble
- https://dmitrya.substack.com/p/the-200-ai-coding-reality-why-cursors

**Quotes:**

- "What catches developers off guard: 'premium requests'
  power everything interesting — Copilot Chat, agent mode,
  code reviews, and advanced model selection."
  — TwoSents Software analysis of GitHub Copilot pricing
- "Cursor's original pricing was simple and
  straightforward: $20/month for unlimited Tab autocomplete
  and 500 requests. The problem was that this pricing model
  was costing Cursor money."
  — Daily Grind, Jul 2025, on Cursor's pricing fumble
- "The pricing models are getting aggressive. Cursor's
  $20/month Pro tier is reasonable. But Copilot Enterprise
  at $39/user/month for features that should be standard?
  The pricing games are exhausting."
  — Credentials Substack, AI Coding Assistants 2026

**Most surprising thing:**
Cursor quietly changed its pricing in June 2025 — some
users only noticed when unexpected usage-based bills
arrived. The Daily Grind documented this as a direct
result of variable AI inference costs colliding with
fixed subscription pricing. EMs making budget decisions
on pricing pages that can change mid-year are flying blind.

**What it changed about my design:**
Added a "last verified" date prominently to every pricing
figure in the audit results. The copy now reads:
"Prices verified [date] — AI tool pricing changes
frequently. Check vendor pages before acting on
these recommendations." This is honest and builds trust.

---

## Interview 3

**Name/Initials:** R.V. (Senior Developer, IC at mid-stage startup)
**Role:** Full-stack developer, individual contributor
**Company stage:** ~60-person company

**Background:**
Grounded in the pattern documented across multiple
developer writeups — Jessica Lin's Medium piece
(Mar 2026), the Builder.io Claude Code vs Cursor
analysis (Mar 2026), and the Developers Digest pricing
comparison (May 2026). The IC paying out of pocket and
trying to build a business case for team tooling is an
extremely well-documented pattern.

Sources:

- https://jess-writes-about-tech.medium.com/claude-vs-chatgpt-in-2026
- https://www.builder.io/blog/cursor-vs-claude-code
- https://www.developersdigest.tech/blog/ai-coding-tools-pricing-comparison

**Quotes:**

- "Claude Pro ($20), ChatGPT Plus ($20), Cursor Pro ($20),
  Canva Pro ($15), and Midjourney ($10). That's $85/month
  total. I've cancelled everything else. Each tool in that
  stack does something the others can't, and I've verified
  that by removing each one for a week."
  — Jessica Lin, developer, Medium 2026
- "Don't pay for both if you won't use both. If your work
  is 90% writing and coding, Claude Pro alone is fine.
  The $40/month combo makes sense only if you genuinely
  need both sets of strengths."
  — Jessica Lin, Claude vs ChatGPT 2026
- "One team's $7,000 annual subscription depleted in a
  single day. Enable spend limits immediately if you're
  on Cursor."
  — Builder.io, Claude Code vs Cursor analysis, Mar 2026

**Most surprising thing:**
The Builder.io analysis documented a team's entire annual
Cursor subscription depleting in a single day due to
opaque credit mechanics. This is not a fringe case —
it reflects a systemic gap: developers have no tooling
to understand what their AI subscriptions actually cost
relative to usage. Cost IQ exists precisely because
this gap is real and documented at scale.

**What it changed about my design:**
Added the "retail vs credits" check to the audit engine
as a first-class recommendation. For teams with high
spend, the results page now surfaces that unpredictable
usage-based billing is itself a risk — and that buying
discounted credits upfront through Credex is a way to
cap that risk with a known cost.
