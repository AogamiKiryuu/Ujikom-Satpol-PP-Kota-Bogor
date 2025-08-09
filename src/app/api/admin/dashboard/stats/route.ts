import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dashboard statistics
    const [totalPeserta, totalExams, activeExams, completedExams, recentResults, todayRegistrations] = await Promise.all([
      // Total peserta (users with PESERTA role)
      prisma.user.count({
        where: { role: 'PESERTA' },
      }),

      // Total ujian
      prisma.exam.count(),

      // Active exams (currently running)
      prisma.exam.count({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      }),

      // Completed exams
      prisma.examResult.count({
        where: { isCompleted: true },
      }),

      // Recent exam results (last 5)
      prisma.examResult.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          exam: { select: { title: true } },
        },
        where: { isCompleted: true },
      }),

      // Today's registrations
      prisma.user.count({
        where: {
          role: 'PESERTA',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Calculate average score from recent results
    const totalScores = recentResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = recentResults.length > 0 ? Math.round(totalScores / recentResults.length) : 0;

    // Get monthly registration trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        role: 'PESERTA',
        createdAt: { gte: sixMonthsAgo },
      },
      _count: { id: true },
    });

    const stats = {
      totalPeserta,
      totalExams,
      activeExams,
      completedExams,
      todayRegistrations,
      averageScore,
      recentActivity: recentResults.map((result) => ({
        id: result.id,
        userName: result.user.name,
        examTitle: result.exam.title,
        score: result.score,
        completedAt: result.endTime || result.createdAt,
      })),
      monthlyTrend: monthlyRegistrations,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
