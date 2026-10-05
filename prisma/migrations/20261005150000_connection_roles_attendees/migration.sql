-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'member', 'participant');

-- AlterTable users: add role, drop is_admin
ALTER TABLE "users" ADD COLUMN "role" "role" NOT NULL DEFAULT 'participant';
UPDATE "users" SET "role" = 'admin' WHERE "is_admin" = true;
ALTER TABLE "users" DROP COLUMN "is_admin";

-- AlterTable connections: allow unlinked telegram logins
ALTER TABLE "connections" DROP CONSTRAINT "connections_user_id_fkey";
ALTER TABLE "connections" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable sessions: link only to connection
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";
DROP INDEX IF EXISTS "sessions_user_id_idx";
ALTER TABLE "sessions" DROP COLUMN "user_id";
CREATE INDEX "sessions_connection_id_idx" ON "sessions"("connection_id");

-- CreateTable meeting_participants
CREATE TABLE "meeting_participants" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "meeting_participants_meeting_id_user_id_key" ON "meeting_participants"("meeting_id", "user_id");
CREATE INDEX "meeting_participants_user_id_idx" ON "meeting_participants"("user_id");

ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy free-text participants
ALTER TABLE "meetings" DROP COLUMN IF EXISTS "participants";
