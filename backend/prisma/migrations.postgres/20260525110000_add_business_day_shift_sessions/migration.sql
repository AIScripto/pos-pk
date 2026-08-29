ALTER TABLE "TillSession"
  ADD COLUMN IF NOT EXISTS "businessDayId" BIGINT,
  ADD COLUMN IF NOT EXISTS "shiftSessionId" BIGINT,
  ADD COLUMN IF NOT EXISTS "closedByName" TEXT,
  ADD COLUMN IF NOT EXISTS "closeSubmittedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "closeSubmittedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedByName" TEXT;

CREATE TABLE IF NOT EXISTS "BusinessDay" (
  "id" BIGSERIAL NOT NULL,
  "orgId" BIGINT NOT NULL,
  "cityId" BIGINT NOT NULL,
  "branchId" BIGINT NOT NULL,
  "businessDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "openedBy" TEXT NOT NULL,
  "openedByName" TEXT NOT NULL DEFAULT '',
  "closedAt" TIMESTAMP(3),
  "closedBy" TEXT,
  "closedByName" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BusinessDay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ShiftSession" (
  "id" BIGSERIAL NOT NULL,
  "businessDayId" BIGINT NOT NULL,
  "branchId" BIGINT NOT NULL,
  "shiftTemplateId" BIGINT NOT NULL,
  "name" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "openedBy" TEXT NOT NULL,
  "openedByName" TEXT NOT NULL DEFAULT '',
  "closedAt" TIMESTAMP(3),
  "closedBy" TEXT,
  "closedByName" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ShiftSession_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BusinessDay_branchId_fkey'
  ) THEN
    ALTER TABLE "BusinessDay"
      ADD CONSTRAINT "BusinessDay_branchId_fkey"
      FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ShiftSession_businessDayId_fkey'
  ) THEN
    ALTER TABLE "ShiftSession"
      ADD CONSTRAINT "ShiftSession_businessDayId_fkey"
      FOREIGN KEY ("businessDayId") REFERENCES "BusinessDay"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ShiftSession_branchId_fkey'
  ) THEN
    ALTER TABLE "ShiftSession"
      ADD CONSTRAINT "ShiftSession_branchId_fkey"
      FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ShiftSession_shiftTemplateId_fkey'
  ) THEN
    ALTER TABLE "ShiftSession"
      ADD CONSTRAINT "ShiftSession_shiftTemplateId_fkey"
      FOREIGN KEY ("shiftTemplateId") REFERENCES "ShiftTemplate"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TillSession_businessDayId_fkey'
  ) THEN
    ALTER TABLE "TillSession"
      ADD CONSTRAINT "TillSession_businessDayId_fkey"
      FOREIGN KEY ("businessDayId") REFERENCES "BusinessDay"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TillSession_shiftSessionId_fkey'
  ) THEN
    ALTER TABLE "TillSession"
      ADD CONSTRAINT "TillSession_shiftSessionId_fkey"
      FOREIGN KEY ("shiftSessionId") REFERENCES "ShiftSession"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessDay_branchId_businessDate_key"
  ON "BusinessDay"("branchId", "businessDate");

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessDay_one_open_per_branch_idx"
  ON "BusinessDay"("branchId")
  WHERE "status" = 'open';

CREATE UNIQUE INDEX IF NOT EXISTS "ShiftSession_businessDayId_shiftTemplateId_key"
  ON "ShiftSession"("businessDayId", "shiftTemplateId");

CREATE UNIQUE INDEX IF NOT EXISTS "ShiftSession_one_open_per_branch_idx"
  ON "ShiftSession"("branchId")
  WHERE "status" = 'open';

CREATE INDEX IF NOT EXISTS "BusinessDay_branchId_status_idx"
  ON "BusinessDay"("branchId", "status");

CREATE INDEX IF NOT EXISTS "ShiftSession_branchId_status_idx"
  ON "ShiftSession"("branchId", "status");

CREATE INDEX IF NOT EXISTS "TillSession_businessDayId_idx"
  ON "TillSession"("businessDayId");

CREATE INDEX IF NOT EXISTS "TillSession_shiftSessionId_idx"
  ON "TillSession"("shiftSessionId");
