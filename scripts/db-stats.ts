/**
 * Script untuk melihat statistik database
 * Jalankan: npx tsx scripts/db-stats.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showStats() {
  console.log('📊 Database Statistics\n');
  console.log('═'.repeat(60));

  try {
    // Count all entities
    const [userCount, examCount, questionCount, examResultCount, answerCount] = await Promise.all([
      prisma.user.count(),
      prisma.exam.count(),
      prisma.question.count(),
      prisma.examResult.count(),
      prisma.answer.count(),
    ]);

    console.log('\n📦 ENTITIES COUNT');
    console.log('─'.repeat(40));
    console.log(`   Users        : ${userCount.toLocaleString()}`);
    console.log(`   Exams        : ${examCount.toLocaleString()}`);
    console.log(`   Questions    : ${questionCount.toLocaleString()}`);
    console.log(`   Exam Results : ${examResultCount.toLocaleString()}`);
    console.log(`   Answers      : ${answerCount.toLocaleString()}`);

    // User breakdown
    const [adminCount, pesertaCount] = await Promise.all([
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'PESERTA' } }),
    ]);

    console.log('\n👥 USERS BREAKDOWN');
    console.log('─'.repeat(40));
    console.log(`   Admin        : ${adminCount}`);
    console.log(`   Peserta      : ${pesertaCount}`);

    // Exam stats
    const [activeExams, inactiveExams] = await Promise.all([
      prisma.exam.count({ where: { isActive: true } }),
      prisma.exam.count({ where: { isActive: false } }),
    ]);

    console.log('\n📝 EXAM STATUS');
    console.log('─'.repeat(40));
    console.log(`   Active       : ${activeExams}`);
    console.log(`   Inactive     : ${inactiveExams}`);

    // Exam results stats
    const [completedResults, inProgressResults] = await Promise.all([
      prisma.examResult.count({ where: { isCompleted: true } }),
      prisma.examResult.count({ where: { isCompleted: false } }),
    ]);

    console.log('\n📈 EXAM RESULTS');
    console.log('─'.repeat(40));
    console.log(`   Completed    : ${completedResults}`);
    console.log(`   In Progress  : ${inProgressResults}`);

    // Score distribution
    if (completedResults > 0) {
      const scoreStats = await prisma.examResult.aggregate({
        where: { isCompleted: true },
        _avg: { score: true },
        _min: { score: true },
        _max: { score: true },
      });

      console.log('\n📊 SCORE STATISTICS');
      console.log('─'.repeat(40));
      console.log(`   Average      : ${scoreStats._avg.score?.toFixed(1) || 0}%`);
      console.log(`   Minimum      : ${scoreStats._min.score || 0}%`);
      console.log(`   Maximum      : ${scoreStats._max.score || 0}%`);
    }

    // Recent exams
    const recentExams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        title: true,
        subject: true,
        totalQuestions: true,
        isActive: true,
        _count: { select: { examResults: true } }
      }
    });

    if (recentExams.length > 0) {
      console.log('\n📋 RECENT EXAMS');
      console.log('─'.repeat(40));
      recentExams.forEach((exam, i) => {
        const status = exam.isActive ? '✅' : '⏸️';
        console.log(`   ${i + 1}. ${status} ${exam.title}`);
        console.log(`      ${exam.subject} | ${exam.totalQuestions} soal | ${exam._count.examResults} peserta`);
      });
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Stats generated at:', new Date().toLocaleString('id-ID'));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showStats();
