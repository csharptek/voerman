import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { ok } from '../lib/response'
import { authenticate } from '../middleware/auth'
import { TIER_THRESHOLDS } from '../lib/points'
import { Tier } from '@prisma/client'

const router = Router()
router.use(authenticate)

const TIER_DETAILS = {
  BRONZE: {
    range: '0 – 5,000 pts',
    redemptionCap: 'Up to 20% per booking',
    pointExpiry: '12 months',
    earningRate: '€10 = 1 point',
    perks: [
      'Access to basic rewards catalog',
      'Standard point earning rate: €10 = 1 point',
      'Quarterly account statements',
      'Email support within 48 hours',
    ],
  },
  SILVER: {
    range: '5,000 – 15,000 pts',
    redemptionCap: 'Up to 25% per booking',
    pointExpiry: '15 months',
    earningRate: '€10 = 1.1 points',
    perks: [
      'Access to extended rewards catalog',
      'Enhanced point earning: €10 = 1.1 points',
      'Monthly account statements',
      'Priority email support within 24 hours',
      'Quarterly business reviews',
      'Access to seasonal promotions',
    ],
  },
  GOLD: {
    range: '15,000 – 25,000 pts',
    redemptionCap: 'Up to 30% per booking',
    pointExpiry: '18 months',
    earningRate: '€10 = 1.25 points',
    perks: [
      'Access to premium rewards catalog',
      'Premium point earning: €10 = 1.25 points',
      'Real-time points tracking',
      'Dedicated account manager',
      '24/7 priority support',
      'Exclusive partner events',
      'Early access to new services',
      'Flexible redemption options',
    ],
  },
  PLATINUM: {
    range: '25,000+ pts',
    redemptionCap: 'Up to 35% per booking',
    pointExpiry: '24 months',
    earningRate: '€10 = 1.5 points',
    perks: [
      'Access to all rewards including exclusive offers',
      'Elite point earning: €10 = 1.5 points',
      'Real-time dashboard & analytics',
      'Senior relationship manager',
      'White-glove 24/7 support',
      'VIP partner events & networking',
      'Beta access to innovations',
      'Customized reward packages',
      'Annual partnership review with executives',
    ],
  },
}

router.get('/', async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where:  { id: req.user!.companyId },
    select: { tier: true, pointsBalance: true },
  })

  const tiers = Object.entries(TIER_DETAILS).map(([tier, detail]) => ({
    tier,
    ...detail,
    threshold: TIER_THRESHOLDS[tier as Tier],
    isCurrent: tier === company!.tier,
    isUnlocked: Object.keys(TIER_DETAILS).indexOf(tier) <=
                Object.keys(TIER_DETAILS).indexOf(company!.tier),
  }))

  const tierOrder: Tier[] = [Tier.BRONZE, Tier.SILVER, Tier.GOLD, Tier.PLATINUM]
  const currentIndex = tierOrder.indexOf(company!.tier)
  const nextTier = tierOrder[currentIndex + 1] as Tier | undefined

  return ok(res, {
    currentTier:      company!.tier,
    currentPoints:    company!.pointsBalance,
    nextTier:         nextTier ?? null,
    pointsToNextTier: nextTier ? Math.max(0, TIER_THRESHOLDS[nextTier] - company!.pointsBalance) : 0,
    tiers,
  })
})

export default router
