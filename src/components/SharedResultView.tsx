'use client'

import ShareCard from '@/components/ShareCard'
import type { AuditResult, AuditRecommendation } from '@/lib/auditEngine'

type Props = {
  audit: AuditResult
  shareUrl: string
  recoveredFromLink?: boolean
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

const ACTION_LABELS: Record<string, string> = {
  downgrade_plan: 'Downgrade available',
  switch_tool: 'Cheaper alternative exists',
  buy_via_credits: 'Buy via Credex credits',
  already_optimal: 'Already optimal',
}

const ACTION_META: Record<string, { badgeClass: string; icon: string }> = {
  downgrade_plan: { badgeClass: 'badge-green', icon: 'v' },
  switch_tool: { badgeClass: 'badge-amber', icon: '->' },
  buy_via_credits: { badgeClass: 'badge-indigo', icon: '$' },
  already_optimal: { badgeClass: 'badge-green', icon: 'OK' },
}

function fmt(n: number) {
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function SharedResultView({
  audit,
  shareUrl,
  recoveredFromLink = false,
}: Props) {
  const actionableRecs = audit.recommendations.filter(
    (r: AuditRecommendation) => r.recommendedAction !== 'already_optimal'
  )
  const optimalRecs = audit.recommendations.filter(
    (r: AuditRecommendation) => r.recommendedAction === 'already_optimal'
  )

  return (
    <>
      {recoveredFromLink && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          This report was restored from the data in the share link.
        </div>
      )}

      <ShareCard
        totalMonthlySavings={audit.totalMonthlySavings}
        totalAnnualSavings={audit.totalAnnualSavings}
        shareUrl={shareUrl}
        toolCount={audit.inputs.length}
        useCase={audit.useCase}
      />

      {audit.summary && (
        <blockquote className="card border-l-4 border-indigo-500/60 italic text-zinc-300 text-sm leading-relaxed">
          <p className="flex items-start gap-2">
            <span className="text-indigo-400 text-lg mt-[-2px] flex-shrink-0">*</span>
            {audit.summary}
          </p>
          <footer className="mt-3 text-xs text-zinc-500 not-italic">
            AI-generated audit summary
          </footer>
        </blockquote>
      )}

      <div className="card text-center space-y-3 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% -20%, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
        />
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Potential savings
        </p>
        {audit.totalMonthlySavings > 0 ? (
          <>
            <p className="savings-big">${fmt(audit.totalMonthlySavings)}</p>
            <p className="text-zinc-300 text-lg font-medium">
              per month{' '}
              <span className="text-zinc-500 text-sm font-normal">
                (${fmt(audit.totalAnnualSavings)}/year)
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="text-5xl font-black text-emerald-400">OK</p>
            <p className="text-zinc-200 text-xl font-bold">
              AI stack is already optimised!
            </p>
          </>
        )}
      </div>

      {actionableRecs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 px-1">
            Recommendations
          </h2>

          {actionableRecs.map((rec: AuditRecommendation, i: number) => {
            const meta = ACTION_META[rec.recommendedAction]
            return (
              <article
                key={i}
                className="card-raised flex flex-col sm:flex-row sm:items-start gap-4"
                aria-label={`Audit result for ${TOOL_LABELS[rec.tool] ?? rec.tool}`}
              >
                <div className="flex-shrink-0 flex flex-col items-start gap-2">
                  <span className="text-2xl" aria-hidden="true">
                    {meta?.icon}
                  </span>
                  <span className={`badge ${meta?.badgeClass}`}>
                    {ACTION_LABELS[rec.recommendedAction]}
                  </span>
                </div>

                <div className="flex-1 space-y-1.5">
                  <h3 className="font-semibold text-zinc-100">
                    {TOOL_LABELS[rec.tool] ?? rec.tool}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Current spend: ${fmt(rec.currentSpend)}/mo
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                {rec.estimatedSavings > 0 && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xl font-bold text-emerald-400">
                      -${fmt(rec.estimatedSavings)}
                    </p>
                    <p className="text-xs text-zinc-500">/month</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {optimalRecs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 px-1">
            Already optimal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {optimalRecs.map((rec: AuditRecommendation, i: number) => (
              <article
                key={i}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
                aria-label={`Audit result for ${TOOL_LABELS[rec.tool] ?? rec.tool}`}
              >
                <span className="text-emerald-400 text-base">OK</span>
                <h3 className="text-sm text-zinc-300 font-medium">
                  {TOOL_LABELS[rec.tool] ?? rec.tool}
                </h3>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
