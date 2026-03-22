import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { ok, created, badRequest, unauthorized, notFound } from '../lib/response'
import { authenticate } from '../middleware/auth'

const router = Router()

// ── Register ─────────────────────────────────────────────────────────────────
const RegisterSchema = z.object({
  // Company
  companyName:         z.string().min(2),
  country:             z.string().min(2),
  city:                z.string().min(2),
  phone:               z.string().optional(),
  billingEntity:       z.string().optional(),
  networkAffiliation:  z.string().optional(),
  // Contact / User
  contactPerson:       z.string().min(2),
  email:               z.string().email(),
  password:            z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})

router.post('/register', async (req: Request, res: Response) => {
  const data = RegisterSchema.safeParse(req.body)
  if (!data.success) throw badRequest('Validation failed', data.error.errors)

  const { companyName, country, city, phone, billingEntity, networkAffiliation,
    contactPerson, email, password } = data.data

  const passwordHash = await bcrypt.hash(password, 12)

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: companyName, contactPerson, email, phone, country, city,
               billingEntity, networkAffiliation },
    })
    const user = await tx.user.create({
      data: { companyId: company.id, name: contactPerson, email, passwordHash, role: 'ADMIN' },
    })
    await tx.notificationPrefs.create({ data: { userId: user.id } })
    return { company, user }
  })

  return created(res, {
    message: 'Registration successful. Your account is pending approval.',
    companyId: result.company.id,
  })
})

// ── Login ─────────────────────────────────────────────────────────────────────
const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

router.post('/login', async (req: Request, res: Response) => {
  const data = LoginSchema.safeParse(req.body)
  if (!data.success) throw badRequest('Email and password are required')

  const { email, password } = data.data

  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  })
  if (!user || !user.isActive) throw unauthorized('Invalid credentials')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw unauthorized('Invalid credentials')

  // Update last login
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  const payload = { userId: user.id, companyId: user.companyId, role: user.role, email: user.email }
  const accessToken  = signAccessToken(payload)
  const refreshToken = signRefreshToken({ userId: user.id })

  // Store refresh token
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } })

  return ok(res, {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: {
        id: user.company.id,
        name: user.company.name,
        tier: user.company.tier,
        pointsBalance: user.company.pointsBalance,
      },
    },
  })
})

// ── Refresh Token ─────────────────────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) throw badRequest('Refresh token required')

  let payload: { userId: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw unauthorized('Invalid or expired refresh token')
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!stored || stored.expiresAt < new Date()) throw unauthorized('Refresh token expired')

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { company: true },
  })
  if (!user || !user.isActive) throw unauthorized()

  // Rotate token
  await prisma.refreshToken.delete({ where: { token: refreshToken } })
  const newRefresh = signRefreshToken({ userId: user.id })
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  await prisma.refreshToken.create({ data: { userId: user.id, token: newRefresh, expiresAt } })

  const accessToken = signAccessToken({
    userId: user.id, companyId: user.companyId, role: user.role, email: user.email,
  })

  return ok(res, { accessToken, refreshToken: newRefresh })
})

// ── Logout ────────────────────────────────────────────────────────────────────
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  }
  return ok(res, { message: 'Logged out successfully' })
})

// ── Me (current user) ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, name: true, email: true, role: true,
      lastLoginAt: true, isActive: true, createdAt: true, updatedAt: true,
      company: { include: { groupCode: true } },
    },
  })
  if (!user) throw notFound('User')
  return ok(res, user)
})

export default router
