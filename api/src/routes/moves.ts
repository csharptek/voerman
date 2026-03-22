import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Prisma, MoveStatus, Tier } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { ok, created, notFound, badRequest, paginated } from '../lib/response'
import { authenticate, requireAdmin } from '../middleware/auth'
import { calculatePoints } from '../lib/points'

const router = Router()
router.use(authenticate)

// Prisma interactive transaction client type
type TxClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

// ── GET /moves — paginated list ───────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const page   = Math.max(1, Number(req.query.page)  || 1)
  const limit  = Math.min(50, Number(req.query.limit) || 20)
  const skip   = (page - 1) * limit
  const status = req.query.status as MoveStatus | undefined
  const search = req.query.search as string | undefined

  const where: Prisma.MoveWhereInput = {
    companyId: req.user!.companyId,
    ...(status ? { status } : {}),
    ...(search ? {
      OR: [
        { moveRef:     { contains: search, mode: 'insensitive' } },
        { origin:      { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
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
    where:   { id: req.params.id, companyId: req.user!.companyId },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })
  if (!move) throw notFound('Move')

  const timeline = [
    { step: 'Booking Confirmed', done: true,
      date: move.createdAt,    description: 'Move booking created and confirmed' },
    { step: 'Invoice Generated', done: !!move.invoiceNumber,
      date: move.invoiceDate,  description: `Invoice ${move.invoiceNumber ?? ''} generated` },
    { step: 'Invoice Paid', done: !!move.invoicePaidAt,
      date: move.invoicePaidAt, description: 'Payment received and confirmed' },
    { step: 'Points Confirmed', done: move.status === MoveStatus.CREDITED,
      date: move.status === MoveStatus.CREDITED ? move.updatedAt : null,
      description: `${move.pointsAwarded.toLocaleString()} Green Miles points credited` },
  ]

  return ok(res, { ...move, timeline })
})

// ── POST /moves — admin creates booking ──────────────────────────────────────
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
    claimsFiled       ? MoveStatus.CANCELLED :
    !invoicePaid      ? MoveStatus.PENDING   :
    pointsAwarded > 0 ? MoveStatus.CREDITED  : MoveStatus.INVOICE_PAID

  const move = await prisma.$transaction(async (tx) => {
    const txc = tx as unknown as TxClient
    const m = await txc.move.create({
      data: {
        ...rest,
        totalRevenue,
        excludedAmount,
        eligibleRevenue,
        invoicePaidAt:   invoicePaid ? new Date() : null,
        claimsFiled,
        status,
        pointsAwarded,
        createdByUserId: req.user!.userId,
      },
    })

    if (status === MoveStatus.CREDITED && pointsAwarded > 0) {
      const company = await txc.company.findUnique({ where: { id: rest.companyId } })
      const newBalance = (company?.pointsBalance ?? 0) + pointsAwarded

      await txc.company.update({ where: { id: rest.companyId }, data: { pointsBalance: newBalance } })
      await txc.pointsLedger.create({
        data: {
          companyId:    rest.companyId,
          moveId:       m.id,
          type:         'EARNED',
          points:       pointsAwarded,
          balanceAfter: newBalance,
          description:  `Points earned for move ${rest.moveRef}`,
        },
      })
      await recalculateTier(txc, rest.companyId)
    }

    return m
  })

  return created(res, move)
})

// ── PATCH /moves/:id/status ───────────────────────────────────────────────────
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
  if (move.status === MoveStatus.CREDITED)  throw badRequest('Move already credited')
  if (move.status === MoveStatus.CANCELLED) throw badRequest('Move is cancelled')

  const invoicePaid = data.data.invoicePaid ?? !!move.invoicePaidAt
  const claimsFiled = data.data.claimsFiled ?? move.claimsFiled

  const newStatus: MoveStatus =
    claimsFiled  ? MoveStatus.CANCELLED :
    !invoicePaid ? MoveStatus.PENDING   : MoveStatus.CREDITED

  const pointsAwarded = newStatus === MoveStatus.CREDITED
    ? calculatePoints(move.eligibleRevenue) : 0

  const updated = await prisma.$transaction(async (tx) => {
    const txc = tx as unknown as TxClient
    const m = await txc.move.update({
      where: { id: req.params.id },
      data: {
        invoicePaidAt: invoicePaid ? (move.invoicePaidAt ?? new Date()) : null,
        claimsFiled,
        claimsDetail:  data.data.claimsDetail,
        status:        newStatus,
        pointsAwarded,
      },
    })

    if (newStatus === MoveStatus.CREDITED && pointsAwarded > 0) {
      const company = await txc.company.findUnique({ where: { id: move.companyId } })
      const newBalance = (company?.pointsBalance ?? 0) + pointsAwarded
      await txc.company.update({ where: { id: move.companyId }, data: { pointsBalance: newBalance } })
      await txc.pointsLedger.create({
        data: {
          companyId:    move.companyId,
          moveId:       m.id,
          type:         'EARNED',
          points:       pointsAwarded,
          balanceAfter: newBalance,
          description:  `Points confirmed for move ${move.moveRef}`,
        },
      })
      await recalculateTier(txc, move.companyId)
    }

    return m
  })

  return ok(res, updated)
})

// ── Helper ────────────────────────────────────────────────────────────────────
async function recalculateTier(tx: TxClient, companyId: string) {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const result = await tx.pointsLedger.aggregate({
    where: { companyId, type: 'EARNED', createdAt: { gte: twelveMonthsAgo } },
    _sum:  { points: true },
  })
  const rolling = result._sum.points ?? 0

  const tier: Tier =
    rolling >= 25000 ? Tier.PLATINUM :
    rolling >= 15000 ? Tier.GOLD     :
    rolling >= 5000  ? Tier.SILVER   : Tier.BRONZE

  await tx.company.update({ where: { id: companyId }, data: { tier } })
}

export default router
