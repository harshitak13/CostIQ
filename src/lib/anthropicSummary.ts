// src/lib/anthropicSummary.ts — Anthropic API integration for audit summaries
// Server-side only — never import in client components

import type { AuditResult } from './auditEngine'

// ─── Fallback ────────────────────────────────────────────────────────────────
// Used when the API call throws, times out, or returns a non-200 / empty body.
// Must be meaningful — not just "Summary unavailable".

const FALLBACK_SUMMARY = (result: AuditResult): string => {
  const { totalMonthlySavings, totalAnnualSavings, recommendations } = result
  const toolCount = result.inputs.length

  const savingsLine =
    totalMonthlySavings > 0
      ? `Our audit found $${totalMonthlySavings.toFixed(2)}/month ($${totalAnnualSavings.toFixed(2)}/year) in potential savings across your ${toolCount} AI tool${toolCount > 1 ? 's' : ''}.`
      : `Your AI stack of ${toolCount} tool${toolCount > 1 ? 's' : ''} looks well-optimised — no significant overspend detected.`

  const topRec = recommendations.find(r => r.estimatedSavings > 0)
  const actionLine = topRec
    ? `The biggest opportunity is ${topRec.tool.replace('_', ' ')}: ${topRec.reason}`
    : 'Keep monitoring as pricing changes frequently.'

  return `${savingsLine} ${actionLine}`
}

// ─── Prompt builder ──────────────────────────────────────────────────────────
// Full prompt text is documented in PROMPTS.md (Task 8)

function buildPrompt(result: AuditResult): string {
  const toolLines = result.inputs
    .map(input => {
      const rec = result.recommendations.find(r => r.tool === input.tool)
      return `- ${input.tool}: ${input.plan} plan, ${input.seats} seat(s), $${input.monthlySpend}/month. Recommendation: ${rec?.recommendedAction ?? 'none'} (saves $${rec?.estimatedSavings ?? 0}/month)`
    })
    .join('\n')

  return `You are an AI spend analyst writing a personalised audit summary for a startup. Be direct, specific, and practical. Write exactly 1 paragraph of around 100 words. Do not use bullet points. Do not use headers. Do not mention Credex. Address the founder directly as "you".

Audit data:
- Team size: ${result.teamSize}
- Primary use case: ${result.useCase}
- Total potential monthly savings: $${result.totalMonthlySavings}
- Total potential annual savings: $${result.totalAnnualSavings}

Tool breakdown:
${toolLines}

Write the summary paragraph now:`
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generateAuditSummary(
  result: AuditResult
): Promise<string> {
  try {
    const prompt = buildPrompt(result)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(8000), // 8s timeout
    })

    if (!response.ok) {
      console.error('Anthropic API error:', response.status)
      return FALLBACK_SUMMARY(result)
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text?.trim()

    // Guard against empty or suspiciously short responses
    if (!text || text.length < 20) {
      return FALLBACK_SUMMARY(result)
    }

    return text
  } catch (err) {
    console.error('generateAuditSummary failed:', err)
    return FALLBACK_SUMMARY(result)
  }
}
