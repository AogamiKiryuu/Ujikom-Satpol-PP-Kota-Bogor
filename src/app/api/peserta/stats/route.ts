import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
  try {
    // Verify user authentication
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'PESERTA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = payload.id as string;
    const currentDate = new Date();

    // Get stats for the user
    const [availableExams, completedResults, ongoingResults] = await Promise.all([
      // Available exams (not taken and still active)
      prisma.exam.count({
        where: {
          isActive: true,
          startDate: { lte: currentDate },
          endDate: { gte: currentDate },
          examResults: {
            none: { userId }
          }
        }
      }),
      
      // Completed exams
      prisma.examResult.findMany({
        where: {
          userId,
          isCompleted: true
        },
        select: {
          score: true,
          exam: {
            select: {
              totalQuestions: true
            }
          }
        }
      }),
      
      // Ongoing exams
      prisma.examResult.count({
        where: {
          userId,
          isCompleted: false
        }
      })
    ]);

    // Calculate stats
    const completedExams = completedResults.length;
    const totalScore = completedResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = completedExams > 0 ? Math.round(totalScore / completedExams) : 0;

    const stats = {
      availableExams,
      completedExams,
      ongoingExams: ongoingResults,
      totalScore,
      averageScore,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
