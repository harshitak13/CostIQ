import ShareCard from '@/components/ShareCard'
import ResultFallback from '@/components/ResultFallback'
import { getReadSupabaseClient } from '@/lib/supabaseClient'
import type { AuditResult, AuditRecommendation } from '@/lib/auditEngine'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

function getSupabase() {
  const supabase = getReadSupabaseClient()
  if (!supabase) {
    throw new Error('Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing.')
  }
  return supabase
}

async function getAudit(id: string): Promise<AuditResult | null> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`[getAudit] Supabase error fetching audit ID ${id}:`, error)
      return null
    }

    if (!data) {
      console.error(`[getAudit] No audit found in DB for ID ${id}`)
      return null
    }

    // Map snake_case DB columns back to camelCase AuditResult shape
    return {
      id: data.id,
      inputs: data.inputs,
      teamSize: data.team_size,
      useCase: data.use_case,
      recommendations: data.recommendations,
      totalMonthlySavings: data.total_monthly_savings,
      totalAnnualSavings: data.total_annual_savings,
      summary: data.summary,
    }
  } catch (err) {
    console.error(`[getAudit] Exception fetching audit ID ${id}:`, err)
    return null
  }
}

// OG metadata — generated per audit
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const audit = await getAudit(id)
  if (!audit) return { title: 'Audit not found — Cost IQ' }

  const savings = audit.totalMonthlySavings > 0
    ? `$${audit.totalMonthlySavings.toFixed(2)}/mo savings found`
    : 'AI stack looks optimised'

  return {
    title: `Cost IQ Audit — ${savings}`,
    description: audit.summary ??
      `This team audited their AI stack with Cost IQ and found $${audit.totalMonthlySavings.toFixed(2)}/month in potential savings.`,
    openGraph: {
      title: `Cost IQ Audit — ${savings}`,
      description: audit.summary?.slice(0, 160) ??
        `AI spend audit: $${audit.totalMonthlySavings.toFixed(2)}/mo in potential savings identified.`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/results/${audit.id}`,
      siteName: 'Cost IQ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Cost IQ Audit — ${savings}`,
      description: audit.summary?.slice(0, 160) ??
        `AI spend audit: $${audit.totalMonthlySavings.toFixed(2)}/mo in potential savings identified.`,
    },
  }
}

const TOOL_LABELS: Record<string, string> = {
  cursor:         'Cursor',
  github_copilot: 'GitHub Copilot',
  claude:         'Claude',
  chatgpt:        'ChatGPT',
  anthropic_api:  'Anthropic API',
  openai_api:     'OpenAI API',
  gemini:         'Gemini',
  windsurf:       'Windsurf',
}

const ACTION_LABELS: Record<string, string> = {
  downgrade_plan:  'Downgrade available',
  switch_tool:     'Cheaper alternative exists',
  buy_via_credits: 'Buy via Credex credits',
  already_optimal: 'Already optimal',
}

const ACTION_META: Record<string, { badgeClass: string; icon: string }> = {
  downgrade_plan:  { badgeClass: 'badge-green',  icon: '⬇️' },
  switch_tool:     { badgeClass: 'badge-amber',  icon: '🔄' },
  buy_via_credits: { badgeClass: 'badge-indigo', icon: '💳' },
  already_optimal: { badgeClass: 'badge-green',  icon: '✅' },
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params
  const audit = await getAudit(id)
  if (!audit) {
    return (
      <main
        id="main-content"
        className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-up"
      >
        <nav className="flex items-center justify-between">
          <a href={process.env.NEXT_PUBLIC_BASE_URL ?? '/'} className="font-extrabold text-lg tracking-tight gradient-text">
            Cost IQ
          </a>
          <span className="badge badge-indigo">Shared audit</span>
        </nav>

        <ResultFallback auditId={id} />
      </main>
    )
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '')
  const shareUrl = `${baseUrl}/results/${audit.id}`

  const actionableRecs = audit.recommendations.filter(
    (r: AuditRecommendation) => r.recommendedAction !== 'already_optimal'
  )
  const optimalRecs = audit.recommendations.filter(
    (r: AuditRecommendation) => r.recommendedAction === 'already_optimal'
  )

  return (
    <main
      id="main-content"
      className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-up"
    >
      {/* Nav */}
      <nav className="flex items-center justify-between">
        <a href={process.env.NEXT_PUBLIC_BASE_URL ?? '/'} className="font-extrabold text-lg tracking-tight gradient-text">
          Cost IQ
        </a>
        <span className="badge badge-green">Shared audit</span>
      </nav>

      {/* Share card — shown at top for viral loop */}
      <ShareCard
        totalMonthlySavings={audit.totalMonthlySavings}
        totalAnnualSavings={audit.totalAnnualSavings}
        shareUrl={shareUrl}
        toolCount={audit.inputs.length}
        useCase={audit.useCase}
      />

      {/* AI summary */}
      {audit.summary && (
        <blockquote className="card border-l-4 border-indigo-500/60 italic text-zinc-300 text-sm leading-relaxed">
          <p className="flex items-start gap-2">
            <span className="text-indigo-400 text-lg mt-[-2px] flex-shrink-0">✦</span>
            {audit.summary}
          </p>
          <footer className="mt-3 text-xs text-zinc-500 not-italic">
            — AI-generated audit summary
          </footer>
        </blockquote>
      )}

      {/* Hero savings */}
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
              per month&nbsp;
              <span className="text-zinc-500 text-sm font-normal">
                (${fmt(audit.totalAnnualSavings)}/year)
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="text-5xl font-black text-emerald-400">🎉</p>
            <p className="text-zinc-200 text-xl font-bold">
              AI stack is already optimised!
            </p>
          </>
        )}
      </div>

      {/* Actionable recommendations */}
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
                {/* Left: icon + badges */}
                <div className="flex-shrink-0 flex flex-col items-start gap-2">
                  <span className="text-2xl" role="img" aria-label={ACTION_LABELS[rec.recommendedAction]}>
                    {meta?.icon}
                  </span>
                  <span className={`badge ${meta?.badgeClass}`}>
                    {ACTION_LABELS[rec.recommendedAction]}
                  </span>
                </div>

                {/* Middle: text */}
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

                {/* Right: savings */}
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

      {/* Already optimal tools */}
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
                <span className="text-emerald-400 text-base">✓</span>
                <h3 className="text-sm text-zinc-300 font-medium">{TOOL_LABELS[rec.tool] ?? rec.tool}</h3>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA — viral loop */}
      <div className="card text-center space-y-4 border-indigo-500/20">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 120%, rgba(99,102,241,0.12) 0%, transparent 70%)',
          }}
        />
        <p className="text-zinc-300 text-lg font-semibold">
          Want to know if you&apos;re overspending on AI tools?
        </p>
        <a
          href={process.env.NEXT_PUBLIC_BASE_URL ?? '/'}
          className="cta-btn inline-flex"
        >
          Run your own free Cost IQ audit →
        </a>
      </div>
    </main>
  )
}
