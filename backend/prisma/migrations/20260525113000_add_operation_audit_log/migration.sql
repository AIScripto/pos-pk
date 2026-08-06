CREATE TABLE IF NOT EXISTS "OperationAuditLog" (
  "id" BIGSERIAL NOT NULL,
  "orgId" BIGINT NOT NULL,
  "cityId" BIGINT,
  "branchId" BIGINT NOT NULL,
  "businessDayId" BIGINT,
  "shiftSessionId" BIGINT,
  "tillSessionId" BIGINT,
  "action" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "actorName" TEXT NOT NULL DEFAULT '',
  "notes" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OperationAuditLog_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OperationAuditLog_branchId_fkey'
  ) THEN
    ALTER TABLE "OperationAuditLog"
      ADD CONSTRAINT "OperationAuditLog_branchId_fkey"
      FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "OperationAuditLog_branchId_createdAt_idx"
  ON "OperationAuditLog"("branchId", "createdAt");

CREATE INDEX IF NOT EXISTS "OperationAuditLog_businessDayId_createdAt_idx"
  ON "OperationAuditLog"("businessDayId", "createdAt");

CREATE INDEX IF NOT EXISTS "OperationAuditLog_shiftSessionId_createdAt_idx"
  ON "OperationAuditLog"("shiftSessionId", "createdAt");

CREATE INDEX IF NOT EXISTS "OperationAuditLog_tillSessionId_createdAt_idx"
  ON "OperationAuditLog"("tillSessionId", "createdAt");
