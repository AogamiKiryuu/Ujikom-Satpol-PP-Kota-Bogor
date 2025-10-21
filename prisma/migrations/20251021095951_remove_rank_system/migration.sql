/*
  Warnings:

  - You are about to drop the column `rankId` on the `ExamResult` table. All the data in the column will be lost.
  - You are about to drop the `ExamRank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ExamRank" DROP CONSTRAINT "ExamRank_examId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExamRank" DROP CONSTRAINT "ExamRank_rankId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExamResult" DROP CONSTRAINT "ExamResult_rankId_fkey";

-- AlterTable
ALTER TABLE "public"."ExamResult" DROP COLUMN "rankId";

-- DropTable
DROP TABLE "public"."ExamRank";

-- DropTable
DROP TABLE "public"."Rank";
