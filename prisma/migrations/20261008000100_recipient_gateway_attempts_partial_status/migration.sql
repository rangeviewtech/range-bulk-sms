ALTER TYPE "MessageStatus" ADD VALUE IF NOT EXISTS 'PARTIAL';

ALTER TABLE "MessageAttempt"
  ADD COLUMN IF NOT EXISTS "messageRecipientId" TEXT,
  ADD COLUMN IF NOT EXISTS "attemptNumber" INTEGER NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MessageAttempt_messageRecipientId_fkey'
  ) THEN
    ALTER TABLE "MessageAttempt"
      ADD CONSTRAINT "MessageAttempt_messageRecipientId_fkey"
      FOREIGN KEY ("messageRecipientId") REFERENCES "MessageRecipient"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "MessageAttempt_messageRecipientId_attemptNumber_key"
  ON "MessageAttempt"("messageRecipientId", "attemptNumber");
CREATE INDEX IF NOT EXISTS "MessageAttempt_messageRecipientId_idx"
  ON "MessageAttempt"("messageRecipientId");
