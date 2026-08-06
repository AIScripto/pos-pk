-- Add professional till numbering/configuration and branch shift templates.

ALTER TABLE "Terminal"
  ADD COLUMN IF NOT EXISTS "code" TEXT,
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'counter',
  ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "Terminal"
SET "code" = "name"
WHERE "code" IS NULL;

UPDATE "Terminal"
SET "name" = 'Till 1', "sortOrder" = 1
WHERE "name" IN ('KHI-CLI-T1', 'TILL-01');

UPDATE "Terminal"
SET "name" = 'Till 2', "sortOrder" = 2
WHERE "name" IN ('KHI-CLI-T2', 'TILL-02');

CREATE UNIQUE INDEX IF NOT EXISTS "Terminal_branchId_code_key"
  ON "Terminal"("branchId", "code");

CREATE TABLE IF NOT EXISTS "ShiftTemplate" (
  "id" BIGSERIAL PRIMARY KEY,
  "branchId" BIGINT NOT NULL,
  "name" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT NOT NULL DEFAULT 'system',
  CONSTRAINT "ShiftTemplate_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ShiftTemplate_branchId_name_key"
  ON "ShiftTemplate"("branchId", "name");

CREATE INDEX IF NOT EXISTS "ShiftTemplate_branchId_isActive_sortOrder_idx"
  ON "ShiftTemplate"("branchId", "isActive", "sortOrder");

ALTER TABLE "TillSession"
  ADD COLUMN IF NOT EXISTS "shiftTemplateId" BIGINT,
  ADD COLUMN IF NOT EXISTS "shiftName" TEXT,
  ADD COLUMN IF NOT EXISTS "businessDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TillSession_shiftTemplateId_fkey'
  ) THEN
    ALTER TABLE "TillSession"
      ADD CONSTRAINT "TillSession_shiftTemplateId_fkey"
      FOREIGN KEY ("shiftTemplateId") REFERENCES "ShiftTemplate"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "TillSession_branchId_businessDate_idx"
  ON "TillSession"("branchId", "businessDate");

CREATE INDEX IF NOT EXISTS "TillSession_shiftTemplateId_idx"
  ON "TillSession"("shiftTemplateId");

INSERT INTO "ShiftTemplate" ("branchId", "name", "startTime", "endTime", "sortOrder", "createdBy")
SELECT b."id", s."name", s."startTime", s."endTime", s."sortOrder", 'migration'
FROM "Branch" b
CROSS JOIN (
  VALUES
    ('Shift 1', '06:00', '14:00', 1),
    ('Shift 2', '14:00', '22:00', 2),
    ('Shift 3', '22:00', '06:00', 3)
) AS s("name", "startTime", "endTime", "sortOrder")
ON CONFLICT ("branchId", "name") DO NOTHING;
