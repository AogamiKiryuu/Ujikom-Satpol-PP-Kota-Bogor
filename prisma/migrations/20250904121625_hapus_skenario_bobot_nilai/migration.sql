/*
  Warnings:

  - You are about to drop the column `totalEarnedPoints` on the `ExamResult` table. All the data in the column will be lost.
  - You are about to drop the column `totalPossiblePoints` on the `ExamResult` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ExamResult" DROP COLUMN "totalEarnedPoints",
DROP COLUMN "totalPossiblePoints";

-- AlterTable
ALTER TABLE "public"."Question" DROP COLUMN "points";
