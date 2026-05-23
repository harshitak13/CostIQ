'use client'

import type { AuditResult, AuditRecommendation } from '@/lib/auditEngine'
import { PRICING } from '@/lib/pricingData'

type Props = {
  result: AuditResult
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

export default function AuditResults({ result }: Props) {
  const hasRealSavings = result.totalMonthlySavings > 0
  const actionableRecs = result.recommendations.filter(
    r => r.recommendedAction !== 'already_optimal'
  )
  const optimalRecs = result.recommendations.filter(
    r => r.recommendedAction === 'already_optimal'
  )

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
            <p className="savings-big">${fmt(result.totalMonthlySavings)}</p>
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
              <div
                key={i}
                className="card-raised flex flex-col sm:flex-row sm:items-start gap-4"
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
                  <p className="font-semibold text-zinc-100">
                    {vendor}
                    {altVendor && (
                      <span className="text-zinc-400 font-normal">
                        {' '}→ {altVendor}
                      </span>
                    )}
                  </p>
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
              </div>
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
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
                >
                  <span className="text-emerald-400 text-base">✓</span>
                  <span className="text-sm text-zinc-300">{vendor}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Totals footer ── */}
      {hasRealSavings && (
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
