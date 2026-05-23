// src/lib/auditEngine.ts — Core audit logic (pure, no API calls, fully testable)

import { PRICING, getCheaperPlans } from './pricingData'
import type { PlanTier } from './pricingData'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AITool =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'

export type ToolInput = {
  tool: AITool
  plan: string
  monthlySpend: number
  seats: number
}

export type AuditRecommendation = {
  tool: AITool
  currentSpend: number
  recommendedAction:
    | 'downgrade_plan'
    | 'switch_tool'
    | 'buy_via_credits'
    | 'already_optimal'
  suggestedPlan?: string
  suggestedTool?: AITool
  estimatedSavings: number      // monthly
  reason: string
}

export type AuditResult = {
  id?: string
  inputs: ToolInput[]
  teamSize: number
  useCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed'
  recommendations: AuditRecommendation[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  summary?: string              // filled by Anthropic API on Day 3
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Returns the cheapest non-enterprise plan for a tool that covers the given use case */
function getCheapestAlternativePlan(tool: AITool): PlanTier | undefined {
  const toolPricing = PRICING[tool]
  if (!toolPricing) return undefined
  const nonEnterprise = toolPricing.plans.filter(p => !p.isEnterprise)
  if (nonEnterprise.length === 0) return undefined
  return nonEnterprise.reduce((min, p) =>
    p.pricePerSeatPerMonth < min.pricePerSeatPerMonth ? p : min
  )
}

// ─── runAudit ────────────────────────────────────────────────────────────────

export function runAudit(
  inputs: ToolInput[],
  teamSize: number,
  useCase: AuditResult['useCase']
): AuditResult {
  const recommendations: AuditRecommendation[] = []

  for (const input of inputs) {
    const toolPricing = PRICING[input.tool]
    if (!toolPricing) continue

    const currentPlan = toolPricing.plans.find(p => p.planId === input.plan)
    const currentPricePerSeat = currentPlan?.pricePerSeatPerMonth ?? 0
    const currentSpend = round2(currentPricePerSeat * input.seats)

    let handled = false

    // ── Check 1: Right plan for seat count ───────────────────────────────────
    // Flag Team/Business plans used by very small teams (< minSeats threshold)
    if (
      currentPlan &&
      !currentPlan.isEnterprise &&
      currentPlan.minSeats !== undefined &&
      input.seats < currentPlan.minSeats
    ) {
      // Find the best single-seat plan for their use case
      const betterPlans = toolPricing.plans
        .filter(
          p =>
            !p.isEnterprise &&
            p.planId !== input.plan &&
            p.pricePerSeatPerMonth < currentPricePerSeat &&
            (p.bestFor.includes(useCase) || useCase === 'mixed' || p.bestFor.includes('mixed'))
        )
        .sort((a, b) => a.pricePerSeatPerMonth - b.pricePerSeatPerMonth)

      if (betterPlans.length > 0) {
        const better = betterPlans[betterPlans.length - 1] // best affordable plan
        const savings = round2((currentPricePerSeat - better.pricePerSeatPerMonth) * input.seats)
        recommendations.push({
          tool: input.tool,
          currentSpend,
          recommendedAction: 'downgrade_plan',
          suggestedPlan: better.planId,
          estimatedSavings: savings,
          reason: `Team/Business plans are designed for ${currentPlan.minSeats}+ users. With ${input.seats} seat${input.seats !== 1 ? 's' : ''}, the ${better.label} plan covers the same features at $${savings.toFixed(2)} less/month.`,
        })
        handled = true
      }
    }

    // ── Check 2: Cheaper plan from same vendor ───────────────────────────────
    if (!handled) {
      const cheaperPlans = getCheaperPlans(input.tool, input.plan).filter(
        p =>
          p.bestFor.includes(useCase) || useCase === 'mixed' || p.bestFor.includes('mixed')
      )

      if (cheaperPlans.length > 0) {
        // Pick the most feature-rich cheaper plan (highest price below current)
        const best = cheaperPlans.reduce((max, p) =>
          p.pricePerSeatPerMonth > max.pricePerSeatPerMonth ? p : max
        )
        const savings = round2((currentPricePerSeat - best.pricePerSeatPerMonth) * input.seats)

        if (savings > 0) {
          recommendations.push({
            tool: input.tool,
            currentSpend,
            recommendedAction: 'downgrade_plan',
            suggestedPlan: best.planId,
            estimatedSavings: savings,
            reason: `Switching from ${currentPlan?.label ?? input.plan} to ${best.label} on ${toolPricing.vendor} would save $${savings.toFixed(2)}/month ($${round2(savings * 12).toFixed(2)}/year) with no significant feature loss for your use case.`,
          })
          handled = true
        }
      }
    }

    // ── Check 3: Cheaper alternative tool ───────────────────────────────────
    if (!handled && toolPricing.alternatives && toolPricing.alternatives.length > 0) {
      let bestAltTool: AITool | undefined
      let bestAltPlan: PlanTier | undefined
      let bestSavings = 0

      for (const altTool of toolPricing.alternatives) {
        const altPricing = PRICING[altTool]
        if (!altPricing) continue

        const cheapestAlt = getCheapestAlternativePlan(altTool)
        if (!cheapestAlt) continue

        // Only recommend alternatives that cover the use case
        const covers =
          cheapestAlt.bestFor.includes(useCase) ||
          useCase === 'mixed' ||
          cheapestAlt.bestFor.includes('mixed')
        if (!covers) continue

        const savings = round2(
          (currentPricePerSeat - cheapestAlt.pricePerSeatPerMonth) * input.seats
        )

        if (savings > bestSavings) {
          bestSavings = savings
          bestAltTool = altTool
          bestAltPlan = cheapestAlt
        }
      }

      // Only surface the recommendation if savings exceed $5/month
      if (bestSavings >= 5 && bestAltTool && bestAltPlan) {
        recommendations.push({
          tool: input.tool,
          currentSpend,
          recommendedAction: 'switch_tool',
          suggestedTool: bestAltTool,
          suggestedPlan: bestAltPlan.planId,
          estimatedSavings: bestSavings,
          reason: `${PRICING[bestAltTool].vendor} ${bestAltPlan.label} ($${bestAltPlan.pricePerSeatPerMonth}/seat/mo) covers similar ${useCase} workflows at $${bestSavings.toFixed(2)}/month less than your current ${toolPricing.vendor} plan.`,
        })
        handled = true
      }
    }

    // ── Already optimal ──────────────────────────────────────────────────────
    if (!handled) {
      recommendations.push({
        tool: input.tool,
        currentSpend,
        recommendedAction: 'already_optimal',
        estimatedSavings: 0,
        reason: `${toolPricing.vendor} ${currentPlan?.label ?? input.plan} is already the most cost-effective option for your team size and use case.`,
      })
    }
  }

  // ── Check 4: Retail vs credits ────────────────────────────────────────────
  // Calculate total monthly savings opportunity from checks 1-3
  const savingsFromOptimizations = recommendations.reduce(
    (sum, r) => sum + r.estimatedSavings,
    0
  )

  if (savingsFromOptimizations > 200 && inputs.length > 0) {
    // Find the highest-spend tool
    const highestSpendInput = inputs.reduce((max, inp) =>
      inp.monthlySpend > max.monthlySpend ? inp : max
    )
    const creditsEstimate = round2(highestSpendInput.monthlySpend * 0.2)

    recommendations.push({
      tool: highestSpendInput.tool,
      currentSpend: highestSpendInput.monthlySpend,
      recommendedAction: 'buy_via_credits',
      estimatedSavings: creditsEstimate,
      reason: `Your team spends $${round2(inputs.reduce((s, i) => s + i.monthlySpend, 0)).toFixed(2)}/month on AI tools. Credex sells discounted credits for ${PRICING[highestSpendInput.tool]?.vendor ?? highestSpendInput.tool} — at a conservative 20% discount, that's ~$${creditsEstimate.toFixed(2)}/month in immediate savings on your highest single-tool spend.`,
    })
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalMonthlySavings = round2(
    recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0)
  )

  return {
    inputs,
    teamSize,
    useCase,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings: round2(totalMonthlySavings * 12),
  }
}
