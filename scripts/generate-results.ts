/**
 * Script untuk generate hasil ujian random (simulasi peserta mengerjakan ujian)
 * Jalankan: npx tsx scripts/generate-results.ts [examId] [jumlahPeserta]
 * 
 * Contoh:
 *   npx tsx scripts/generate-results.ts abc-123 20
 *   npx tsx scripts/generate-results.ts  (interactive mode)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateResults() {
  const args = process.argv.slice(2);
  let examId = args[0];
  let jumlahPeserta = parseInt(args[1]) || 10;

  console.log('🚀 Generate Exam Results Script\n');

  try {
    // Jika tidak ada examId, tampilkan daftar ujian
    if (!examId) {
      const exams = await prisma.exam.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          subject: true,
          totalQuestions: true,
          _count: { select: { examResults: true } }
        }
      });

      if (exams.length === 0) {
        console.log('❌ Tidak ada ujian. Buat ujian dulu dengan: npx tsx scripts/create-exam.ts');
        return;
      }

      console.log('📋 Daftar Ujian Tersedia:\n');
      exams.forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.title}`);
        console.log(`      ID: ${e.id}`);
        console.log(`      Soal: ${e.totalQuestions} | Peserta: ${e._count.examResults}\n`);
      });

      console.log('💡 Gunakan: npx tsx scripts/generate-results.ts <EXAM_ID> <JUMLAH>');
      return;
    }

    // Ambil data ujian
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { 
        questions: true,
        _count: { select: { examResults: true } }
      }
    });

    if (!exam) {
      console.log(`❌ Ujian dengan ID "${examId}" tidak ditemukan`);
      return;
    }

    console.log(`📊 Ujian: ${exam.title}`);
    console.log(`   Soal: ${exam.questions.length}`);
    console.log(`   Peserta existing: ${exam._count.examResults}`);
    console.log(`   Peserta baru: ${jumlahPeserta}\n`);

    // Ambil peserta yang belum mengerjakan ujian ini
    const existingParticipants = await prisma.examResult.findMany({
      where: { examId },
      select: { userId: true }
    });
    const existingUserIds = existingParticipants.map(e => e.userId);

    const availablePeserta = await prisma.user.findMany({
      where: {
        role: 'PESERTA',
        id: { notIn: existingUserIds }
      },
      take: jumlahPeserta,
      select: { id: true, name: true }
    });

    if (availablePeserta.length === 0) {
      console.log('❌ Tidak ada peserta yang tersedia. Buat peserta dulu dengan:');
      console.log('   npx tsx scripts/seed-peserta.ts 50');
      return;
    }

    if (availablePeserta.length < jumlahPeserta) {
      console.log(`⚠️  Hanya ${availablePeserta.length} peserta tersedia\n`);
      jumlahPeserta = availablePeserta.length;
    }

    console.log(`⏳ Generating ${jumlahPeserta} hasil ujian...\n`);

    let totalCreated = 0;
    const scoreDistribution: number[] = [];

    for (const peserta of availablePeserta) {
      // Random accuracy 40-100%
      const accuracy = 0.4 + Math.random() * 0.6;
      
      // Hitung waktu pengerjaan random (30-100% dari durasi)
      const durationUsed = Math.floor(exam.duration * (0.3 + Math.random() * 0.7));
      const startTime = new Date(Date.now() - durationUsed * 60 * 1000);
      const endTime = new Date();

      // Buat exam result
      const examResult = await prisma.examResult.create({
        data: {
          userId: peserta.id,
          examId: exam.id,
          score: 0,
          totalQuestions: exam.questions.length,
          correctAnswers: 0,
          startTime,
          endTime,
          isCompleted: true,
          questionOrder: JSON.stringify(exam.questions.map(q => q.id)),
        }
      });

      // Generate answers
      let correctCount = 0;
      const answerData = [];

      for (const question of exam.questions) {
        const isCorrect = Math.random() < accuracy;
        let selectedAnswer: string;

        if (isCorrect) {
          selectedAnswer = question.correctAnswer;
          correctCount++;
        } else {
          const wrongOptions = ['A', 'B', 'C', 'D'].filter(o => o !== question.correctAnswer);
          selectedAnswer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }

        answerData.push({
          examResultId: examResult.id,
          questionId: question.id,
          selectedAnswer,
          isCorrect,
        });
      }

      await prisma.answer.createMany({ data: answerData });

      // Update score
      const score = Math.round((correctCount / exam.questions.length) * 100);
      await prisma.examResult.update({
        where: { id: examResult.id },
        data: { score, correctAnswers: correctCount }
      });

      scoreDistribution.push(score);
      totalCreated++;

      // Progress indicator
      if (totalCreated % 5 === 0 || totalCreated === jumlahPeserta) {
        process.stdout.write(`\r   Progress: ${totalCreated}/${jumlahPeserta}`);
      }
    }

    console.log('\n');

    // Statistics
    const avgScore = scoreDistribution.reduce((a, b) => a + b, 0) / scoreDistribution.length;
    const minScore = Math.min(...scoreDistribution);
    const maxScore = Math.max(...scoreDistribution);
    const passCount = scoreDistribution.filter(s => s >= exam.passingScore).length;

    console.log('✅ Hasil ujian berhasil di-generate!\n');
    console.log('📊 Statistik:');
    console.log(`   Total peserta: ${totalCreated}`);
    console.log(`   Rata-rata skor: ${avgScore.toFixed(1)}%`);
    console.log(`   Skor terendah: ${minScore}%`);
    console.log(`   Skor tertinggi: ${maxScore}%`);
    console.log(`   Lulus (≥${exam.passingScore}%): ${passCount} (${((passCount/totalCreated)*100).toFixed(1)}%)`);
    console.log(`   Tidak lulus: ${totalCreated - passCount} (${(((totalCreated-passCount)/totalCreated)*100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateResults();
