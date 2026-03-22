import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { ok, paginated } from '../lib/response'
import { authenticate } from '../middleware/auth'
import { TIER_THRESHOLDS } from '../lib/points'
import { Tier } from '@prisma/client'

const router = Router()
router.use(authenticate)

const TIER_ORDER: Tier[] = [Tier.BRONZE, Tier.SILVER, Tier.GOLD, Tier.PLATINUM]

// ── GET /points/balance ───────────────────────────────────────────────────────
router.get('/balance', async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { id: req.user!.companyId },
    select: { pointsBalance: true, tier: true },
  })

  const currentTierIndex = TIER_ORDER.indexOf(company!.tier)
  const nextTier = TIER_ORDER[currentTierIndex + 1] as Tier | undefined
  const pointsToNextTier = nextTier
    ? TIER_THRESHOLDS[nextTier] - company!.pointsBalance
    : 0

  // Rolling 12-month points for tier calculation
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
  const rolling = await prisma.pointsLedger.aggregate({
    where: { companyId: req.user!.companyId, type: 'EARNED', createdAt: { gte: twelveMonthsAgo } },
    _sum: { points: true },
  })

  return ok(res, {
    balance:           company!.pointsBalance,
    tier:              company!.tier,
    nextTier:          nextTier ?? null,
    pointsToNextTier:  Math.max(0, pointsToNextTier),
    rollingPoints:     rolling._sum.points ?? 0,
    tierThresholds:    TIER_THRESHOLDS,
  })
})

// ── GET /points/ledger — paginated transaction history ────────────────────────
router.get('/ledger', async (req: Request, res: Response) => {
  const page   = Math.max(1, Number(req.query.page)  || 1)
  const limit  = Math.min(50, Number(req.query.limit) || 20)
  const skip   = (page - 1) * limit

  const where = { companyId: req.user!.companyId }

  const [entries, total] = await Promise.all([
    prisma.pointsLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        move:       { select: { moveRef: true, origin: true, destination: true } },
        redemption: { select: { voucherCode: true, reward: { select: { name: true } } } },
      },
    }),
    prisma.pointsLedger.count({ where }),
  ])

  return paginated(res, entries, total, page, limit)
})

// ── GET /points/expiring — points expiring in next 90 days ───────────────────
router.get('/expiring', async (req: Request, res: Response) => {
  const now    = new Date()
  const in90   = new Date()
  in90.setDate(in90.getDate() + 90)

  // Points earned more than (expiryMonths - 90days) ago are expiring
  // Default expiry: BRONZE=12mo, SILVER=15mo, GOLD=18mo, PLATINUM=24mo
  const company = await prisma.company.findUnique({
    where: { id: req.user!.companyId },
    select: { tier: true },
  })
  const expiryMonths: Record<Tier, number> = {
    BRONZE: 12, SILVER: 15, GOLD: 18, PLATINUM: 24,
  }
  const months = expiryMonths[company!.tier]

  const expiryThreshold = new Date()
  expiryThreshold.setMonth(expiryThreshold.getMonth() - months + 3) // "expiring within 90 days"

  const expiring = await prisma.pointsLedger.findMany({
    where: {
      companyId: req.user!.companyId,
      type:      'EARNED',
      createdAt: { lte: expiryThreshold },
    },
    select: { points: true, createdAt: true, move: { select: { moveRef: true } } },
  })

  return ok(res, { expiring, totalExpiring: expiring.reduce((s, e) => s + e.points, 0) })
})

export default router
