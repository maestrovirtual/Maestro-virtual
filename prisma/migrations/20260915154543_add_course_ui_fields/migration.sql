/*
  Warnings:

  - You are about to drop the column `author` on the `CourseTestimonial` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `CourseTestimonial` table. All the data in the column will be lost.
  - Added the required column `color` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modality` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objective` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participants` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requirements` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetAudience` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `backgroundPattern` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `stage` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `message` to the `CourseTestimonial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CourseTestimonial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `CourseTestimonial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('UNO', 'DOS', 'TRES');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('CURSO', 'TALLER', 'CONFERENCIA');

-- CreateEnum
CREATE TYPE "BackgroundPattern" AS ENUM ('GRID', 'WAVES', 'SHAPES', 'CARDS', 'SLIDES', 'GROWTH', 'CHAT');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "clickable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredOrder" INTEGER,
ADD COLUMN     "hoursPerSession" INTEGER,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "modality" TEXT NOT NULL,
ADD COLUMN     "objective" TEXT NOT NULL,
ADD COLUMN     "participants" TEXT NOT NULL,
ADD COLUMN     "requirements" TEXT NOT NULL,
ADD COLUMN     "sessions" INTEGER,
ADD COLUMN     "shortDescription" TEXT NOT NULL,
ADD COLUMN     "targetAudience" TEXT NOT NULL,
ADD COLUMN     "type" "CourseType" NOT NULL,
ADD COLUMN     "video" TEXT,
DROP COLUMN "backgroundPattern",
ADD COLUMN     "backgroundPattern" "BackgroundPattern" NOT NULL,
DROP COLUMN "stage",
ADD COLUMN     "stage" "Stage" NOT NULL;

-- AlterTable
ALTER TABLE "CourseTestimonial" DROP COLUMN "author",
DROP COLUMN "content",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "participants" TEXT,
ADD COLUMN     "profile" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "time" TEXT;

-- CreateIndex
CREATE INDEX "Course_featured_featuredOrder_idx" ON "Course"("featured", "featuredOrder");
