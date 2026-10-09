ALTER TABLE "ScheduledMessage"
ADD COLUMN "clientId" TEXT,
ADD COLUMN "idempotencyKey" TEXT;

CREATE UNIQUE INDEX "ScheduledMessage_idempotencyKey_key"
ON "ScheduledMessage"("idempotencyKey");

CREATE INDEX "ScheduledMessage_clientId_status_scheduledAt_idx"
ON "ScheduledMessage"("clientId", "status", "scheduledAt");

ALTER TABLE "ScheduledMessage"
ADD CONSTRAINT "ScheduledMessage_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
