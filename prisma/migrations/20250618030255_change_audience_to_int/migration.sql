/*
  Warnings:

  - You are about to alter the column `audience_male` on the `kols` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `audience_female` on the `kols` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "kols" ALTER COLUMN "audience_male" SET DATA TYPE INTEGER,
ALTER COLUMN "audience_female" SET DATA TYPE INTEGER;
