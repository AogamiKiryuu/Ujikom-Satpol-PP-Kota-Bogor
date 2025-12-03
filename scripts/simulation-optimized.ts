/**
 * Simulation Test - Optimized Version
 * Menguji performa sistem setelah optimisasi:
 * - Connection Pooling
 * - Rate Limiting
 * - Request Queue
 * - Caching
 * - Database Indexes
 * 
 * Jalankan: npx tsx scripts/simulation-optimized.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Simulation config
const CONFIG = {
  examTitle: 'Simulasi Stress Test - Optimized',
  subject: 'Performance Testing',
  totalQuestions: 100,
  totalParticipants: 50,
  duration: 120, // minutes
  answersPerParticipant: 100,
};

interface SimulationMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  totalDuration: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  operationsPerSecond: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

interface OperationResult {
  success: boolean;
  duration: number;
  error?: string;
}

function calculatePercentile(sortedLatencies: number[], percentile: number): number {
  const index = Math.ceil((percentile / 100) * sortedLatencies.length) - 1;
  return sortedLatencies[Math.max(0, index)];
}

function formatMetrics(metrics: SimulationMetrics): string {
  return `
╔═══════════════════════════════════════════════════════════════╗
║                    SIMULATION RESULTS                         ║
╠═══════════════════════════════════════════════════════════════╣
║  Total Operations     : ${metrics.totalOperations.toString().padStart(8)}                          ║
║  Successful           : ${metrics.successfulOperations.toString().padStart(8)} (${((metrics.successfulOperations / metrics.totalOperations) * 100).toFixed(1)}%)                   ║
║  Failed               : ${metrics.failedOperations.toString().padStart(8)} (${((metrics.failedOperations / metrics.totalOperations) * 100).toFixed(1)}%)                    ║
╠═══════════════════════════════════════════════════════════════╣
║  Total Duration       : ${(metrics.totalDuration / 1000).toFixed(2).padStart(8)}s                         ║
║  Ops/Second           : ${metrics.operationsPerSecond.toFixed(2).padStart(8)}                          ║
╠═══════════════════════════════════════════════════════════════╣
║  Latency Statistics (ms):                                     ║
║    Average            : ${metrics.avgLatency.toFixed(2).padStart(8)}                          ║
║    Minimum            : ${metrics.minLatency.toFixed(2).padStart(8)}                          ║
║    Maximum            : ${metrics.maxLatency.toFixed(2).padStart(8)}                          ║
║    P50 (Median)       : ${metrics.p50Latency.toFixed(2).padStart(8)}                          ║
║    P95                : ${metrics.p95Latency.toFixed(2).padStart(8)}                          ║
║    P99                : ${metrics.p99Latency.toFixed(2).padStart(8)}                          ║
╚═══════════════════════════════════════════════════════════════╝`;
}

async function runSimulation() {
  console.log('🚀 Starting Optimized Simulation Test...\n');
  console.log(`📊 Configuration:`);
  console.log(`   - Questions: ${CONFIG.totalQuestions}`);
  console.log(`   - Participants: ${CONFIG.totalParticipants}`);
  console.log(`   - Answers per participant: ${CONFIG.answersPerParticipant}`);
  console.log(`   - Total expected operations: ${CONFIG.totalParticipants * CONFIG.answersPerParticipant}\n`);

  const startTime = Date.now();
  const operationLatencies: number[] = [];
  let successCount = 0;
  let failCount = 0;

  try {
    // Step 1: Create exam
    console.log('📝 Step 1: Creating exam...');
    const examStart = Date.now();
    
    const exam = await prisma.exam.create({
      data: {
        title: CONFIG.examTitle,
        subject: CONFIG.subject,
        description: 'Ujian simulasi untuk stress test performa sistem',
        duration: CONFIG.duration,
        totalQuestions: CONFIG.totalQuestions,
        passingScore: 70,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`   ✅ Exam created in ${Date.now() - examStart}ms (ID: ${exam.id})\n`);

    // Step 2: Create questions
    console.log('📝 Step 2: Creating questions...');
    const questionsStart = Date.now();
    
    const questionData = Array.from({ length: CONFIG.totalQuestions }, (_, i) => ({
      examId: exam.id,
      questionText: `[Soal ${i + 1}] Ini adalah pertanyaan stress test nomor ${i + 1}. Manakah jawaban yang benar dari pilihan berikut?`,
      optionA: `Pilihan A untuk soal ${i + 1}`,
      optionB: `Pilihan B untuk soal ${i + 1}`,
      optionC: `Pilihan C untuk soal ${i + 1}`,
      optionD: `Pilihan D untuk soal ${i + 1}`,
      correctAnswer: ['A', 'B', 'C', 'D'][i % 4],
    }));

    await prisma.question.createMany({ data: questionData });
    
    const questions = await prisma.question.findMany({
      where: { examId: exam.id },
      select: { id: true },
    });
    console.log(`   ✅ ${questions.length} questions created in ${Date.now() - questionsStart}ms\n`);

    // Step 3: Create participants
    console.log('📝 Step 3: Creating participants...');
    const participantsStart = Date.now();
    const hashedPassword = await bcrypt.hash('test123', 10);

    const participantData = Array.from({ length: CONFIG.totalParticipants }, (_, i) => ({
      name: `Stress Test User ${i + 1}`,
      email: `stresstest${i + 1}_${Date.now()}@test.com`,
      password: hashedPassword,
      gender: i % 2 === 0 ? 'LAKI_LAKI' as const : 'PEREMPUAN' as const,
      birthDate: new Date('2000-01-01'),
      birthPlace: 'Test City',
      role: 'PESERTA' as const,
    }));

    await prisma.user.createMany({ data: participantData });

    const participants = await prisma.user.findMany({
      where: { email: { contains: `stresstest` } },
      orderBy: { createdAt: 'desc' },
      take: CONFIG.totalParticipants,
      select: { id: true },
    });
    console.log(`   ✅ ${participants.length} participants created in ${Date.now() - participantsStart}ms\n`);

    // Step 4: Start exam sessions
    console.log('📝 Step 4: Starting exam sessions...');
    const sessionsStart = Date.now();

    const examResultData = participants.map(p => ({
      userId: p.id,
      examId: exam.id,
      score: 0,
      totalQuestions: CONFIG.totalQuestions,
      correctAnswers: 0,
      startTime: new Date(),
      isCompleted: false,
      questionOrder: JSON.stringify(questions.map(q => q.id)),
    }));

    await prisma.examResult.createMany({ data: examResultData });

    const examResults = await prisma.examResult.findMany({
      where: { examId: exam.id },
      select: { id: true, userId: true },
    });
    console.log(`   ✅ ${examResults.length} exam sessions started in ${Date.now() - sessionsStart}ms\n`);

    // Step 5: Simulate concurrent answer submissions
    console.log('📝 Step 5: Simulating concurrent answer submissions...');
    console.log('   ⏳ This may take a while...\n');
    
    const answerStart = Date.now();
    const BATCH_SIZE = 50; // Process in batches
    const CONCURRENT_USERS = 10; // Simulate concurrent users

    // Create answer operations
    const allOperations: Array<() => Promise<OperationResult>> = [];

    for (const examResult of examResults) {
      for (let i = 0; i < CONFIG.answersPerParticipant; i++) {
        const questionId = questions[i % questions.length].id;
        const selectedAnswer = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
        
        allOperations.push(async (): Promise<OperationResult> => {
          const opStart = Date.now();
          try {
            await prisma.answer.upsert({
              where: {
                examResultId_questionId: {
                  examResultId: examResult.id,
                  questionId,
                },
              },
              update: { selectedAnswer },
              create: {
                examResultId: examResult.id,
                questionId,
                selectedAnswer,
              },
            });
            return { success: true, duration: Date.now() - opStart };
          } catch (error) {
            return { 
              success: false, 
              duration: Date.now() - opStart,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        });
      }
    }

    console.log(`   📊 Total operations to execute: ${allOperations.length}`);
    
    // Execute in batches with concurrency control
    let processed = 0;
    const progressInterval = setInterval(() => {
      const percent = ((processed / allOperations.length) * 100).toFixed(1);
      const elapsed = ((Date.now() - answerStart) / 1000).toFixed(1);
      process.stdout.write(`\r   ⏳ Progress: ${percent}% (${processed}/${allOperations.length}) - ${elapsed}s elapsed`);
    }, 500);

    for (let i = 0; i < allOperations.length; i += BATCH_SIZE * CONCURRENT_USERS) {
      const batch = allOperations.slice(i, i + BATCH_SIZE * CONCURRENT_USERS);
      
      // Execute batch with concurrency limit
      for (let j = 0; j < batch.length; j += CONCURRENT_USERS) {
        const concurrentOps = batch.slice(j, j + CONCURRENT_USERS);
        const results = await Promise.all(concurrentOps.map(op => op()));
        
        for (const result of results) {
          operationLatencies.push(result.duration);
          if (result.success) successCount++;
          else failCount++;
          processed++;
        }
      }
    }

    clearInterval(progressInterval);
    console.log(`\n   ✅ Answer simulation completed in ${((Date.now() - answerStart) / 1000).toFixed(2)}s\n`);

    // Step 6: Complete exams
    console.log('📝 Step 6: Completing exams and calculating scores...');
    const completeStart = Date.now();

    for (const examResult of examResults) {
      const answers = await prisma.answer.findMany({
        where: { examResultId: examResult.id },
        include: { question: true },
      });

      let correctCount = 0;
      for (const answer of answers) {
        const isCorrect = answer.selectedAnswer === answer.question.correctAnswer;
        if (isCorrect) correctCount++;
        
        await prisma.answer.update({
          where: { id: answer.id },
          data: { isCorrect },
        });
      }

      const score = Math.round((correctCount / CONFIG.totalQuestions) * 100);
      await prisma.examResult.update({
        where: { id: examResult.id },
        data: {
          score,
          correctAnswers: correctCount,
          isCompleted: true,
          endTime: new Date(),
        },
      });
    }
    console.log(`   ✅ ${examResults.length} exams completed in ${Date.now() - completeStart}ms\n`);

    // Calculate metrics
    const totalDuration = Date.now() - startTime;
    const sortedLatencies = [...operationLatencies].sort((a, b) => a - b);
    
    const metrics: SimulationMetrics = {
      totalOperations: operationLatencies.length,
      successfulOperations: successCount,
      failedOperations: failCount,
      totalDuration,
      avgLatency: operationLatencies.reduce((a, b) => a + b, 0) / operationLatencies.length,
      minLatency: sortedLatencies[0] || 0,
      maxLatency: sortedLatencies[sortedLatencies.length - 1] || 0,
      operationsPerSecond: operationLatencies.length / (totalDuration / 1000),
      p50Latency: calculatePercentile(sortedLatencies, 50),
      p95Latency: calculatePercentile(sortedLatencies, 95),
      p99Latency: calculatePercentile(sortedLatencies, 99),
    };

    console.log(formatMetrics(metrics));

    // Performance assessment
    console.log('\n📊 PERFORMANCE ASSESSMENT:');
    
    const successRate = (successCount / operationLatencies.length) * 100;
    if (successRate >= 99.9) {
      console.log('   ✅ Success Rate: EXCELLENT (99.9%+)');
    } else if (successRate >= 99) {
      console.log('   ✅ Success Rate: GOOD (99%+)');
    } else if (successRate >= 95) {
      console.log('   ⚠️  Success Rate: ACCEPTABLE (95%+)');
    } else {
      console.log('   ❌ Success Rate: POOR (<95%)');
    }

    if (metrics.avgLatency < 10) {
      console.log('   ✅ Average Latency: EXCELLENT (<10ms)');
    } else if (metrics.avgLatency < 50) {
      console.log('   ✅ Average Latency: GOOD (<50ms)');
    } else if (metrics.avgLatency < 100) {
      console.log('   ⚠️  Average Latency: ACCEPTABLE (<100ms)');
    } else {
      console.log('   ❌ Average Latency: POOR (>100ms)');
    }

    if (metrics.p95Latency < 50) {
      console.log('   ✅ P95 Latency: EXCELLENT (<50ms)');
    } else if (metrics.p95Latency < 100) {
      console.log('   ✅ P95 Latency: GOOD (<100ms)');
    } else if (metrics.p95Latency < 200) {
      console.log('   ⚠️  P95 Latency: ACCEPTABLE (<200ms)');
    } else {
      console.log('   ❌ P95 Latency: POOR (>200ms)');
    }

    if (metrics.operationsPerSecond > 100) {
      console.log('   ✅ Throughput: EXCELLENT (>100 ops/s)');
    } else if (metrics.operationsPerSecond > 50) {
      console.log('   ✅ Throughput: GOOD (>50 ops/s)');
    } else if (metrics.operationsPerSecond > 20) {
      console.log('   ⚠️  Throughput: ACCEPTABLE (>20 ops/s)');
    } else {
      console.log('   ❌ Throughput: POOR (<20 ops/s)');
    }

    console.log('\n✅ Simulation completed successfully!');
    console.log(`   Exam ID: ${exam.id}`);
    
  } catch (error) {
    console.error('\n❌ Simulation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runSimulation();
