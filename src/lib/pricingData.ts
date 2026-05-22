// src/lib/pricingData.ts — AI tool pricing database

// TODO: populate with verified pricing data on Day 2
// See PRICING_DATA.md for the full pricing matrix

export type PricingTier = {
  name: string
  pricePerSeatPerMonth: number
  features: string[]
  url: string
  verifiedDate: string
}

export type ToolPricing = {
  tool: string
  tiers: PricingTier[]
}

export const pricingData: ToolPricing[] = [
  // TODO: fill in on Day 2
]
