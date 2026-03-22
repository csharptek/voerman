import { Tier } from '@prisma/client'

// €10 = 1 point
export const POINTS_RATE = 10

export function calculatePoints(eligibleRevenue: number): number {
  return Math.floor(eligibleRevenue / POINTS_RATE)
}

// Tier thresholds (rolling 12-month points)
export const TIER_THRESHOLDS: Record<Tier, number> = {
  BRONZE:   0,
  SILVER:   5000,
  GOLD:     15000,
  PLATINUM: 25000,
}

export function calculateTier(rollingPoints: number): Tier {
  if (rollingPoints >= TIER_THRESHOLDS.PLATINUM) return Tier.PLATINUM
  if (rollingPoints >= TIER_THRESHOLDS.GOLD)     return Tier.GOLD
  if (rollingPoints >= TIER_THRESHOLDS.SILVER)   return Tier.SILVER
  return Tier.BRONZE
}

export const TIER_ORDER: Tier[] = [Tier.BRONZE, Tier.SILVER, Tier.GOLD, Tier.PLATINUM]

export function isTierSufficient(companyTier: Tier, requiredTier: Tier): boolean {
  return TIER_ORDER.indexOf(companyTier) >= TIER_ORDER.indexOf(requiredTier)
}

// Voucher code generator: VGM-XXXXXXXX
export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'VGM-'
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Redemption expiry: 12 months from redemption
export function redemptionExpiryDate(): Date {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d
}
