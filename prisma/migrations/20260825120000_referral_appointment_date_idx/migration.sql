-- Index for calendar range queries by appointment date
CREATE INDEX IF NOT EXISTS "Referral_appointmentDate_idx" ON "Referral"("appointmentDate");
