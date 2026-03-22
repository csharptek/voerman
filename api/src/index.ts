import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { errorHandler, notFoundHandler } from './middleware/errorHandler'

// Routes
import authRoutes          from './routes/auth'
import companyRoutes       from './routes/company'
import movesRoutes         from './routes/moves'
import pointsRoutes        from './routes/points'
import rewardsRoutes       from './routes/rewards'
import groupRoutes         from './routes/group'
import tierRoutes          from './routes/tier'
import notificationsRoutes from './routes/notifications'
import reportsRoutes       from './routes/reports'
import adminRoutes         from './routes/admin'

const app  = express()
const PORT = process.env.PORT ?? 3000

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,              // stricter for auth endpoints
  message:  { success: false, message: 'Too many requests, please try again later' },
})
app.use(limiter)

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, authRoutes)
app.use('/api/company',       companyRoutes)
app.use('/api/moves',         movesRoutes)
app.use('/api/points',        pointsRoutes)
app.use('/api/rewards',       rewardsRoutes)
app.use('/api/redemptions',   rewardsRoutes)   // same router, different mount
app.use('/api/group',         groupRoutes)
app.use('/api/tier',          tierRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/reports',       reportsRoutes)
app.use('/api/admin',         adminRoutes)

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Voerman Green Miles API running on port ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`)
  console.log(`   Health:      http://localhost:${PORT}/health`)
})

export default app
