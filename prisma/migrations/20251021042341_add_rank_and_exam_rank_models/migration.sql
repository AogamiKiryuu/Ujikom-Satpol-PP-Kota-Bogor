-- AlterTable
ALTER TABLE "public"."ExamResult" ADD COLUMN     "rankId" TEXT;

-- CreateTable
CREATE TABLE "public"."Rank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "golongan" INTEGER NOT NULL,
    "subGolongan" TEXT NOT NULL,
    "jabatanUmum" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamRank" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "rankId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamRank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rank_name_key" ON "public"."Rank"("name");

-- CreateIndex
CREATE INDEX "ExamRank_examId_idx" ON "public"."ExamRank"("examId");

-- CreateIndex
CREATE INDEX "ExamRank_rankId_idx" ON "public"."ExamRank"("rankId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamRank_examId_rankId_key" ON "public"."ExamRank"("examId", "rankId");

-- AddForeignKey
ALTER TABLE "public"."ExamResult" ADD CONSTRAINT "ExamResult_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "public"."Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamRank" ADD CONSTRAINT "ExamRank_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamRank" ADD CONSTRAINT "ExamRank_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "public"."Rank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
