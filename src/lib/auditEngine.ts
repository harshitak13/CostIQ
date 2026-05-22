// src/lib/auditEngine.ts — Core audit logic

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
  recommendedAction: string
  estimatedSavings: number
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
  summary?: string
}

export function runAudit(
  _inputs: ToolInput[],
  _teamSize: number,
  _useCase: AuditResult['useCase']
): AuditResult {
  // TODO: implement on Day 2
  throw new Error('Not implemented yet')
}
