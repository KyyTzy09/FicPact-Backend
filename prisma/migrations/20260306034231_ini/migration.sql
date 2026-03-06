/*
  Warnings:

  - You are about to drop the column `type` on the `Reflection` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestLevel" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "QuestReflectionType" AS ENUM ('SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "QuestFolder" ALTER COLUMN "endedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastReflection" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "password" DROP NOT NULL;

-- DropEnum
DROP TYPE "ReflectionType";

-- CreateTable
CREATE TABLE "QuestReflection" (
    "id" TEXT NOT NULL,
    "questLevel" "QuestLevel" NOT NULL DEFAULT 'LOW',
    "reason" TEXT NOT NULL,
    "type" "QuestReflectionType" NOT NULL,
    "questId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestReflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReflectionTrigger" (
    "id" TEXT NOT NULL,
    "isReflection" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReflectionTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestReflection_questId_reason_key" ON "QuestReflection"("questId", "reason");

-- AddForeignKey
ALTER TABLE "QuestReflection" ADD CONSTRAINT "QuestReflection_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReflectionTrigger" ADD CONSTRAINT "ReflectionTrigger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
