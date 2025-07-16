/*
  Warnings:

  - Made the column `difficulty` on table `Game` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "difficulty" SET NOT NULL;
