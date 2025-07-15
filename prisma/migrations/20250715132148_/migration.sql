/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `ratingChange` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameId` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_playerWhiteId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "createdAt",
DROP COLUMN "difficulty",
DROP COLUMN "ratingChange",
DROP COLUMN "result",
DROP COLUMN "type",
ADD COLUMN     "currentTurn" TEXT,
ADD COLUMN     "draw" BOOLEAN,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "fen" TEXT,
ADD COLUMN     "gameId" TEXT NOT NULL,
ADD COLUMN     "loserId" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "winnerId" TEXT,
ALTER COLUMN "playerWhiteId" DROP NOT NULL,
ALTER COLUMN "moves" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "Game_gameId_key" ON "Game"("gameId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerWhiteId_fkey" FOREIGN KEY ("playerWhiteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
