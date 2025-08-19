-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'ANALYST', 'USER');

-- CreateEnum
CREATE TYPE "public"."BountyStatus" AS ENUM ('OPEN', 'CLOSED', 'REVIEWING');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bounties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reward_amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."BountyStatus" NOT NULL DEFAULT 'OPEN',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bounties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submissions" (
    "id" TEXT NOT NULL,
    "bounty_id" TEXT NOT NULL,
    "analyst_id" TEXT NOT NULL,
    "link_to_work" TEXT NOT NULL,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_bounty_id_analyst_id_key" ON "public"."submissions"("bounty_id", "analyst_id");

-- AddForeignKey
ALTER TABLE "public"."bounties" ADD CONSTRAINT "bounties_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_bounty_id_fkey" FOREIGN KEY ("bounty_id") REFERENCES "public"."bounties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_analyst_id_fkey" FOREIGN KEY ("analyst_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
