import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: examId } = await params;

    // Verify user authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'PESERTA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = payload.id as string;

    // Check if exam exists and is active
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examResults: {
          where: { userId },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 });
    }

    if (!exam.isActive) {
      return NextResponse.json({ error: 'Ujian tidak aktif' }, { status: 400 });
    }

    const currentDate = new Date();

    // Check if exam has started
    if (currentDate < exam.startDate) {
      return NextResponse.json({ error: 'Ujian belum dimulai' }, { status: 400 });
    }

    // Check if exam has ended
    if (currentDate > exam.endDate) {
      return NextResponse.json({ error: 'Ujian sudah berakhir' }, { status: 400 });
    }

    // Check if user already has an exam result
    const existingResult = exam.examResults[0];
    if (existingResult) {
      if (existingResult.isCompleted) {
        return NextResponse.json({ error: 'Anda sudah menyelesaikan ujian ini' }, { status: 400 });
      } else {
        // User has an ongoing exam, return the existing result
        return NextResponse.json({
          message: 'Melanjutkan ujian yang sedang berlangsung',
          examResultId: existingResult.id,
        });
      }
    }

    // Create new exam result for the user
    const examResult = await prisma.examResult.create({
      data: {
        userId,
        examId,
        startTime: new Date(),
        isCompleted: false,
        score: 0,
        totalQuestions: exam._count.questions,
        correctAnswers: 0,
      },
    });

    return NextResponse.json({
      message: 'Ujian berhasil dimulai',
      examResultId: examResult.id,
    });
  } catch (error) {
    console.error('Error starting exam:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
