import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

// GET - Get comprehensive reports and analytics
export async function GET(request: NextRequest) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('type') || 'overview';

    // Date filters
    const dateFilter: {
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    switch (reportType) {
      case 'overview':
        // General overview statistics
        const [totalUsers, totalExams, totalQuestions, totalResults, activeExams, recentResults] = await Promise.all([
          prisma.user.count({ where: { role: 'PESERTA' } }),
          prisma.exam.count(),
          prisma.question.count(),
          prisma.examResult.count({ where: { isCompleted: true } }),
          prisma.exam.count({
            where: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          }),
          prisma.examResult.findMany({
            where: {
              isCompleted: true,
              ...dateFilter,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { name: true } },
              exam: { select: { title: true, subject: true } },
            },
          }),
        ]);

        // Calculate average score
        const avgScoreResult = await prisma.examResult.aggregate({
          where: {
            isCompleted: true,
            ...dateFilter,
          },
          _avg: { score: true },
        });

        return NextResponse.json({
          overview: {
            totalUsers,
            totalExams,
            totalQuestions,
            totalResults,
            activeExams,
            averageScore: Math.round(avgScoreResult._avg.score || 0),
          },
          recentResults: recentResults.map((result) => ({
            id: result.id,
            userName: result.user.name,
            examTitle: result.exam.title,
            subject: result.exam.subject,
            score: result.score,
            createdAt: result.createdAt.toISOString(),
          })),
        });

      case 'exam-performance':
        // Performance analysis per exam
        const examFilter: { id?: string } = {};
        if (examId) examFilter.id = examId;

        const examPerformance = await prisma.exam.findMany({
          where: examFilter,
          include: {
            examResults: {
              where: {
                isCompleted: true,
                ...dateFilter,
              },
              select: {
                score: true,
                correctAnswers: true,
                totalQuestions: true,
                user: { select: { name: true } },
              },
            },
            questions: {
              include: {
                answers: {
                  where: {
                    examResult: {
                      isCompleted: true,
                      ...dateFilter,
                    },
                  },
                  select: {
                    selectedAnswer: true,
                  },
                },
              },
            },
          },
        });

        const examStats = examPerformance.map((exam) => {
          const results = exam.examResults;
          const totalParticipants = results.length;

          if (totalParticipants === 0) {
            return {
              examId: exam.id,
              examTitle: exam.title,
              subject: exam.subject,
              totalParticipants: 0,
              averageScore: 0,
              passRate: 0,
              questionAnalysis: [],
            };
          }

          const totalScore = results.reduce((sum, result) => sum + result.score, 0);
          const averageScore = Math.round(totalScore / totalParticipants);
          const passedCount = results.filter((result) => result.score >= exam.passingScore).length;
          const passRate = Math.round((passedCount / totalParticipants) * 100);

          // Question-wise analysis
          const questionAnalysis = exam.questions.map((question) => {
            // Get all answers for this specific question from completed exam results
            const questionAnswers = question.answers;

            const totalAnswers = questionAnswers.length;
            const correctAnswers = questionAnswers.filter((answer) => {
              // Check if the selected answer matches the correct answer
              return answer.selectedAnswer === question.correctAnswer;
            }).length;

            const difficultyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

            return {
              questionId: question.id,
              questionText: question.questionText.length > 100 ? question.questionText.substring(0, 100) + '...' : question.questionText,
              correctAnswer: question.correctAnswer,
              totalAnswers,
              correctAnswers,
              difficultyRate,
            };
          });

          return {
            examId: exam.id,
            examTitle: exam.title,
            subject: exam.subject,
            totalParticipants,
            averageScore,
            passRate,
            questionAnalysis,
          };
        });

        return NextResponse.json({ examPerformance: examStats });

      case 'user-performance':
        // Individual user performance
        const userPerformance = await prisma.user.findMany({
          where: { role: 'PESERTA' },
          include: {
            examResults: {
              where: {
                isCompleted: true,
                ...dateFilter,
              },
              include: {
                exam: {
                  select: {
                    title: true,
                    subject: true,
                    passingScore: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        const userStats = userPerformance
          .filter((user) => user.examResults.length > 0)
          .map((user) => {
            const results = user.examResults;
            const totalExams = results.length;
            const totalScore = results.reduce((sum, result) => sum + result.score, 0);
            const averageScore = Math.round(totalScore / totalExams);
            const passedExams = results.filter((result) => result.score >= result.exam.passingScore).length;
            const passRate = Math.round((passedExams / totalExams) * 100);

            return {
              userId: user.id,
              userName: user.name,
              email: user.email,
              totalExams,
              averageScore,
              passedExams,
              passRate,
              lastExamDate: results[0]?.createdAt?.toISOString(),
              recentExams: results.slice(0, 5).map((result) => ({
                examTitle: result.exam.title,
                subject: result.exam.subject,
                score: result.score,
                passed: result.score >= result.exam.passingScore,
                date: result.createdAt.toISOString(),
              })),
            };
          })
          .sort((a, b) => b.averageScore - a.averageScore);

        return NextResponse.json({ userPerformance: userStats });

      case 'time-trends':
        // Time-based trends
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const examResults = await prisma.examResult.findMany({
          where: {
            isCompleted: true,
            createdAt: { gte: thirtyDaysAgo },
          },
          select: {
            score: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        // Group by date
        const trendsMap = new Map<string, { date: string; count: number; totalScore: number; avgScore: number }>();

        examResults.forEach((result) => {
          const date = result.createdAt.toISOString().split('T')[0];
          if (!trendsMap.has(date)) {
            trendsMap.set(date, { date, count: 0, totalScore: 0, avgScore: 0 });
          }
          const existing = trendsMap.get(date)!;
          existing.count += 1;
          existing.totalScore += result.score;
          existing.avgScore = Math.round(existing.totalScore / existing.count);
        });

        // Fill missing dates with zero values
        const trends = [];
        const currentDate = new Date(thirtyDaysAgo);
        const today = new Date();

        while (currentDate <= today) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const data = trendsMap.get(dateStr) || { date: dateStr, count: 0, totalScore: 0, avgScore: 0 };
          trends.push({
            date: dateStr,
            count: data.count,
            avgScore: data.avgScore,
            formattedDate: currentDate.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
            }),
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return NextResponse.json({ timeTrends: trends });

      default:
        return NextResponse.json({ error: 'Jenis laporan tidak valid' }, { status: 400 });
    }
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
