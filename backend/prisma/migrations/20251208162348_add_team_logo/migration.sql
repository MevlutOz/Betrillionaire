/*
  Warnings:

  - You are about to drop the column `logo_url` on the `teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "logo_url",
ADD COLUMN     "logo" TEXT;
