CREATE TABLE IF NOT EXISTS "TillSessionLog" (
  "id" BIGSERIAL NOT NULL,
  "tillSessionId" BIGINT NOT NULL,
  "terminalId" BIGINT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL DEFAULT '',
  "action" TEXT NOT NULL,
  "actionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT "TillSessionLog_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TillSessionLog_tillSessionId_fkey'
  ) THEN
    ALTER TABLE "TillSessionLog"
      ADD CONSTRAINT "TillSessionLog_tillSessionId_fkey"
      FOREIGN KEY ("tillSessionId") REFERENCES "TillSession"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "TillSessionLog_tillSessionId_actionAt_idx"
  ON "TillSessionLog"("tillSessionId", "actionAt");

CREATE INDEX IF NOT EXISTS "TillSessionLog_terminalId_actionAt_idx"
  ON "TillSessionLog"("terminalId", "actionAt");

CREATE INDEX IF NOT EXISTS "TillSessionLog_userId_actionAt_idx"
  ON "TillSessionLog"("userId", "actionAt");
