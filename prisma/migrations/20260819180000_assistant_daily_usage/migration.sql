-- CreateTable
CREATE TABLE "AssistantDailyUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantDailyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssistantDailyUsage_userId_day_idx" ON "AssistantDailyUsage"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantDailyUsage_userId_day_key" ON "AssistantDailyUsage"("userId", "day");

-- AddForeignKey
ALTER TABLE "AssistantDailyUsage" ADD CONSTRAINT "AssistantDailyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
