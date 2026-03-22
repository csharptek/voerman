import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Prisma, MoveStatus, Tier } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { ok, created, notFound, badRequest, paginated } from '../lib/response'
import { authenticate, requireAdmin } from '../middleware/auth'
import { calculatePoints } from '../lib/points'

const router = Router()
router.use(authenticate, requireAdmin)

// ── GET /admin/dashboard — system-wide stats ──────────────────────────────────
router.get('/dashboard', async (_req: Request, res: Response) => {
  const [
    totalCompanies,
    totalMoves,
    pendingMoves,
    creditedMoves,
    totalPointsIssued,
    tierBreakdown,
  ] = await Promise.all([
    prisma.company.count({ where: { isActive: true } }),
    prisma.move.count(),
    prisma.move.count({ where: { status: MoveStatus.PENDING } }),
    prisma.move.count({ where: { status: MoveStatus.CREDITED } }),
    prisma.pointsLedger.aggregate({ where: { type: 'EARNED' }, _sum: { points: true } }),
    prisma.company.groupBy({ by: ['tier'], _count: { id: true } }),
  ])

  // Monthly moves for last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }).reverse()

  const monthlyStats = await Promise.all(
    months.map(async ({ year, month }) => {
      const from = new Date(year, month - 1, 1)
      const to   = new Date(year, month, 0, 23, 59, 59)
      const count = await prisma.move.count({ where: { createdAt: { gte: from, lte: to } } })
      return { label: `${year}-${String(month).padStart(2, '0')}`, moves: count }
    })
  )

  return ok(res, {
    totalCompanies,
    totalMoves,
    pendingMoves,
    creditedMoves,
    totalPointsIssued: totalPointsIssued._sum.points ?? 0,
    tierBreakdown:     Object.fromEntries(tierBreakdown.map(t => [t.tier, t._count.id])),
    monthlyStats,
  })
})

// ── GET /admin/partners — all companies ───────────────────────────────────────
router.get('/partners', async (req: Request, res: Response) => {
  const page   = Math.max(1, Number(req.query.page)  || 1)
  const limit  = Math.min(100, Number(req.query.limit) || 20)
  const skip   = (page - 1) * limit
  const search = req.query.search as string | undefined

  const where: Prisma.CompanyWhereInput = {
    isActive: true,
    ...(search ? {
      OR: [
        { name:  { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { city:  { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { registeredAt: 'desc' },
      include: {
        groupCode:   { select: { code: true, name: true } },
        _count:      { select: { moves: true, users: true } },
      },
    }),
    prisma.company.count({ where }),
  ])

  return paginated(res, companies, total, page, limit)
})

// ── GET /admin/partners/:id — single company detail ───────────────────────────
router.get('/partners/:id', async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where:   { id: req.params.id },
    include: {
      groupCode: true,
      users:     { select: { id: true, name: true, email: true, role: true, lastLoginAt: true } },
      _count:    { select: { moves: true, redemptions: true } },
    },
  })
  if (!company) throw notFound('Company')
  return ok(res, company)
})

// ── POST /admin/moves — add booking (admin data entry) ───────────────────────
const AdminMoveSchema = z.object({
  companyId:       z.string().uuid(),
  moveRef:         z.string().min(3),
  vendorCode:      z.string().min(3),
  origin:          z.string().min(2),
  destination:     z.string().min(2),
  volumeM3:        z.number().positive().optional(),
  weightKg:        z.number().positive().optional(),
  containerType:   z.string().optional(),
  serviceType:     z.string().optional(),
  totalRevenue:    z.number().positive(),
  excludedAmount:  z.number().min(0).default(0),
  exclusionReason: z.string().optional(),
  invoiceNumber:   z.string().optional(),
  invoiceDate:     z.string().datetime().optional(),
  invoicePaid:     z.boolean().default(false),
  claimsFiled:     z.boolean().default(false),
  claimsDetail:    z.string().optional(),
})

router.post('/moves', async (req: Request, res: Response) => {
  const data = AdminMoveSchema.safeParse(req.body)
  if (!data.success) throw badRequest('Validation failed', data.error.errors)

  const { totalRevenue, excludedAmount, invoicePaid, claimsFiled, invoiceDate, ...rest } = data.data
  const eligibleRevenue = totalRevenue - excludedAmount

  const status: MoveStatus =
    claimsFiled  ? MoveStatus.CANCELLED :
    !invoicePaid ? MoveStatus.PENDING :
    MoveStatus.CREDITED

  const pointsAwarded = status === MoveStatus.CREDITED
    ? calculatePoints(eligibleRevenue) : 0

  const move = await prisma.$transaction(async (tx) => {
    const m = await tx.move.create({
      data: {
        ...rest,
        totalRevenue,
        excludedAmount,
        eligibleRevenue,
        invoicePaidAt:  invoicePaid ? new Date() : null,
        invoiceDate:    invoiceDate ? new Date(invoiceDate) : null,
        claimsFiled,
        status,
        pointsAwarded,
        createdByUserId: req.user!.userId,
      },
    })

    if (status === MoveStatus.CREDITED && pointsAwarded > 0) {
      const company = await tx.company.findUnique({ where: { id: rest.companyId } })
      const newBalance = (company?.pointsBalance ?? 0) + pointsAwarded

      await tx.company.update({
        where: { id: rest.companyId },
        data:  { pointsBalance: newBalance },
      })

      await tx.pointsLedger.create({
        data: {
          companyId:    rest.companyId,
          moveId:       m.id,
          type:         'EARNED',
          points:       pointsAwarded,
          balanceAfter: newBalance,
          description:  `Points earned for move ${rest.moveRef}`,
        },
      })

      // Recalculate tier
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
      const rolling = await tx.pointsLedger.aggregate({
        where: { companyId: rest.companyId, type: 'EARNED', createdAt: { gte: twelveMonthsAgo } },
        _sum:  { points: true },
      })
      const rollingPts = rolling._sum.points ?? 0
      const tier: Tier =
        rollingPts >= 25000 ? Tier.PLATINUM :
        rollingPts >= 15000 ? Tier.GOLD     :
        rollingPts >= 5000  ? Tier.SILVER   : Tier.BRONZE

      await tx.company.update({ where: { id: rest.companyId }, data: { tier } })
    }

    return m
  })

  return created(res, {
    move,
    pointsAwarded,
    message: pointsAwarded > 0
      ? `Booking created. ${pointsAwarded.toLocaleString()} points credited.`
      : 'Booking created. Points pending invoice payment.',
  })
})

// ── GET /admin/moves — all moves across all companies ─────────────────────────
router.get('/moves', async (req: Request, res: Response) => {
  const page     = Math.max(1, Number(req.query.page)  || 1)
  const limit    = Math.min(100, Number(req.query.limit) || 20)
  const skip     = (page - 1) * limit
  const status   = req.query.status as MoveStatus | undefined
  const companyId = req.query.companyId as string | undefined

  const where = {
    ...(status    ? { status }    : {}),
    ...(companyId ? { companyId } : {}),
  }

  const [moves, total] = await Promise.all([
    prisma.move.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take:    limit,
      include: { company: { select: { name: true, tier: true } } },
    }),
    prisma.move.count({ where }),
  ])

  return paginated(res, moves, total, page, limit)
})

