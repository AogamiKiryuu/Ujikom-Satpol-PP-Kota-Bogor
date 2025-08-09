import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get exam with user's result and questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
          },
        },
        examResults: {
          where: { userId },
          include: {
            answers: {
              include: {
                question: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 });
    }

    const examResult = exam.examResults[0];
    if (!examResult) {
      return NextResponse.json({ error: 'Anda belum memulai ujian ini' }, { status: 400 });
    }

    if (examResult.isCompleted) {
      return NextResponse.json({ error: 'Ujian sudah selesai' }, { status: 400 });
    }

    // Check if exam time has expired
    const startTime = new Date(examResult.startTime);
    const currentTime = new Date();
    const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));

    if (elapsedMinutes >= exam.duration) {
      // Auto-submit the exam
      await prisma.examResult.update({
        where: { id: examResult.id },
        data: {
          isCompleted: true,
          endTime: new Date(),
        },
      });

      return NextResponse.json({ error: 'Waktu ujian telah habis' }, { status: 400 });
    }

    // Calculate remaining time
    const remainingMinutes = exam.duration - elapsedMinutes;

    // Transform questions and include user answers
    const questionsWithAnswers = exam.questions.map((question) => {
      const userAnswer = examResult.answers.find((answer) => answer.questionId === question.id);
      return {
        ...question,
        userAnswer: userAnswer?.selectedAnswer || null,
      };
    });

    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        description: exam.description,
      },
      examResult: {
        id: examResult.id,
        startTime: examResult.startTime,
        remainingMinutes,
      },
      questions: questionsWithAnswers,
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
