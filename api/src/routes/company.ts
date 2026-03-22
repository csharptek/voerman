import { Router, Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { ok, notFound, badRequest, forbidden } from '../lib/response'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// ── GET /company — current company profile ───────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { id: req.user!.companyId },
    include: { groupCode: true },
  })
  if (!company) throw notFound('Company')
  return ok(res, company)
})

// ── PATCH /company — update company info (admin only) ────────────────────────
const UpdateCompanySchema = z.object({
  name:               z.string().min(2).optional(),
  contactPerson:      z.string().min(2).optional(),
  phone:              z.string().optional(),
  city:               z.string().optional(),
  country:            z.string().optional(),
  billingEntity:      z.string().optional(),
  networkAffiliation: z.string().optional(),
})

router.patch('/', requireAdmin, async (req: Request, res: Response) => {
  const data = UpdateCompanySchema.safeParse(req.body)
  if (!data.success) throw badRequest('Validation failed', data.error.errors)

  const company = await prisma.company.update({
    where: { id: req.user!.companyId },
    data:  data.data,
  })
  return ok(res, company)
})

// ── GET /company/users — list team members ───────────────────────────────────
router.get('/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where:  { companyId: req.user!.companyId, isActive: true },
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return ok(res, users)
})

// ── POST /company/users — invite a user (admin only) ─────────────────────────
const InviteUserSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  role:     z.enum(['ADMIN', 'VIEWER']),
  password: z.string().min(8),
})

router.post('/users', requireAdmin, async (req: Request, res: Response) => {
  const data = InviteUserSchema.safeParse(req.body)
  if (!data.success) throw badRequest('Validation failed', data.error.errors)

  const passwordHash = await bcrypt.hash(data.data.password, 12)
  const user = await prisma.user.create({
    data: {
      companyId:    req.user!.companyId,
      name:         data.data.name,
      email:        data.data.email,
      passwordHash,
      role:         data.data.role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  await prisma.notificationPrefs.create({ data: { userId: user.id } })

  return ok(res, user, 201)
})

// ── PATCH /company/users/:id — change role ───────────────────────────────────
router.patch('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  const { role } = req.body
  if (!['ADMIN', 'VIEWER'].includes(role)) throw badRequest('Invalid role')

  // Can't change own role
  if (req.params.id === req.user!.userId) throw forbidden("You can't change your own role")

  const target = await prisma.user.findFirst({
    where: { id: req.params.id, companyId: req.user!.companyId },
  })
  if (!target) throw notFound('User')

  const updated = await prisma.user.update({
    where:  { id: req.params.id },
    data:   { role },
    select: { id: true, name: true, email: true, role: true },
  })
  return ok(res, updated)
})

// ── DELETE /company/users/:id — deactivate user ───────────────────────────────
router.delete('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  if (req.params.id === req.user!.userId) throw forbidden("You can't deactivate yourself")

  const target = await prisma.user.findFirst({
    where: { id: req.params.id, companyId: req.user!.companyId },
  })
  if (!target) throw notFound('User')

  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } })
  return ok(res, { message: 'User deactivated' })
})

export default router
