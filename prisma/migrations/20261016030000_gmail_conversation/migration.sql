ALTER TABLE "ContactReply" ALTER COLUMN "staffId" DROP NOT NULL;
ALTER TABLE "ContactReply"
  ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'resend',
  ADD COLUMN "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
  ADD COLUMN "providerThreadId" TEXT,
  ADD COLUMN "rfcMessageId" TEXT,
  ADD COLUMN "gmailDraftId" TEXT,
  ADD COLUMN "gmailSendLeaseUntil" TIMESTAMP(3);
ALTER TABLE "ContactReply" ADD CONSTRAINT "ContactReply_direction_check" CHECK ("direction" IN ('INBOUND', 'OUTBOUND'));
CREATE INDEX "ContactReply_provider_providerThreadId_idx" ON "ContactReply"("provider", "providerThreadId");
CREATE UNIQUE INDEX "ContactReply_provider_providerId_key" ON "ContactReply"("provider", "providerId");
CREATE TABLE "ContactMailbox" (
 "id" TEXT NOT NULL DEFAULT 'institution', "email" TEXT NOT NULL,
 "encryptedRefreshToken" TEXT NOT NULL, "connectedBy" TEXT NOT NULL,
 "historyId" TEXT, "nextPageToken" TEXT, "recoveryCursor" TEXT, "recoveryHistoryId" TEXT,
 "leaseUntil" TIMESTAMP(3), "lastSyncedAt" TIMESTAMP(3), "lastError" TEXT,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "ContactMailbox_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ContactMessage" ADD COLUMN "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "ContactMessage" SET "lastActivityAt" = "date";
DROP INDEX "ContactMessage_isSpam_isArchived_date_id_idx";
CREATE INDEX "ContactMessage_isSpam_isArchived_lastActivityAt_id_idx" ON "ContactMessage"("isSpam", "isArchived", "lastActivityAt", "id");
