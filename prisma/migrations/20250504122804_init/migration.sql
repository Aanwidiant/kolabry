-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'KOL_MANAGER', 'BRAND');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "NicheType" AS ENUM ('FASHION', 'BEAUTY', 'TECH', 'PARENTING', 'LIFESTYLE', 'FOOD', 'HEALTH', 'EDUCATION', 'FINANCIAL');

-- CreateEnum
CREATE TYPE "AgeRangeType" AS ENUM ('AGE_13_17', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_PLUS');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kols" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "niche" "NicheType" NOT NULL,
    "followers" INTEGER NOT NULL,
    "engagement_rate" DOUBLE PRECISION NOT NULL,
    "reach" INTEGER NOT NULL,
    "rate_card" INTEGER NOT NULL,
    "audience_male" DOUBLE PRECISION NOT NULL,
    "audience_female" DOUBLE PRECISION NOT NULL,
    "audience_age_range" "AgeRangeType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kol_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "min_followers" INTEGER NOT NULL,
    "max_followers" INTEGER,

    CONSTRAINT "kol_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "kol_type_id" INTEGER NOT NULL,
    "target_niche" "NicheType" NOT NULL,
    "target_engagement" INTEGER NOT NULL,
    "target_reach" INTEGER NOT NULL,
    "target_gender" "GenderType" NOT NULL,
    "target_gender_min" DOUBLE PRECISION NOT NULL,
    "target_age_range" "AgeRangeType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_kol" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "kol_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_kol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kol_reports" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "kol_id" INTEGER NOT NULL,
    "like_count" INTEGER NOT NULL,
    "comment_count" INTEGER NOT NULL,
    "share_count" INTEGER NOT NULL,
    "save_count" INTEGER NOT NULL,
    "engagement" INTEGER NOT NULL,
    "reach" INTEGER NOT NULL,
    "er" DOUBLE PRECISION NOT NULL,
    "cpe" DOUBLE PRECISION NOT NULL,
    "final_score" DOUBLE PRECISION,
    "ranking" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kol_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_kol_campaign_id_kol_id_key" ON "campaign_kol"("campaign_id", "kol_id");

-- CreateIndex
CREATE UNIQUE INDEX "kol_reports_campaign_id_kol_id_key" ON "kol_reports"("campaign_id", "kol_id");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_kol_type_id_fkey" FOREIGN KEY ("kol_type_id") REFERENCES "kol_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_kol" ADD CONSTRAINT "campaign_kol_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_kol" ADD CONSTRAINT "campaign_kol_kol_id_fkey" FOREIGN KEY ("kol_id") REFERENCES "kols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kol_reports" ADD CONSTRAINT "kol_reports_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kol_reports" ADD CONSTRAINT "kol_reports_kol_id_fkey" FOREIGN KEY ("kol_id") REFERENCES "kols"("id") ON DELETE CASCADE ON UPDATE CASCADE;
