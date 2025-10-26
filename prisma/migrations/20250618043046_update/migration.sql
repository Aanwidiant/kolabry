/*
  Warnings:

  - You are about to alter the column `target_gender_min` on the `campaigns` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "campaigns" ALTER COLUMN "target_engagement" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "target_gender_min" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "kol_reports" ALTER COLUMN "like_count" SET DATA TYPE BIGINT,
ALTER COLUMN "comment_count" SET DATA TYPE BIGINT,
ALTER COLUMN "share_count" SET DATA TYPE BIGINT,
ALTER COLUMN "save_count" SET DATA TYPE BIGINT,
ALTER COLUMN "engagement" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "kol_types" ALTER COLUMN "min_followers" SET DATA TYPE BIGINT,
ALTER COLUMN "max_followers" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "kols" ALTER COLUMN "rate_card" SET DATA TYPE BIGINT;
