CREATE TYPE "ContactCategory" AS ENUM ('CURSOS', 'INSCRIPCIONES', 'EVENTOS', 'SOPORTE', 'OTRO');
ALTER TABLE "ContactMessage" ADD COLUMN "category" "ContactCategory" NOT NULL DEFAULT 'OTRO';
CREATE INDEX "ContactMessage_category_isSpam_isArchived_lastActivityAt_id_idx" ON "ContactMessage"("category", "isSpam", "isArchived", "lastActivityAt", "id");
