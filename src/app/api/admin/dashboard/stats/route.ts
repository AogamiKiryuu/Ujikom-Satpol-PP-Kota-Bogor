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
    const [totalPeserta, totalExams, activeExams, completedExams, todayRegistrations, recentResults, averageScore, scoreDistribution, scheduledExams, examsBySubject] = await Promise.all([
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

      // Score distribution for bar chart
      prisma.examResult.groupBy({
        by: ['score'],
        where: { isCompleted: true },
        _count: { score: true },
      }),

      // Scheduled exams (future exams)
      prisma.exam.count({
        where: {
          isActive: true,
          startDate: { gt: now },
        },
      }),

      // Get all exams with their exam results count
      prisma.exam.findMany({
        select: {
          subject: true,
          examResults: {
            where: { isCompleted: true },
            select: { id: true },
          },
        },
      }),
    ]);

    // Process score distribution into ranges
    const scoreRanges = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];

    scoreDistribution.forEach((item) => {
      const score = item.score;
      if (score <= 20) scoreRanges[0].count += item._count.score;
      else if (score <= 40) scoreRanges[1].count += item._count.score;
      else if (score <= 60) scoreRanges[2].count += item._count.score;
      else if (score <= 80) scoreRanges[3].count += item._count.score;
      else scoreRanges[4].count += item._count.score;
    });

    // Process exam status for pie chart
    const examStatusData = [
      { status: 'Aktif', count: activeExams, color: '#10b981' },
      { status: 'Dijadwalkan', count: scheduledExams, color: '#f59e0b' },
      { status: 'Selesai', count: totalExams - activeExams - scheduledExams, color: '#6b7280' },
    ].filter((item) => item.count > 0); // Only show statuses with data

    // Process exams by subject - count participants per subject
    const subjectMap = new Map<string, number>();
    
    examsBySubject.forEach((exam) => {
      const participantCount = exam.examResults.length;
      const currentCount = subjectMap.get(exam.subject) || 0;
      subjectMap.set(exam.subject, currentCount + participantCount);
    });
    
    const examsBySubjectData = Array.from(subjectMap.entries())
      .map(([subject, count]) => ({
        subject,
        count,
      }))
      .filter((item) => item.count > 0) // Only show subjects with participants
      .sort((a, b) => b.count - a.count); // Sort by participant count descending

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
      charts: {
        scoreDistribution: scoreRanges,
        examStatus: examStatusData,
        examsBySubject: examsBySubjectData,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
