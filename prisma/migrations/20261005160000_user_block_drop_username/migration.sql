-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "username";
ALTER TABLE "users" ADD COLUMN "is_blocked" BOOLEAN NOT NULL DEFAULT false;
