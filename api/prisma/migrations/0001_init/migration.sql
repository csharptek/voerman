-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER');
CREATE TYPE "Tier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
CREATE TYPE "MoveStatus" AS ENUM ('PENDING', 'INVOICE_PAID', 'POINTS_PENDING', 'CREDITED', 'CANCELLED');
CREATE TYPE "PointsType" AS ENUM ('EARNED', 'REDEEMED', 'ADJUSTED', 'EXPIRED');
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'USED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "RewardCategory" AS ENUM ('SERVICE_CREDIT', 'PREMIUM_SERVICE', 'INSURANCE', 'PREMIUM_PACKAGE');

-- CreateTable: group_codes
CREATE TABLE "group_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "group_codes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "group_codes_code_key" ON "group_codes"("code");

-- CreateTable: companies
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "billingEntity" TEXT,
    "networkAffiliation" TEXT,
    "groupCodeId" TEXT,
    "tier" "Tier" NOT NULL DEFAULT 'BRONZE',
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable: refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateTable: moves
CREATE TABLE "moves" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "moveRef" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "volumeM3" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "containerType" TEXT,
    "serviceType" TEXT,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "excludedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exclusionReason" TEXT,
    "eligibleRevenue" DOUBLE PRECISION NOT NULL,
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "invoicePaidAt" TIMESTAMP(3),
    "claimsFiled" BOOLEAN NOT NULL DEFAULT false,
    "claimsDetail" TEXT,
    "status" "MoveStatus" NOT NULL DEFAULT 'PENDING',
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "moves_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "moves_moveRef_key" ON "moves"("moveRef");
CREATE INDEX "moves_companyId_idx" ON "moves"("companyId");
CREATE INDEX "moves_status_idx" ON "moves"("status");

-- CreateTable: points_ledger
CREATE TABLE "points_ledger" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "moveId" TEXT,
    "redemptionId" TEXT,
    "type" "PointsType" NOT NULL,
    "points" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "points_ledger_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "points_ledger_companyId_idx" ON "points_ledger"("companyId");

-- CreateTable: rewards
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "category" "RewardCategory" NOT NULL,
    "tierRequired" "Tier" NOT NULL DEFAULT 'BRONZE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable: redemptions
CREATE TABLE "redemptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "redeemedByUserId" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "voucherCode" TEXT NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "redemptions_voucherCode_key" ON "redemptions"("voucherCode");
CREATE INDEX "redemptions_companyId_idx" ON "redemptions"("companyId");

-- CreateTable: notification_prefs
CREATE TABLE "notification_prefs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pointsEarned" BOOLEAN NOT NULL DEFAULT true,
    "moveConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "tierProgress" BOOLEAN NOT NULL DEFAULT true,
    "redemptionSuccess" BOOLEAN NOT NULL DEFAULT true,
    "monthlyStatement" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "systemUpdates" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "notification_prefs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notification_prefs_userId_key" ON "notification_prefs"("userId");

-- AddForeignKeys
ALTER TABLE "companies" ADD CONSTRAINT "companies_groupCodeId_fkey" FOREIGN KEY ("groupCodeId") REFERENCES "group_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moves" ADD CONSTRAINT "moves_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "moves" ADD CONSTRAINT "moves_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_check" CHECK (true);
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_redeemedByUserId_fkey" FOREIGN KEY ("redeemedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notification_prefs" ADD CONSTRAINT "notification_prefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
