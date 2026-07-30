-- AlterEnum
ALTER TYPE "ReferralStatus" ADD VALUE IF NOT EXISTS 'Bloqueado';

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "justificativaBloqueio" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ReferralStatusAudit" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "fromStatus" "ReferralStatus",
    "toStatus" "ReferralStatus" NOT NULL,
    "justificativaBloqueio" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralStatusAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferralStatusAudit_referralId_createdAt_idx" ON "ReferralStatusAudit"("referralId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ReferralStatusAudit" ADD CONSTRAINT "ReferralStatusAudit_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ReferralStatusAudit" ADD CONSTRAINT "ReferralStatusAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