// ── PATCH /admin/moves/:id/approve — confirm points ──────────────────────────
router.patch('/moves/:id/approve', async (req: Request, res: Response) => {
  const move = await prisma.move.findUnique({ where: { id: req.params.id } })
  if (!move) throw notFound('Move')
  if (move.status === MoveStatus.CREDITED)  throw badRequest('Move already credited')
  if (move.status === MoveStatus.CANCELLED) throw badRequest('Move is cancelled')
  if (!move.invoicePaidAt) throw badRequest('Cannot approve — invoice not yet marked as paid')
  if (move.claimsFiled)    throw badRequest('Cannot approve — claims have been filed')

  const pointsAwarded = calculatePoints(move.eligibleRevenue)

  const updated = await prisma.$transaction(async (tx) => {
    const m = await tx.move.update({
      where: { id: move.id },
      data:  { status: MoveStatus.CREDITED, pointsAwarded },
    })

    const company = await tx.company.findUnique({ where: { id: move.companyId } })
    const newBalance = (company?.pointsBalance ?? 0) + pointsAwarded

    await tx.company.update({
      where: { id: move.companyId },
      data:  { pointsBalance: newBalance },
    })

    await tx.pointsLedger.create({
      data: {
        companyId:    move.companyId,
        moveId:       m.id,
        type:         'EARNED',
        points:       pointsAwarded,
        balanceAfter: newBalance,
        description:  `Points approved for move ${move.moveRef}`,
      },
    })

    return m
  })

  return ok(res, {
    move: updated,
    pointsAwarded,
    message: `${pointsAwarded.toLocaleString()} points credited to company`,
  })
})

// ── PATCH /admin/points/adjust — manual point adjustment ─────────────────────
const AdjustSchema = z.object({
  companyId:   z.string().uuid(),
  points:      z.number().int(),  // positive = add, negative = remove
  description: z.string().min(5),
})

router.patch('/points/adjust', async (req: Request, res: Response) => {
  const data = AdjustSchema.safeParse(req.body)
  if (!data.success) throw badRequest('Validation failed', data.error.errors)

  const { companyId, points, description } = data.data

  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw notFound('Company')

  const newBalance = company.pointsBalance + points
  if (newBalance < 0) throw badRequest('Adjustment would result in negative balance')

  await prisma.$transaction(async (tx) => {
    await tx.company.update({ where: { id: companyId }, data: { pointsBalance: newBalance } })
    await tx.pointsLedger.create({
      data: {
        companyId,
        type:         'ADJUSTED',
        points,
        balanceAfter: newBalance,
        description,
      },
    })
  })

  return ok(res, { newBalance, adjustment: points, message: 'Points adjusted successfully' })
})

export default router
