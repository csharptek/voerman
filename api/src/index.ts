import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { execSync } from 'child_process'

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

// ── Run DB migrations on startup ─────────────────────────────────────────────
function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Please link a PostgreSQL database in Railway.')
    process.exit(1)
  }
  try {
    console.log('🔄 Running database migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('✅ Migrations complete')
  } catch (err) {
    console.error('❌ Migration failed:', err)
    process.exit(1)
  }
}

// Only run migrations in production (Railway). Locally use npm run db:migrate:dev
if (process.env.NODE_ENV === 'production') {
  runMigrations()
}

const app  = express()
const PORT = process.env.PORT ?? 3000

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet())

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true)               // curl, Postman, mobile
    if (origin.endsWith('.vercel.app')) return callback(null, true)  // any Vercel preview
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('CORS: origin not allowed'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
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

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, authRoutes)
app.use('/api/company',       companyRoutes)
app.use('/api/moves',         movesRoutes)
app.use('/api/points',        pointsRoutes)
app.use('/api/rewards',       rewardsRoutes)
app.use('/api/redemptions',   rewardsRoutes)
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
