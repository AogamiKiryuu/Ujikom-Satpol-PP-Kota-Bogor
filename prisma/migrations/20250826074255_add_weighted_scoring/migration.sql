-- AlterTable
ALTER TABLE "public"."ExamResult" ADD COLUMN     "totalEarnedPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPossiblePoints" INTEGER NOT NULL DEFAULT 0;
