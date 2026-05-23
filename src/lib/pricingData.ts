// src/lib/pricingData.ts — AI tool pricing database
// All prices verified as of 2026-05-22. Source: PRICING_DATA.md

import type { AITool } from './auditEngine'

export type PlanTier = {
  planId: string
  label: string
  pricePerSeatPerMonth: number  // 0 if free
  minSeats?: number
  maxSeats?: number
  isEnterprise?: boolean        // true = custom pricing, contact sales
  bestFor: ('coding' | 'writing' | 'data' | 'research' | 'mixed')[]
}

export type ToolPricing = {
  tool: AITool
  vendor: string
  plans: PlanTier[]
  alternatives?: AITool[]       // cheaper tools with similar capability
}

export const PRICING: Record<AITool, ToolPricing> = {
  // ─── Cursor ──────────────────────────────────────────────────────────────
  cursor: {
    tool: 'cursor',
    vendor: 'Cursor',
    plans: [
      {
        planId: 'hobby',
        label: 'Hobby',
        pricePerSeatPerMonth: 0,
        bestFor: ['coding'],
      },
      {
        planId: 'pro',
        label: 'Pro',
        pricePerSeatPerMonth: 20,
        bestFor: ['coding'],
      },
      {
        planId: 'business',
        label: 'Business',
        pricePerSeatPerMonth: 40,
        minSeats: 3,
        bestFor: ['coding'],
      },
      {
        planId: 'enterprise',
        label: 'Enterprise',
        pricePerSeatPerMonth: 0,
        isEnterprise: true,
        bestFor: ['coding'],
      },
    ],
    alternatives: ['github_copilot', 'windsurf'],
  },

  // ─── GitHub Copilot ──────────────────────────────────────────────────────
  github_copilot: {
    tool: 'github_copilot',
    vendor: 'GitHub Copilot',
    plans: [
      {
        planId: 'free',
        label: 'Free',
        pricePerSeatPerMonth: 0,
        bestFor: ['coding'],
      },
      {
        planId: 'pro',
        label: 'Pro',
        pricePerSeatPerMonth: 10,
        bestFor: ['coding'],
      },
      {
        planId: 'pro_plus',
        label: 'Pro+',
        pricePerSeatPerMonth: 39,
        bestFor: ['coding'],
      },
      {
        planId: 'business',
        label: 'Business',
        pricePerSeatPerMonth: 0,
        isEnterprise: true,
        bestFor: ['coding', 'mixed'],
      },
      {
        planId: 'enterprise',
        label: 'Enterprise',
        pricePerSeatPerMonth: 0,
        isEnterprise: true,
        bestFor: ['coding', 'mixed'],
      },
    ],
    alternatives: ['cursor', 'windsurf'],
  },

  // ─── Claude (Anthropic consumer) ─────────────────────────────────────────
  claude: {
    tool: 'claude',
    vendor: 'Anthropic',
    plans: [
      {
        planId: 'free',
        label: 'Free',
        pricePerSeatPerMonth: 0,
        bestFor: ['writing', 'research', 'mixed'],
      },
      {
        planId: 'pro',
        label: 'Pro',
        pricePerSeatPerMonth: 20,
        bestFor: ['writing', 'research', 'mixed'],
      },
      {
        // $100/month for 5× usage; treating as single-seat plan
        planId: 'max_5x',
        label: 'Max (5×)',
        pricePerSeatPerMonth: 100,
        bestFor: ['writing', 'research', 'data', 'mixed'],
      },
      {
        // $200/month for 20× usage
        planId: 'max_20x',
        label: 'Max (20×)',
        pricePerSeatPerMonth: 200,
        bestFor: ['writing', 'research', 'data', 'mixed'],
      },
      {
        // $30/seat/month billed monthly; annual is $25/seat/month
        planId: 'team',
        label: 'Team',
        pricePerSeatPerMonth: 30,
        minSeats: 2,
        bestFor: ['writing', 'research', 'data', 'mixed'],
      },
      {
        planId: 'enterprise',
        label: 'Enterprise',
        pricePerSeatPerMonth: 0,
        isEnterprise: true,
        bestFor: ['writing', 'research', 'data', 'coding', 'mixed'],
      },
    ],
    alternatives: ['chatgpt'],
  },

  // ─── ChatGPT (OpenAI consumer) ────────────────────────────────────────────
  chatgpt: {
    tool: 'chatgpt',
    vendor: 'OpenAI',
    plans: [
      {
        planId: 'free',
        label: 'Free',
        pricePerSeatPerMonth: 0,
        bestFor: ['writing', 'research', 'mixed'],
      },
      {
        planId: 'plus',
        label: 'Plus',
        pricePerSeatPerMonth: 20,
        bestFor: ['writing', 'research', 'mixed'],
      },
      {
        planId: 'pro',
        label: 'Pro',
        pricePerSeatPerMonth: 200,
        bestFor: ['writing', 'research', 'data', 'mixed'],
      },
      {
        // $25/user/month billed monthly (2-seat min)
        planId: 'business',
        label: 'Business',
        pricePerSeatPerMonth: 25,
        minSeats: 2,
        bestFor: ['writing', 'research', 'data', 'mixed'],
      },
      {
        // Estimated $45–75/seat; using $60 as midpoint. 150-seat min.
        planId: 'enterprise',
        label: 'Enterprise',
        pricePerSeatPerMonth: 0,
        isEnterprise: true,
        minSeats: 150,
        bestFor: ['writing', 'research', 'data', 'coding', 'mixed'],
      },
    ],
    alternatives: ['claude'],
  },

  // ─── Anthropic API (direct, usage-based) ─────────────────────────────────
  // Represented as approximate monthly cost bands for a typical startup.
  // Prices are per 1M tokens; we map them to rough monthly spend tiers.
  anthropic_api: {
    tool: 'anthropic_api',
    vendor: 'Anthropic API',
    plans: [
      {
        // Free-tier / very light usage — well within rate limits
        planId: 'haiku',
        label: 'Haiku 4.5 (avg ~$50/mo)',
        pricePerSeatPerMonth: 50,
        bestFor: ['coding', 'writing', 'data', 'research', 'mixed'],
      },
      {
        // Mid-level Sonnet usage
        planId: 'sonnet',
        label: 'Sonnet 4 (avg ~$200/mo)',
        pricePerSeatPerMonth: 200,
        bestFor: ['coding', 'writing', 'data', 'research', 'mixed'],
      },
      {
        // Heavy Opus usage
        planId: 'opus',
        label: 'Opus 4 (avg ~$800/mo)',
        pricePerSeatPerMonth: 800,
        bestFor: ['coding', 'writing', 'data', 'research', 'mixed'],
      },
    ],
    alternatives: ['openai_api'],
  },

  // ─── OpenAI API (direct, usage-based) ────────────────────────────────────
  openai_api: {
    tool: 'openai_api',
    vendor: 'OpenAI API',
    plans: [
      {
        // Budget tier — GPT-4.1 Nano / o4-mini
        planId: 'nano',
        label: 'Budget models (avg ~$30/mo)',
        pricePerSeatPerMonth: 30,
        bestFor: ['coding', 'writing', 'data', 'research', 'mixed'],
      },
      {
        // Standard production — GPT-4o / GPT-4.1 / o3
        planId: 'standard',
        label: 'Standard models (avg ~$150/mo)',
        pricePerSeatPerMonth: 150,
        bestFor: ['coding', 'writing', 'data', 'research', 'mixed'],
      },
      {
        // Premium — o3-Pro
        planId: 'premium',
        label: 'Premium models (avg ~$600/mo)',
        pricePerSeatPerMonth: 600,
        bestFor: ['coding', 'writing', 'data', 'research', 'mixed'],
      },
    ],
    alternatives: ['anthropic_api'],
  },

  // ─── Gemini (Google) ──────────────────────────────────────────────────────
  gemini: {
    tool: 'gemini',
    vendor: 'Google',
    plans: [
      {
        planId: 'free',
        label: 'Free',
        pricePerSeatPerMonth: 0,
        bestFor: ['writing', 'research', 'mixed'],
      },
      {
        // Google One AI Plus — ~$7.99/month
        planId: 'ai_plus',
        label: 'AI Plus',
        pricePerSeatPerMonth: 7.99,
        bestFor: ['writing', 'research', 'mixed'],
      },
      {
        // Google One AI Pro — ~$19.99/month
        planId: 'ai_pro',
        label: 'AI Pro',
        pricePerSeatPerMonth: 19.99,
        bestFor: ['writing', 'research', 'data', 'mixed'],
      },
      {
        // AI Ultra — $100/month (20TB, 5× limits)
        planId: 'ai_ultra',
        label: 'AI Ultra',
        pricePerSeatPerMonth: 100,
        bestFor: ['writing', 'research', 'data', 'mixed'],
      },
      {
        // AI Ultra — $200/month (30TB, 20× limits)
        planId: 'ai_ultra_20x',
        label: 'AI Ultra (20×)',
        pricePerSeatPerMonth: 200,
        bestFor: ['writing', 'research', 'data', 'mixed'],
      },
    ],
    alternatives: ['claude', 'chatgpt'],
  },

  // ─── Windsurf (Codeium) ──────────────────────────────────────────────────
  windsurf: {
    tool: 'windsurf',
    vendor: 'Codeium',
    plans: [
      {
        planId: 'free',
        label: 'Free',
        pricePerSeatPerMonth: 0,
        bestFor: ['coding'],
      },
      {
        planId: 'pro',
        label: 'Pro',
        pricePerSeatPerMonth: 15,
        bestFor: ['coding'],
      },
      {
        planId: 'teams',
        label: 'Teams',
        pricePerSeatPerMonth: 30,
        minSeats: 3,
        bestFor: ['coding', 'mixed'],
      },
      {
        planId: 'enterprise',
        label: 'Enterprise',
        pricePerSeatPerMonth: 0,
        isEnterprise: true,
        bestFor: ['coding', 'mixed'],
      },
    ],
    alternatives: ['cursor', 'github_copilot'],
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getPlan(tool: AITool, planId: string): PlanTier | undefined {
  return PRICING[tool]?.plans.find(p => p.planId === planId)
}

export function getCheaperPlans(tool: AITool, currentPlanId: string): PlanTier[] {
  const current = getPlan(tool, currentPlanId)
  if (!current) return []
  return PRICING[tool].plans.filter(
    p => p.pricePerSeatPerMonth < current.pricePerSeatPerMonth && !p.isEnterprise
  )
}
