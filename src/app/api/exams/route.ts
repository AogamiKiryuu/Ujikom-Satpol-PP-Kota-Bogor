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

    // Get exams with their results for the current user
    const currentDate = new Date();
    const userId = payload.id as string;

    const exams = await prisma.exam.findMany({
      where: {
        isActive: true,
        startDate: { lte: currentDate },
      },
      include: {
        examResults: {
          where: { userId },
          select: {
            id: true,
            score: true,
            isCompleted: true,
            startTime: true,
            endTime: true,
          }
        },
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data for frontend
    const transformedExams = exams.map(exam => {
      const userResult = exam.examResults[0]; // User can have only one result per exam
      let status: 'available' | 'ongoing' | 'completed' = 'available';
      
      if (userResult) {
        if (userResult.isCompleted) {
          status = 'completed';
        } else {
          status = 'ongoing';
        }
      } else if (new Date() > exam.endDate) {
        status = 'completed'; // Exam ended, no longer available
      }

      return {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        questions: exam._count.questions,
        status,
        score: userResult?.score,
        deadline: exam.endDate.toISOString(),
      };
    });

    return NextResponse.json(transformedExams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
