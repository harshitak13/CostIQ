# User Interviews — Cost IQ

## Interview 1
**Name/Initials:** A.K. (Arjun Krishnamurthy)
**Role:** CTO & Co-founder
**Company stage:** Series A, 35-person AI-native SaaS startup (Bengaluru)

**Context:** Arjun's team of 12 engineers uses Cursor (Pro), GitHub Copilot (Business), Claude Pro, and ChatGPT Plus. They also make direct API calls to both Anthropic and OpenAI for their product. Monthly AI tooling bill has grown from ₹1.5L to ₹4.8L in 6 months without anyone tracking it.

**Quotes:**
- "We literally have engineers paying for Cursor Pro on their personal cards and expensing it. Nobody knows who's using what plan or if we're doubling up on capabilities. Last month we found three people paying for both Copilot and Cursor Pro — that's pure waste."
- "I'd kill for a tool that just says 'hey, your team of 12 could drop Copilot Business entirely because 80% of your usage overlaps with Cursor.' That one insight alone would save us ₹30K a month."
- "The API spend is the scariest part. We have no idea if we're using the right model for the right task. We might be sending simple classification prompts to Claude Opus when Haiku would do fine at 1/20th the cost."
- "I don't need another dashboard. I need someone to tell me what to cancel. Just give me the decision, not the data."

**Most surprising thing they said:**
"I don't need another dashboard. I need someone to tell me what to cancel." — This reframed the product from a passive analytics tool to an active recommendation engine. Users don't want visibility into their spend; they want a specific action plan with dollar amounts attached.

**What it changed about my design:**
Changed the results page from a data-heavy table to an **actionable recommendation card** format. Each card now says "Cancel X, switch to Y, save ₹Z/month" instead of showing raw usage metrics. Added the concept of "overlap detection" as a core audit feature — flagging tools with redundant capabilities.

---

## Interview 2
**Name/Initials:** P.S. (Priya Sharma)
**Role:** Engineering Manager
**Company stage:** Seed-stage, 8-person dev team at a fintech startup (Mumbai)

**Context:** Priya manages a small team where every engineer has a ChatGPT Plus subscription and half use GitHub Copilot Free. They've been debating whether to upgrade to Copilot Pro or switch to Cursor. The decision has been stuck for 3 weeks because no one can figure out the real cost-benefit tradeoff.

**Quotes:**
- "Every week someone in standup asks 'should we just get Cursor for everyone?' and nobody has an answer. We've been going back and forth for a month. It's embarrassing how much time we've spent debating a $20/month tool."
- "The pricing pages are deliberately confusing. Cursor says 'extended limits on Agent' — what does that even mean in practice? How many requests is that? I've spent two hours trying to compare Cursor Pro vs Copilot Pro and I still can't tell you which is objectively better for our use case."
- "If your tool could say 'for a team of 8 doing mostly full-stack TypeScript, here's your optimal stack and it'll cost $X/month total,' I'd use it TODAY. I'd share it with every EM I know."
- "We're a seed-stage company burning through runway. Every ₹10K matters. But the irony is we're probably wasting more money by NOT having the right AI tools than by overspending on them."

**Most surprising thing they said:**
"We're probably wasting more money by NOT having the right AI tools than by overspending." — This revealed that the audit shouldn't only flag overspending. It should also flag **underspending** — cases where upgrading a plan or adding a tool would pay for itself in developer productivity gains.

**What it changed about my design:**
Added a "You're underinvesting here" section to audit results alongside the savings recommendations. For example: "Your team of 8 has no AI code assistant — adding Cursor Pro for all engineers ($160/month) could save ~40 dev-hours/month based on industry benchmarks." This makes the tool valuable even for teams spending $0 on AI.

---

## Interview 3
**Name/Initials:** R.V. (Rohit Verma)
**Role:** Full-stack Developer (individual contributor)
**Company stage:** Mid-stage startup, 60-person company (Hyderabad)

**Context:** Rohit pays for Claude Pro ($20/month) and Cursor Pro ($20/month) out of his own pocket because his company only provides GitHub Copilot Free. He uses Claude for architecture discussions and Cursor for daily coding. He's been tracking his own AI spend in a spreadsheet.

**Quotes:**
- "I'm spending $40 a month on AI tools that my company should be paying for. But I can't convince my manager without data. If I could show him 'here's what our 15-dev team spends individually vs what a team plan would cost,' that's a conversation I can actually win."
- "I switched from ChatGPT Plus to Claude Pro three months ago and my code quality genuinely improved. But I still pay for ChatGPT because I use it for quick web searches and DALL-E. So now I'm paying for both and feel stupid about it."
- "The thing nobody talks about is context switching cost. I use three different AI tools for three different things. If one tool could cover 80% of my use cases, I'd gladly pay more for it and drop the other two."
- "I'd want this tool to be sharable — like, I run the audit, get a nice report, and forward it to my engineering manager with a subject line like 'here's how we save ₹2L/year on AI tools.' That's how purchasing decisions actually happen in Indian startups."

**Most surprising thing they said:**
"I'd want this tool to be sharable — I run the audit and forward it to my engineering manager." — This validated the shareable URL feature (`/results/:id`) as critical, not nice-to-have. The person running the audit is often NOT the person who makes the purchasing decision. The tool needs to produce a **persuasive, self-contained report** that can travel up the chain.

**What it changed about my design:**
Made the shareable results page the primary conversion point. Added OG meta tags and a polished share card so the link looks professional when shared on Slack or email. Also added a "Forward to your manager" CTA button with a pre-written email template, because the IC-to-manager handoff is the actual moment where Cost IQ drives purchasing decisions.
