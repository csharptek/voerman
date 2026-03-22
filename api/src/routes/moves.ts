import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { ok, created, notFound, badRequest, paginated } from '../lib/response'
import { authenticate, requireAdmin } from '../middleware/auth'
import { calculatePoints } from '../lib/points'
import { MoveStatus } from '@prisma/client'

const router = Router()
router.use(authenticate)

// ── GET /moves — paginated list ───────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const page   = Math.max(1, Number(req.query.page)  || 1)
  const limit  = Math.min(50, Number(req.query.limit) || 20)
  const skip   = (page - 1) * limit
  const status = req.query.status as MoveStatus | undefined
  const search = req.query.search as string | undefined

  const where = {
    companyId: req.user!.companyId,
    ...(status ? { status } : {}),
    ...(search ? {
      OR: [
        { moveRef: { contains: search, mode: 'insensitive' as const } },
        { origin:  { contains: search, mode: 'insensitive' as const } },
        { destination: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [moves, total] = await Promise.all([
    prisma.move.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true, moveRef: true, origin: true, destination: true,
        totalRevenue: true, eligibleRevenue: true, pointsAwarded: true,
        status: true, invoiceNumber: true, invoicePaidAt: true, createdAt: true,
      },
    }),
    prisma.move.count({ where }),
  ])

  return paginated(res, moves, total, page, limit)
})

// ── GET /moves/:id — full detail ──────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const move = await prisma.move.findFirst({
    where: { id: req.params.id, companyId: req.user!.companyId },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })
  if (!move) throw notFound('Move')

  // Build status timeline
  const timeline = [
    { step: 'Booking Confirmed', done: true,
      date: move.createdAt, description: 'Move booking created and confirmed' },
    { step: 'Invoice Generated', done: !!move.invoiceNumber,
      date: move.invoiceDate, description: `Invoice ${move.invoiceNumber ?? ''} generated` },
    { step: 'Invoice Paid', done: !!move.invoicePaidAt,
      date: move.invoicePaidAt, description: 'Payment received and confirmed' },
    { step: 'Points Confirmed', done: move.status === MoveStatus.CREDITED,
      date: move.status === MoveStatus.CREDITED ? move.updatedAt : null,
      description: `${move.pointsAwarded.toLocaleString()} Green Miles points credited` },
  ]

  return ok(res, { ...move, timeline })
})

// ── POST /moves — admin creates booking ───────────────────────────────────────
const CreateMoveSchema = z.object({
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

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const data = CreateMoveSchema.safeParse(req.body)
  if (!data.success) throw badRequest('Validation failed', data.error.errors)

  const { totalRevenue, excludedAmount, invoicePaid, claimsFiled, ...rest } = data.data
  const eligibleRevenue = totalRevenue - excludedAmount
  const pointsAwarded   = (!invoicePaid || claimsFiled) ? 0 : calculatePoints(eligibleRevenue)

  const status: MoveStatus =
    claimsFiled     ? MoveStatus.CANCELLED :
    !invoicePaid    ? MoveStatus.PENDING :
    pointsAwarded > 0 ? MoveStatus.CREDITED : MoveStatus.INVOICE_PAID

  const move = await prisma.$transaction(async (tx) => {
    const m = await tx.move.create({
      data: {
        ...rest,
        totalRevenue,
        excludedAmount,
        eligibleRevenue,
        invoicePaidAt: invoicePaid ? new Date() : null,
        claimsFiled,
        status,
        pointsAwarded,
        createdByUserId: req.user!.userId,
      },
    })

    // Credit points immediately if status is CREDITED
    if (status === MoveStatus.CREDITED && pointsAwarded > 0) {
      const company = await tx.company.findUnique({ where: { id: rest.companyId } })
      const newBalance = (company?.pointsBalance ?? 0) + pointsAwarded

      await tx.company.update({
        where: { id: rest.companyId },
        data:  { pointsBalance: newBalance },
      })

      await tx.pointsLedger.create({
        data: {
          companyId:   rest.companyId,
          moveId:      m.id,
          type:        'EARNED',
          points:      pointsAwarded,
          balanceAfter: newBalance,
          description: `Points earned for move ${rest.moveRef}`,
        },
      })

      // Recalculate tier
      await recalculateTier(tx, rest.companyId)
    }

    return m
  })

  return created(res, move)
})

// ── PATCH /moves/:id/status — admin updates invoice/claims status ─────────────
const UpdateStatusSchema = z.object({
  invoicePaid:  z.boolean().optional(),
  claimsFiled:  z.boolean().optional(),
  claimsDetail: z.string().optional(),
})

router.patch('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const data = UpdateStatusSchema.safeParse(req.body)
  if (!data.success) throw badRequest('Validation failed', data.error.errors)

  const move = await prisma.move.findUnique({ where: { id: req.params.id } })
  if (!move) throw notFound('Move')
  if (move.status === MoveStatus.CREDITED) throw badRequest('Move already credited')
  if (move.status === MoveStatus.CANCELLED) throw badRequest('Move is cancelled')

  const invoicePaid = data.data.invoicePaid ?? !!move.invoicePaidAt
  const claimsFiled = data.data.claimsFiled ?? move.claimsFiled

  const newStatus: MoveStatus =
    claimsFiled  ? MoveStatus.CANCELLED :
    !invoicePaid ? MoveStatus.PENDING :
    MoveStatus.CREDITED

  const pointsAwarded = newStatus === MoveStatus.CREDITED
    ? calculatePoints(move.eligibleRevenue)
    : 0

  const updated = await prisma.$transaction(async (tx) => {
    const m = await tx.move.update({
      where: { id: req.params.id },
      data:  {
        invoicePaidAt: invoicePaid ? move.invoicePaidAt ?? new Date() : null,
        claimsFiled,
        claimsDetail: data.data.claimsDetail,
        status:        newStatus,
        pointsAwarded,
      },
    })

    if (newStatus === MoveStatus.CREDITED && pointsAwarded > 0) {
      const company = await tx.company.findUnique({ where: { id: move.companyId } })
      const newBalance = (company?.pointsBalance ?? 0) + pointsAwarded
      await tx.company.update({ where: { id: move.companyId }, data: { pointsBalance: newBalance } })
      await tx.pointsLedger.create({
        data: {
          companyId: move.companyId, moveId: m.id, type: 'EARNED',
          points: pointsAwarded, balanceAfter: newBalance,
          description: `Points confirmed for move ${move.moveRef}`,
        },
      })
      await recalculateTier(tx, move.companyId)
    }

    return m
  })

  return ok(res, updated)
})

// ── Helper: recalculate tier ──────────────────────────────────────────────────
async function recalculateTier(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], companyId: string) {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const result = await tx.pointsLedger.aggregate({
    where: { companyId, type: 'EARNED', createdAt: { gte: twelveMonthsAgo } },
    _sum:  { points: true },
  })
  const rollingPoints = result._sum.points ?? 0

  const tier =
    rollingPoints >= 25000 ? 'PLATINUM' :
    rollingPoints >= 15000 ? 'GOLD'     :
    rollingPoints >= 5000  ? 'SILVER'   : 'BRONZE'

  await tx.company.update({ where: { id: companyId }, data: { tier } })
}

export default router
