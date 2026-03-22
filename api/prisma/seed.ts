// prisma/seed.ts
import { PrismaClient, Tier, MoveStatus, RewardCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Group Code
  const groupCode = await prisma.groupCode.upsert({
    where: { code: 'VGM-GLOBAL-01' },
    update: {},
    create: { code: 'VGM-GLOBAL-01', name: 'Global Moving Alliance' },
  })

  // Companies
  const acme = await prisma.company.upsert({
    where: { email: 'info@acmemoving.com' },
    update: {},
    create: {
      name: 'Acme Moving Netherlands',
      contactPerson: 'John Doe',
      email: 'info@acmemoving.com',
      phone: '+31 20 123 4567',
      country: 'Netherlands',
      city: 'Amsterdam',
      billingEntity: 'Acme Moving BV',
      networkAffiliation: 'Global Moving Alliance',
      groupCodeId: groupCode.id,
      tier: Tier.GOLD,
      pointsBalance: 24580,
    },
  })

  // Admin user
  const adminHash = await bcrypt.hash('Admin@123', 12)
  await prisma.user.upsert({
    where: { email: 'john@acmemoving.com' },
    update: {},
    create: {
      companyId: acme.id,
      name: 'John Doe',
      email: 'john@acmemoving.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

  // Viewer user
  const viewerHash = await bcrypt.hash('Viewer@123', 12)
  await prisma.user.upsert({
    where: { email: 'jane@acmemoving.com' },
    update: {},
    create: {
      companyId: acme.id,
      name: 'Jane Smith',
      email: 'jane@acmemoving.com',
      passwordHash: viewerHash,
      role: 'VIEWER',
    },
  })

  // Rewards catalog
  const rewards = [
    { name: '€500 Service Credit',       description: 'Apply €500 credit towards any future international move service', pointsRequired: 5000,  category: RewardCategory.SERVICE_CREDIT,   tierRequired: Tier.BRONZE, sortOrder: 1 },
    { name: '€1,000 Service Credit',     description: 'Apply €1,000 credit towards any future international move service', pointsRequired: 9500, category: RewardCategory.SERVICE_CREDIT,   tierRequired: Tier.SILVER, sortOrder: 2 },
    { name: '€2,500 Service Credit',     description: 'Apply €2,500 credit towards any future international move service', pointsRequired: 22000, category: RewardCategory.SERVICE_CREDIT,  tierRequired: Tier.GOLD,   sortOrder: 3 },
    { name: '5 Days Free Storage',       description: 'Complimentary 5-day storage at any Voerman facility worldwide',    pointsRequired: 2000,  category: RewardCategory.PREMIUM_SERVICE,  tierRequired: Tier.BRONZE, sortOrder: 4 },
    { name: 'Free Origin Services',      description: 'Complimentary packing and loading services up to €5,000 value',    pointsRequired: 10000, category: RewardCategory.PREMIUM_SERVICE,  tierRequired: Tier.GOLD,   sortOrder: 5 },
    { name: 'Priority Move Service',     description: 'Guaranteed 48-hour pickup and priority loading on next available vessel', pointsRequired: 8000, category: RewardCategory.PREMIUM_SERVICE, tierRequired: Tier.SILVER, sortOrder: 6 },
    { name: 'Premium Insurance Upgrade', description: 'Upgrade to full-value insurance coverage at no additional cost',    pointsRequired: 3500,  category: RewardCategory.INSURANCE,        tierRequired: Tier.SILVER, sortOrder: 7 },
    { name: 'Platinum Concierge Package',description: 'Full-service concierge including visa assistance, housing search, and settling-in services', pointsRequired: 25000, category: RewardCategory.PREMIUM_PACKAGE, tierRequired: Tier.PLATINUM, sortOrder: 8 },
  ]

  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.name }, // use name as stable key for upsert
      update: r,
      create: r,
    })
  }

  // Sample moves
  const admin = await prisma.user.findUnique({ where: { email: 'john@acmemoving.com' } })
  const moveData = [
    { moveRef: 'VM-NL-2026-8472', vendorCode: 'VGM-AMS-001', origin: 'Amsterdam, Netherlands', destination: 'Singapore', totalRevenue: 12500, excludedAmount: 700, status: MoveStatus.CREDITED, pointsAwarded: 1180, invoiceNumber: 'INV-2026-8472' },
    { moveRef: 'VM-NL-2026-8391', vendorCode: 'VGM-AMS-001', origin: 'Rotterdam, Netherlands', destination: 'Dubai, UAE', totalRevenue: 9800, excludedAmount: 400, status: MoveStatus.CREDITED, pointsAwarded: 940, invoiceNumber: 'INV-2026-8391' },
    { moveRef: 'VM-NL-2026-8104', vendorCode: 'VGM-AMS-001', origin: 'Amsterdam, Netherlands', destination: 'New York, USA', totalRevenue: 15200, excludedAmount: 1200, status: MoveStatus.INVOICE_PAID, pointsAwarded: 0, invoiceNumber: 'INV-2026-8104' },
    { moveRef: 'VM-NL-2026-7988', vendorCode: 'VGM-AMS-001', origin: 'The Hague, Netherlands', destination: 'London, UK', totalRevenue: 6500, excludedAmount: 0, status: MoveStatus.PENDING, pointsAwarded: 0, invoiceNumber: 'INV-2026-7988' },
  ]

  for (const m of moveData) {
    const eligible = m.totalRevenue - m.excludedAmount
    await prisma.move.upsert({
      where: { moveRef: m.moveRef },
      update: {},
      create: {
        companyId: acme.id,
        moveRef: m.moveRef,
        vendorCode: m.vendorCode,
        origin: m.origin,
        destination: m.destination,
        volumeM3: 42,
        weightKg: 3850,
        containerType: '20ft Standard',
        serviceType: 'Full International Move',
        totalRevenue: m.totalRevenue,
        excludedAmount: m.excludedAmount,
        eligibleRevenue: eligible,
        invoiceNumber: m.invoiceNumber,
        invoiceDate: new Date('2026-02-21'),
        invoicePaidAt: m.status !== MoveStatus.PENDING ? new Date('2026-02-24') : null,
        status: m.status,
        pointsAwarded: m.pointsAwarded,
        createdByUserId: admin?.id,
      },
    })
  }

  console.log('✅ Seed complete')
  console.log('   Login: john@acmemoving.com / Admin@123')
  console.log('   Login: jane@acmemoving.com / Viewer@123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
