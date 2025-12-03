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
    const userId = payload.id as string;

    // Get user's registration date
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get ALL active exams (including expired ones)
    const exams = await prisma.exam.findMany({
      where: {
        isActive: true,
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
    const transformedExams = exams
      .map(exam => {
        const userResult = exam.examResults[0]; // User can have only one result per exam
        const now = new Date();
        const examHasEnded = now > exam.endDate;
        const registeredAfterExam = user.createdAt > exam.endDate;
        
        // Check if user is too late (registered after exam deadline)
        const isTooLate = registeredAfterExam && !userResult;
        
        let status: 'available' | 'ongoing' | 'completed' | 'late' = 'available';
        
        if (userResult) {
          if (userResult.isCompleted) {
            status = 'completed';
          } else {
            status = 'ongoing';
          }
        } else if (isTooLate) {
          status = 'late'; // User registered too late
        } else if (examHasEnded) {
          status = 'available'; // Keep as available but will be marked as expired
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
          isExpired: examHasEnded && !userResult && !isTooLate, // Expired - user had chance but didn't take it
          isTooLate, // User registered after deadline
        };
      });

    return NextResponse.json(transformedExams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
