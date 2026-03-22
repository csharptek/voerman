import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { ok, notFound } from '../lib/response'
import { authenticate } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// ── GET /group — group summary + member companies ─────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where:   { id: req.user!.companyId },
    include: { groupCode: true },
  })
  if (!company?.groupCode) return ok(res, { hasGroup: false })

  const members = await prisma.company.findMany({
    where:   { groupCodeId: company.groupCodeId! },
    select: {
      id: true, name: true, city: true, country: true,
      tier: true, pointsBalance: true,
      moves: {
        select: { id: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: { select: { moves: true } },
    },
  })

  // Aggregate stats
  const totalPoints  = members.reduce((s, m) => s + m.pointsBalance, 0)
  const totalMoves   = members.reduce((s, m) => s + m._count.moves,  0)
  const tierCounts   = members.reduce((acc, m) => {
    acc[m.tier] = (acc[m.tier] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const membersWithLastMove = members.map(m => ({
    ...m,
    lastMoveDate: m.moves[0]?.createdAt ?? null,
    totalMoves:   m._count.moves,
    moves: undefined,
    _count: undefined,
  }))

  return ok(res, {
    hasGroup:   true,
    groupCode:  company.groupCode.code,
    groupName:  company.groupCode.name,
    totalMembers: members.length,
    totalPoints,
    totalMoves,
    tierDistribution: tierCounts,
    members: membersWithLastMove,
  })
})

// ── POST /group/request-add — request to add a company ───────────────────────
router.post('/request-add', async (req: Request, res: Response) => {
  const { companyName, contactEmail, message } = req.body
  // In production: send email to Voerman admin, create a request record
  // For now: return success
  return ok(res, {
    message: 'Request submitted. Voerman admin will review and approve within 2 business days.',
    requestId: `REQ-${Date.now()}`,
  })
})

export default router
