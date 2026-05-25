# Metrics — Cost IQ

## North Star metric

**Qualified leads captured per week**

Why: Cost IQ exists to generate leads for Credex.
A "qualified lead" = email captured from a user whose audit
shows > $100/mo in savings potential. This is the metric that
most directly predicts Credex revenue. DAU, pageviews, and
social shares are inputs — this is the output that matters.

---

## 3 input metrics that drive the North Star

### 1. Audit completion rate
Definition: audits completed / audit forms started
Target: ≥ 70%
Why it matters: if users start but don't finish, the form
is too long or confusing. Every dropout is a lost lead.
How to instrument: fire an analytics event on form open
and on runAudit() call. Track the ratio daily.

### 2. Email capture rate (post-audit)
Definition: emails submitted / audits completed
Target: ≥ 35%
Why it matters: this is where leads are created.
Below 25% means the value proposition isn't landing —
either the savings numbers aren't compelling or the ask
feels too early.
How to instrument: fire event on LeadCapture submit success.

### 3. High-value audit rate
Definition: audits with > $500/mo savings / total audits
Target: ≥ 20%
Why it matters: only high-value audits trigger the Credex
CTA and specialist follow-up. If this rate is low, we're
attracting hobbyists rather than real startup spend.
How to instrument: log totalMonthlySavings on every
/api/audit POST. Segment by use case and team size.

---

## What I'd instrument first

In priority order:
1. Audit started event (form first interaction)
2. Audit completed event (runAudit() fires)
3. Email captured event (lead saved successfully)
4. Share link copied or X share clicked
5. Results page viewed via shareable URL
   (referral traffic, not direct)

Implementation: use a thin analytics wrapper around
window.gtag or Posthog. One function: track(event, props).
Add to SpendForm, AuditResults, LeadCapture, ShareCard.

---

## Pivot trigger

If after 30 days:
- Fewer than 50 audits completed, OR
- Email capture rate < 15%, OR
- Zero Credex consultations booked

Then the assumption that "audit value drives lead capture"
is broken. Likely cause: savings numbers are too small
to motivate action, or the wrong users are finding the tool.

Pivot options:
A. Reposition to engineering managers at Series A+
   (higher AI spend, clearer budget owner)
B. Add benchmark mode ("your spend vs companies your size")
   to increase perceived value even when savings are low
C. Gate the full report behind email earlier —
   test if curiosity converts better than demonstrated value
