CREATE TYPE "ContactReplyStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
CREATE TABLE "ContactReply" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "staffName" TEXT NOT NULL,
  "fromEmail" TEXT NOT NULL,
  "toEmail" TEXT NOT NULL,
  "replyTo" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "ContactReplyStatus" NOT NULL DEFAULT 'PENDING',
  "providerId" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3),
  CONSTRAINT "ContactReply_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContactReply_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ContactMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "ContactReply_messageId_createdAt_id_idx" ON "ContactReply"("messageId", "createdAt", "id");
-- Evita iniciar otro envío si el anterior sigue pendiente de confirmación.
CREATE UNIQUE INDEX "ContactReply_one_pending_per_message" ON "ContactReply"("messageId") WHERE "status" = 'PENDING';
