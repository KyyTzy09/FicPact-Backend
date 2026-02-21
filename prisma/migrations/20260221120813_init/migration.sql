-- CreateEnum
CREATE TYPE "FolderStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReflectionType" AS ENUM ('USER', 'AI');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentExp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expToNextLevel" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "totalExp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "QuestFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "FolderStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "expReward" INTEGER NOT NULL DEFAULT 10,
    "isSuccess" BOOLEAN NOT NULL DEFAULT false,
    "folderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadLineAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "ReflectionType" NOT NULL DEFAULT 'USER',
    "userId" TEXT NOT NULL,
    "startPeriod" TIMESTAMP(3),
    "endPeriod" TIMESTAMP(3),

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestFolder_userId_name_key" ON "QuestFolder"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Quest_folderId_name_key" ON "Quest"("folderId", "name");

-- AddForeignKey
ALTER TABLE "QuestFolder" ADD CONSTRAINT "QuestFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "QuestFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
