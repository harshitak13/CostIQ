'use client'

import { useEffect, useState } from 'react'
import type { AuditResult, AuditRecommendation } from '@/lib/auditEngine'
import { PRICING } from '@/lib/pricingData'

type Props = {
  result: AuditResult
  onLeadCapture?: (auditId: string) => void
}

const ACTION_META: Record<
  AuditRecommendation['recommendedAction'],
  { label: string; badgeClass: string; icon: string }
> = {
  downgrade_plan:  { label: 'Downgrade Plan',     badgeClass: 'badge-green',  icon: '⬇️' },
  switch_tool:     { label: 'Switch Tool',         badgeClass: 'badge-amber',  icon: '🔄' },
  buy_via_credits: { label: 'Buy via Credex',      badgeClass: 'badge-indigo', icon: '💳' },
  already_optimal: { label: 'Already Optimal',     badgeClass: 'badge-green',  icon: '✅' },
}

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  github_copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  anthropic_api: 'Anthropic API',
  openai_api: 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AuditResults({ result, onLeadCapture }: Props) {
  const [summary, setSummary]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)

  const hasRealSavings = result.totalMonthlySavings > 0
  const isSpendingWell = result.totalMonthlySavings < 100
  const showCredexCTA  = result.totalMonthlySavings > 500
  const actionableRecs = result.recommendations.filter(
    r => r.recommendedAction !== 'already_optimal'
  )
  const optimalRecs = result.recommendations.filter(
    r => r.recommendedAction === 'already_optimal'
  )

  // POST to /api/audit on mount to save result + get AI summary + UUID
  useEffect(() => {
    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) onLeadCapture?.(data.id)
        if (data.summary) setSummary(data.summary)
      })
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      id="audit-results"
      className="w-full space-y-6 animate-fade-up"
      aria-label="Audit Results"
    >
      {/* ── Summary banner ── */}
      <div className="card text-center space-y-3 relative overflow-hidden">
        {/* decorative glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% -20%, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
        />

        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Your audit results
        </p>

        {hasRealSavings ? (
          <>
            <p className="savings-big text-4xl sm:text-6xl">${fmt(result.totalMonthlySavings)}</p>
            <p className="text-zinc-300 text-lg font-medium">
              potential monthly savings&nbsp;
              <span className="text-zinc-500 text-sm font-normal">
                (${fmt(result.totalAnnualSavings)}/year)
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="text-5xl font-black text-emerald-400">🎉</p>
            <p className="text-zinc-200 text-xl font-bold">
              Your AI stack is already optimised!
            </p>
            <p className="text-zinc-400 text-sm">
              No obvious savings found — you&apos;re on the right plans.
            </p>
          </>
        )}
      </div>

      {/* ── AI summary blockquote ── */}
      {loading ? (
        <div
          className="card space-y-3"
          style={{ minHeight: '80px' }}
          aria-label="Loading AI summary"
          role="status"
        >
          <div className="skeleton-line w-full" />
          <div className="skeleton-line w-11/12" />
          <div className="skeleton-line w-9/12" />
        </div>
      ) : summary ? (
        <blockquote className="card border-l-4 border-indigo-500/60 italic text-zinc-300 text-sm leading-relaxed animate-fade-up">
          <p className="flex items-start gap-2">
            <span className="text-indigo-400 text-lg mt-[-2px] flex-shrink-0">✦</span>
            {summary}
          </p>
          <footer className="mt-3 text-xs text-zinc-500 not-italic">
            — AI-generated audit summary
          </footer>
        </blockquote>
      ) : null}

      {/* ── Actionable recommendations ── */}
      {actionableRecs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 px-1">
            Recommendations
          </h2>

          {actionableRecs.map((rec, i) => {
            const meta = ACTION_META[rec.recommendedAction]
            const vendor = PRICING[rec.tool]?.vendor ?? TOOL_LABELS[rec.tool] ?? rec.tool
            const altVendor =
              rec.suggestedTool
                ? PRICING[rec.suggestedTool]?.vendor ?? TOOL_LABELS[rec.suggestedTool]
                : undefined

            return (
              <article
                key={i}
                className="card-raised flex flex-col sm:flex-row sm:items-start gap-4"
                aria-label={`Audit result for ${TOOL_LABELS[rec.tool] ?? rec.tool}`}
              >
                {/* left: icon + badges */}
                <div className="flex-shrink-0 flex flex-col items-start gap-2">
                  <span className="text-2xl" role="img" aria-label={meta.label}>
                    {meta.icon}
                  </span>
                  <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>
                </div>

                {/* middle: text */}
                <div className="flex-1 space-y-1.5">
                  <h3 className="font-semibold text-zinc-100">
                    {vendor}
                    {altVendor && (
                      <span className="text-zinc-400 font-normal">
                        {' '}→ {altVendor}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{rec.reason}</p>
                </div>

                {/* right: savings */}
                {rec.estimatedSavings > 0 && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xl font-bold text-emerald-400">
                      −${fmt(rec.estimatedSavings)}
                    </p>
                    <p className="text-xs text-zinc-500">/month</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {/* ── Already optimal tools ── */}
      {optimalRecs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 px-1">
            Already optimal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {optimalRecs.map((rec, i) => {
              const vendor = PRICING[rec.tool]?.vendor ?? TOOL_LABELS[rec.tool] ?? rec.tool
              return (
                <article
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
                  aria-label={`Audit result for ${TOOL_LABELS[rec.tool] ?? rec.tool}`}
                >
                  <span className="text-emerald-400 text-base">✓</span>
                  <h3 className="text-sm text-zinc-300 font-medium">{vendor}</h3>
                </article>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Credex CTA — high savings (>$500/mo) ── */}
      {showCredexCTA && (
        <div className="card relative overflow-hidden border-indigo-500/30">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 120%, rgba(99,102,241,0.15) 0%, transparent 70%)',
            }}
          />
          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              💳 Credex Credits
            </div>
            <h3 className="text-zinc-100 text-lg font-bold">
              You could save ${fmt(result.totalMonthlySavings)} more with Credex credits
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
              Credex sells discounted AI infrastructure credits — Cursor, Claude,
              ChatGPT Enterprise and others — sourced from companies that
              overforecast. Real discounts, same tools.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn inline-flex mt-1"
            >
              Book a free Credex consultation →
            </a>
          </div>
        </div>
      )}

      {/* ── Spending well — low savings (<$100/mo) ── */}
      {isSpendingWell && (
        <div className="card text-center space-y-2">
          <p className="text-3xl">🎯</p>
          <h3 className="text-zinc-100 font-bold">You&apos;re spending well on AI.</h3>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
            No significant overspend detected in your current stack.
            We&apos;ll notify you when new optimisations apply to your tools.
          </p>
        </div>
      )}

      {/* ── Totals footer ── */}
      {hasRealSavings && !isSpendingWell && (
        <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/40 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">
              Total potential savings
            </p>
            <p className="text-zinc-200 text-sm">
              If you act on all recommendations above
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-emerald-400">
              ${fmt(result.totalMonthlySavings)}<span className="text-base font-normal text-zinc-500">/mo</span>
            </p>
            <p className="text-sm text-zinc-400">
              ${fmt(result.totalAnnualSavings)} per year
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
