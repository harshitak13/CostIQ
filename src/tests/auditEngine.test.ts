// src/tests/auditEngine.test.ts
import { describe, it, expect } from 'vitest'
import { runAudit } from '../lib/auditEngine'
import type { ToolInput } from '../lib/auditEngine'

describe('Cost IQ — runAudit()', () => {

  it('returns zero savings for a user already on the cheapest plan', () => {
    const inputs: ToolInput[] = [{
      tool: 'cursor',
      plan: 'hobby',
      monthlySpend: 0,
      seats: 1,
    }]
    const result = runAudit(inputs, 1, 'coding')
    expect(result.totalMonthlySavings).toBe(0)
    expect(result.recommendations[0].recommendedAction).toBe('already_optimal')
  })

  it('flags Business plan for a 2-person team as oversized', () => {
    const inputs: ToolInput[] = [{
      tool: 'cursor',
      plan: 'business',
      monthlySpend: 80,
      seats: 2,
    }]
    const result = runAudit(inputs, 2, 'coding')
    const rec = result.recommendations.find(r => r.tool === 'cursor')
    expect(rec?.recommendedAction).toBe('downgrade_plan')
    expect(rec?.estimatedSavings).toBeGreaterThan(0)
  })

  it('calculates monthly savings correctly when downgrade is available', () => {
    const inputs: ToolInput[] = [{
      tool: 'cursor',
      plan: 'business',  // $40/seat
      monthlySpend: 120,
      seats: 3,
    }]
    const result = runAudit(inputs, 3, 'coding')
    // Pro is $20/seat → savings = (40 - 20) * 3 = $60/month
    expect(result.totalMonthlySavings).toBe(60)
    expect(result.totalAnnualSavings).toBe(720)
  })

  it('annual savings is exactly monthly * 12', () => {
    const inputs: ToolInput[] = [{
      tool: 'github_copilot',
      plan: 'pro_plus',   // $39/seat — enterprise plans have no price so use pro_plus
      monthlySpend: 390,
      seats: 10,
    }]
    const result = runAudit(inputs, 10, 'coding')
    expect(result.totalAnnualSavings).toBe(
      Math.round(result.totalMonthlySavings * 12 * 100) / 100
    )
  })

  it('does not recommend a tool switch when savings are under $5/month', () => {
    const inputs: ToolInput[] = [{
      tool: 'claude',
      plan: 'pro',
      monthlySpend: 20,
      seats: 1,
    }]
    const result = runAudit(inputs, 1, 'writing')
    const switchRecs = result.recommendations.filter(
      r => r.recommendedAction === 'switch_tool' && r.estimatedSavings < 5
    )
    expect(switchRecs).toHaveLength(0)
  })

  it('surfaces buy_via_credits when total savings opportunity exceeds $200/month', () => {
    const inputs: ToolInput[] = [
      { tool: 'cursor',         plan: 'business',  monthlySpend: 400, seats: 10 },
      { tool: 'github_copilot', plan: 'pro_plus',  monthlySpend: 390, seats: 10 },
    ]
    const result = runAudit(inputs, 10, 'coding')
    const creditsRec = result.recommendations.find(
      r => r.recommendedAction === 'buy_via_credits'
    )
    expect(creditsRec).toBeDefined()
  })

  it('handles empty inputs without throwing', () => {
    expect(() => runAudit([], 5, 'mixed')).not.toThrow()
  })

})
