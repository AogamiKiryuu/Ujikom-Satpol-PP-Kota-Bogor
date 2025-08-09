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

    // Get current date for filtering
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get dashboard statistics
    const [
      totalPeserta,
      totalExams,
      activeExams,
      completedExams,
      todayRegistrations,
      recentResults,
      averageScore
    ] = await Promise.all([
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
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),

      // Completed exam results
      prisma.examResult.count({
        where: { isCompleted: true },
      }),

      // Today's registrations
      prisma.user.count({
        where: {
          role: 'PESERTA',
          createdAt: { gte: today },
        },
      }),

      // Recent exam results for activity feed
      prisma.examResult.findMany({
        where: { isCompleted: true },
        include: {
          user: { select: { name: true } },
          exam: { select: { title: true, subject: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Average score calculation
      prisma.examResult.aggregate({
        where: { isCompleted: true },
        _avg: { score: true },
      }),
    ]);

    const stats = {
      totalPeserta,
      totalExams,
      activeExams,
      completedExams,
      todayRegistrations,
      averageScore: Math.round(averageScore._avg.score || 0),
      recentActivity: recentResults.map((result) => ({
        id: result.id,
        userName: result.user.name,
        examTitle: result.exam.title,
        subject: result.exam.subject,
        score: result.score,
        completedAt: result.endTime || result.createdAt,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
