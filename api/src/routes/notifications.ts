import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { ok } from '../lib/response'
import { authenticate } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// ── GET /notifications/preferences ───────────────────────────────────────────
router.get('/preferences', async (req: Request, res: Response) => {
  let prefs = await prisma.notificationPrefs.findUnique({
    where: { userId: req.user!.userId },
  })

  // Auto-create if missing
  if (!prefs) {
    prefs = await prisma.notificationPrefs.create({
      data: { userId: req.user!.userId },
    })
  }

  return ok(res, prefs)
})

// ── PATCH /notifications/preferences ─────────────────────────────────────────
const PrefsSchema = z.object({
  pointsEarned:      z.boolean().optional(),
  moveConfirmed:     z.boolean().optional(),
  tierProgress:      z.boolean().optional(),
  redemptionSuccess: z.boolean().optional(),
  monthlyStatement:  z.boolean().optional(),
  marketing:         z.boolean().optional(),
  systemUpdates:     z.boolean().optional(),
})

router.patch('/preferences', async (req: Request, res: Response) => {
  const data = PrefsSchema.safeParse(req.body)
  if (!data.success) {
    return ok(res, { message: 'No valid fields provided' })
  }

  const prefs = await prisma.notificationPrefs.upsert({
    where:  { userId: req.user!.userId },
    update: data.data,
    create: { userId: req.user!.userId, ...data.data },
  })

  return ok(res, prefs)
})

export default router
