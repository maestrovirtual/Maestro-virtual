ALTER TABLE "ContactMessage" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "ContactMessage_isArchived_date_id_idx" ON "ContactMessage"("isArchived", "date", "id");
