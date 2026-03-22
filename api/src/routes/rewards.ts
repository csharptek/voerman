import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { ok, created, notFound, badRequest, forbidden, paginated } from '../lib/response'
import { authenticate } from '../middleware/auth'
import { isTierSufficient, generateVoucherCode, redemptionExpiryDate } from '../lib/points'
import { Tier } from '@prisma/client'

const router = Router()
router.use(authenticate)

// ── GET /rewards — catalog ────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where:  { id: req.user!.companyId },
    select: { tier: true, pointsBalance: true },
  })

  const rewards = await prisma.reward.findMany({
    where:   { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  // Annotate each reward with canAfford and isUnlocked
  const annotated = rewards.map(r => ({
    ...r,
    isUnlocked: isTierSufficient(company!.tier, r.tierRequired),
    canAfford:  company!.pointsBalance >= r.pointsRequired &&
                isTierSufficient(company!.tier, r.tierRequired),
    pointsShortfall: Math.max(0, r.pointsRequired - company!.pointsBalance),
  }))

  return ok(res, annotated)
})

// ── POST /redemptions — redeem a reward ───────────────────────────────────────
const RedeemSchema = z.object({
  rewardId: z.string().uuid(),
})

router.post('/', async (req: Request, res: Response) => {
  const data = RedeemSchema.safeParse(req.body)
  if (!data.success) throw badRequest('rewardId is required')

  const reward = await prisma.reward.findUnique({ where: { id: data.data.rewardId } })
  if (!reward || !reward.isActive) throw notFound('Reward')

  const company = await prisma.company.findUnique({ where: { id: req.user!.companyId } })
  if (!company) throw notFound('Company')

  // Check tier
  if (!isTierSufficient(company.tier, reward.tierRequired)) {
    throw forbidden(`This reward requires ${reward.tierRequired} tier or higher`)
  }

  // Check balance
  if (company.pointsBalance < reward.pointsRequired) {
    throw badRequest(
      `Insufficient points. Need ${reward.pointsRequired}, have ${company.pointsBalance}`
    )
  }

  // Generate unique voucher code
  let voucherCode = generateVoucherCode()
  let attempts = 0
  while (await prisma.redemption.findUnique({ where: { voucherCode } }) && attempts < 5) {
    voucherCode = generateVoucherCode()
    attempts++
  }

  const redemption = await prisma.$transaction(async (tx) => {
    const newBalance = company.pointsBalance - reward.pointsRequired

    // Debit points
    await tx.company.update({
      where: { id: company.id },
      data:  { pointsBalance: newBalance },
    })

    const r = await tx.redemption.create({
      data: {
        companyId:        company.id,
        rewardId:         reward.id,
        redeemedByUserId: req.user!.userId,
        pointsSpent:      reward.pointsRequired,
        voucherCode,
        status:           'CONFIRMED',
        expiresAt:        redemptionExpiryDate(),
      },
      include: { reward: true },
    })

    await tx.pointsLedger.create({
      data: {
        companyId:    company.id,
        redemptionId: r.id,
        type:         'REDEEMED',
        points:       -reward.pointsRequired,
        balanceAfter: newBalance,
        description:  `Redeemed: ${reward.name}`,
      },
    })

    return r
  })

  return created(res, {
    redemption,
    voucherCode,
    message: 'Redemption successful! Check your email for voucher details.',
  })
})

// ── GET /redemptions — history ────────────────────────────────────────────────
router.get('/history', async (req: Request, res: Response) => {
  const page  = Math.max(1, Number(req.query.page)  || 1)
  const limit = Math.min(50, Number(req.query.limit) || 20)
  const skip  = (page - 1) * limit

  const where = { companyId: req.user!.companyId }
  const [items, total] = await Promise.all([
    prisma.redemption.findMany({
      where,
      orderBy: { redeemedAt: 'desc' },
      skip,
      take:  limit,
      include: { reward: { select: { name: true, category: true } } },
    }),
    prisma.redemption.count({ where }),
  ])

  return paginated(res, items, total, page, limit)
})

// ── GET /redemptions/:id — voucher detail ─────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const redemption = await prisma.redemption.findFirst({
    where: { id: req.params.id, companyId: req.user!.companyId },
    include: { reward: true, redeemedBy: { select: { name: true, email: true } } },
  })
  if (!redemption) throw notFound('Redemption')
  return ok(res, redemption)
})

export default router
