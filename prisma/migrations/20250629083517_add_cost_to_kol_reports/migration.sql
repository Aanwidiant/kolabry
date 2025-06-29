/*
  Warnings:

  - Added the required column `cost` to the `kol_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kol_reports" ADD COLUMN     "cost" BIGINT NOT NULL;
