ALTER TABLE "ContactMessage" ADD COLUMN "isSpam" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_folder_check" CHECK (NOT ("isSpam" AND "isArchived"));
DROP INDEX "ContactMessage_isArchived_date_id_idx";
CREATE INDEX "ContactMessage_isSpam_isArchived_date_id_idx" ON "ContactMessage"("isSpam", "isArchived", "date", "id");
