import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { ok, badRequest } from '../lib/response'
import { authenticate } from '../middleware/auth'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import { MoveStatus } from '@prisma/client'

const router = Router()
router.use(authenticate)

// ── Shared types ──────────────────────────────────────────────────────────────
interface MoveRow {
  moveRef: string
  origin: string
  destination: string
  totalRevenue: number
  eligibleRevenue: number
  pointsAwarded: number
  status: string
  invoicePaidAt: Date | null
  createdAt: Date
  excludedAmount?: number
  invoiceNumber?: string | null
}

interface RedemptionRow {
  redeemedAt: Date
  reward: { name: string; category?: string }
  pointsSpent: number
  voucherCode: string
  status: string
  expiresAt: Date
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function getDateRange(year: number, quarter?: number): { from: Date; to: Date } {
  if (quarter) {
    const quarterStart = [0, 3, 6, 9][quarter - 1]
    return {
      from: new Date(year, quarterStart, 1),
      to:   new Date(year, quarterStart + 3, 0, 23, 59, 59),
    }
  }
  return {
    from: new Date(year, 0, 1),
    to:   new Date(year, 11, 31, 23, 59, 59),
  }
}

async function getMovesForRange(companyId: string, from: Date, to: Date): Promise<MoveRow[]> {
  return prisma.move.findMany({
    where: { companyId, createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: 'desc' },
    select: {
      moveRef: true, origin: true, destination: true,
      totalRevenue: true, eligibleRevenue: true, pointsAwarded: true,
      status: true, invoicePaidAt: true, createdAt: true,
      excludedAmount: true, invoiceNumber: true,
    },
  })
}

async function getRedemptionsForRange(companyId: string, from: Date, to: Date): Promise<RedemptionRow[]> {
  return prisma.redemption.findMany({
    where:   { companyId, redeemedAt: { gte: from, lte: to } },
    include: { reward: { select: { name: true, category: true } } },
    orderBy: { redeemedAt: 'desc' },
  })
}

function isoDate(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : ''
}

// ── GET /reports/yearly ───────────────────────────────────────────────────────
router.get('/yearly', async (req: Request, res: Response) => {
  const year   = Number(req.query.year) || new Date().getFullYear()
  const format = (req.query.format as string) || 'json'
  const { from, to } = getDateRange(year)

  const [company, moves, redemptions, ledger] = await Promise.all([
    prisma.company.findUnique({ where: { id: req.user!.companyId } }),
    getMovesForRange(req.user!.companyId, from, to),
    getRedemptionsForRange(req.user!.companyId, from, to),
    prisma.pointsLedger.findMany({
      where: { companyId: req.user!.companyId, createdAt: { gte: from, lte: to } },
    }),
  ])

  const summary = {
    year,
    company:         company?.name,
    totalMoves:      moves.length,
    creditedMoves:   moves.filter(m => m.status === MoveStatus.CREDITED).length,
    totalRevenue:    moves.reduce((s, m) => s + m.totalRevenue, 0),
    eligibleRevenue: moves.reduce((s, m) => s + m.eligibleRevenue, 0),
    pointsEarned:    ledger.filter(l => l.type === 'EARNED').reduce((s, l) => s + l.points, 0),
    pointsRedeemed:  Math.abs(ledger.filter(l => l.type === 'REDEEMED').reduce((s, l) => s + l.points, 0)),
    totalRedemptions: redemptions.length,
    currentBalance:  company?.pointsBalance ?? 0,
    currentTier:     company?.tier,
  }

  if (format === 'excel') return streamExcel(res, `VGM-Yearly-${year}`, moves, redemptions, summary)
  if (format === 'pdf')   return streamPdf(res,   `VGM-Yearly-${year}`, summary, moves)
  return ok(res, { summary, moves, redemptions })
})

// ── GET /reports/quarterly ────────────────────────────────────────────────────
router.get('/quarterly', async (req: Request, res: Response) => {
  const year    = Number(req.query.year)    || new Date().getFullYear()
  const quarter = Number(req.query.quarter) || Math.ceil((new Date().getMonth() + 1) / 3)
  const format  = (req.query.format as string) || 'json'

  if (quarter < 1 || quarter > 4) throw badRequest('Quarter must be 1–4')

  const { from, to } = getDateRange(year, quarter)
  const [company, moves, redemptions] = await Promise.all([
    prisma.company.findUnique({ where: { id: req.user!.companyId } }),
    getMovesForRange(req.user!.companyId, from, to),
    getRedemptionsForRange(req.user!.companyId, from, to),
  ])

  const summary = {
    year, quarter: `Q${quarter}`,
    company:      company?.name,
    totalMoves:   moves.length,
    totalRevenue: moves.reduce((s, m) => s + m.totalRevenue, 0),
    pointsEarned: moves.reduce((s, m) => s + m.pointsAwarded, 0),
    redemptions:  redemptions.length,
  }

  if (format === 'excel') return streamExcel(res, `VGM-Q${quarter}-${year}`, moves, redemptions, summary)
  if (format === 'pdf')   return streamPdf(res,   `VGM-Q${quarter}-${year}`, summary, moves)
  return ok(res, { summary, moves, redemptions })
})

// ── GET /reports/points-statement ────────────────────────────────────────────
router.get('/points-statement', async (req: Request, res: Response) => {
  const year   = Number(req.query.year)  || new Date().getFullYear()
  const month  = Number(req.query.month) || new Date().getMonth() + 1
  const format = (req.query.format as string) || 'json'

  const from = new Date(year, month - 1, 1)
  const to   = new Date(year, month, 0, 23, 59, 59)

  const [company, ledger] = await Promise.all([
    prisma.company.findUnique({ where: { id: req.user!.companyId } }),
    prisma.pointsLedger.findMany({
      where:   { companyId: req.user!.companyId, createdAt: { gte: from, lte: to } },
      include: { move: { select: { moveRef: true, origin: true, destination: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const summary = {
    period:         `${year}-${String(month).padStart(2, '0')}`,
    company:        company?.name,
    openingBalance: ledger[0] ? (ledger[0].balanceAfter - ledger[0].points) : (company?.pointsBalance ?? 0),
    closingBalance: ledger[ledger.length - 1]?.balanceAfter ?? (company?.pointsBalance ?? 0),
    pointsEarned:   ledger.filter(l => l.type === 'EARNED').reduce((s, l) => s + l.points, 0),
    pointsRedeemed: Math.abs(ledger.filter(l => l.type === 'REDEEMED').reduce((s, l) => s + l.points, 0)),
    transactions:   ledger.length,
  }

  if (format === 'json') return ok(res, { summary, ledger })

  const doc = new PDFDocument({ margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="VGM-Points-Statement-${summary.period}.pdf"`)
  doc.pipe(res)
  doc.fontSize(20).text('Voerman Green Miles', { align: 'center' })
  doc.fontSize(14).text('Points Credit Statement', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12)
    .text(`Company: ${summary.company ?? ''}`)
    .text(`Period: ${summary.period}`)
    .text(`Opening Balance: ${summary.openingBalance.toLocaleString()} pts`)
    .text(`Points Earned:   ${summary.pointsEarned.toLocaleString()} pts`)
    .text(`Points Redeemed: ${summary.pointsRedeemed.toLocaleString()} pts`)
    .text(`Closing Balance: ${summary.closingBalance.toLocaleString()} pts`)
  doc.moveDown().text('Transaction Detail:')
  for (const entry of ledger) {
    doc.fontSize(10).text(
      `${isoDate(entry.createdAt)}  ${entry.type.padEnd(10)}  ${entry.points > 0 ? '+' : ''}${entry.points}  Balance: ${entry.balanceAfter}  — ${entry.description}`
    )
  }
  doc.end()
  return
})

// ── GET /reports/redemptions ──────────────────────────────────────────────────
router.get('/redemptions', async (req: Request, res: Response) => {
  const year   = Number(req.query.year) || new Date().getFullYear()
  const format = (req.query.format as string) || 'json'
  const { from, to } = getDateRange(year)

  const redemptions = await getRedemptionsForRange(req.user!.companyId, from, to)
  if (format === 'json') return ok(res, { year, redemptions })

  const workbook = new ExcelJS.Workbook()
  const sheet    = workbook.addWorksheet('Redemptions')
  sheet.columns = [
    { header: 'Date',         key: 'date',    width: 15 },
    { header: 'Reward',       key: 'reward',  width: 30 },
    { header: 'Points Spent', key: 'points',  width: 15 },
    { header: 'Voucher Code', key: 'voucher', width: 20 },
    { header: 'Status',       key: 'status',  width: 15 },
    { header: 'Expires',      key: 'expires', width: 15 },
  ]
  for (const r of redemptions) {
    sheet.addRow({
      date:    isoDate(r.redeemedAt),
      reward:  r.reward.name,
      points:  r.pointsSpent,
      voucher: r.voucherCode,
      status:  r.status,
      expires: isoDate(r.expiresAt),
    })
  }
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="VGM-Redemptions-${year}.xlsx"`)
  await workbook.xlsx.write(res)
  res.end()
  return
})

// ── GET /reports/analytics ────────────────────────────────────────────────────
router.get('/analytics', async (req: Request, res: Response) => {
  const companyId = req.user!.companyId

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }).reverse()

  const monthlyData = await Promise.all(
    months.map(async ({ year, month }) => {
      const from = new Date(year, month - 1, 1)
      const to   = new Date(year, month, 0, 23, 59, 59)
      const [moveCount, pts] = await Promise.all([
        prisma.move.count({ where: { companyId, createdAt: { gte: from, lte: to } } }),
        prisma.pointsLedger.aggregate({
          where: { companyId, type: 'EARNED', createdAt: { gte: from, lte: to } },
          _sum:  { points: true },
        }),
      ])
      return { year, month, moves: moveCount, points: pts._sum.points ?? 0 }
    })
  )

  const topDestinations = await prisma.move.groupBy({
    by:      ['destination'],
    where:   { companyId },
    _count:  { id: true },
    orderBy: { _count: { id: 'desc' } },
    take:    5,
  })

  return ok(res, { monthlyData, topDestinations })
})

// ── Excel stream helper ───────────────────────────────────────────────────────
async function streamExcel(
  res: Response,
  filename: string,
  moves: MoveRow[],
  redemptions: RedemptionRow[],
  summary: object
) {
  const workbook = new ExcelJS.Workbook()

  // Summary sheet
  const sumSheet = workbook.addWorksheet('Summary')
  sumSheet.addRow(['Voerman Green Miles Report'])
  sumSheet.addRow([])
  Object.entries(summary).forEach(([k, v]) => sumSheet.addRow([k, v]))

  // Moves sheet
  const moveSheet = workbook.addWorksheet('Moves')
  moveSheet.columns = [
    { header: 'Move Ref',         key: 'moveRef',      width: 20 },
    { header: 'Origin',           key: 'origin',       width: 25 },
    { header: 'Destination',      key: 'destination',  width: 25 },
    { header: 'Total Revenue',    key: 'totalRevenue', width: 15 },
    { header: 'Eligible Revenue', key: 'eligible',     width: 18 },
    { header: 'Points Awarded',   key: 'points',       width: 15 },
    { header: 'Status',           key: 'status',       width: 15 },
    { header: 'Invoice Paid',     key: 'invoicePaid',  width: 15 },
    { header: 'Date',             key: 'date',         width: 15 },
  ]
  for (const m of moves) {
    moveSheet.addRow({
      moveRef:      m.moveRef,
      origin:       m.origin,
      destination:  m.destination,
      totalRevenue: m.totalRevenue,
      eligible:     m.eligibleRevenue,
      points:       m.pointsAwarded,
      status:       m.status,
      invoicePaid:  m.invoicePaidAt ? 'Yes' : 'No',
      date:         isoDate(m.createdAt),
    })
  }

  // Redemptions sheet
  const redSheet = workbook.addWorksheet('Redemptions')
  redSheet.columns = [
    { header: 'Date',         key: 'date',    width: 15 },
    { header: 'Reward',       key: 'reward',  width: 30 },
    { header: 'Points Spent', key: 'points',  width: 15 },
    { header: 'Voucher',      key: 'voucher', width: 20 },
    { header: 'Status',       key: 'status',  width: 12 },
  ]
  for (const r of redemptions) {
    redSheet.addRow({
      date:    isoDate(r.redeemedAt),
      reward:  r.reward.name,
      points:  r.pointsSpent,
      voucher: r.voucherCode,
      status:  r.status,
    })
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`)
  await workbook.xlsx.write(res)
  res.end()
}

// ── PDF stream helper ─────────────────────────────────────────────────────────
function streamPdf(res: Response, filename: string, summary: object, moves: MoveRow[]): void {
  const doc = new PDFDocument({ margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`)
  doc.pipe(res)

  doc.fontSize(22).font('Helvetica-Bold').text('Voerman Green Miles', { align: 'center' })
  doc.fontSize(14).font('Helvetica').text('Partner Performance Report', { align: 'center' })
  doc.moveDown()
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
  doc.moveDown()

  doc.fontSize(12).font('Helvetica-Bold').text('Summary')
  doc.font('Helvetica')
  Object.entries(summary).forEach(([k, v]) => {
    doc.fontSize(10).text(`${k}: ${String(v)}`)
  })

  doc.moveDown()
  doc.fontSize(12).font('Helvetica-Bold').text('Move Details')
  doc.font('Helvetica').fontSize(9)
  for (const m of moves.slice(0, 50)) {
    doc.text(
      `${m.moveRef}  |  ${m.origin} → ${m.destination}  |  €${m.totalRevenue}  |  ${m.pointsAwarded} pts  |  ${m.status}`
    )
  }
  if (moves.length > 50) doc.text(`... and ${moves.length - 50} more moves`)

  doc.end()
}

export default router
