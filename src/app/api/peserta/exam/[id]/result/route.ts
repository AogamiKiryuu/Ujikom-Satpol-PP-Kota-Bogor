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

    // Get exam result with detailed information
    const examResult = await prisma.examResult.findFirst({
      where: {
        examId,
        userId,
        isCompleted: true,
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
            description: true,
            passingScore: true,
            duration: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
                points: true,
              },
            },
          },
          orderBy: {
            question: {
              createdAt: 'asc',
            },
          },
        },
      },
    });

    if (!examResult) {
      return NextResponse.json({ error: 'Hasil ujian tidak ditemukan' }, { status: 404 });
    }

    // Calculate detailed results
    const questions = examResult.answers.map((answer, index) => {
      const isCorrect = answer.selectedAnswer === answer.question.correctAnswer;
      return {
        number: index + 1,
        question: answer.question,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: answer.question.correctAnswer,
        isCorrect,
      };
    });

    const totalQuestions = examResult.totalQuestions;
    const correctAnswers = examResult.correctAnswers;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = examResult.score >= examResult.exam.passingScore;

    // Calculate weighted points from answers
    let calculatedEarnedPoints = 0;
    let calculatedPossiblePoints = 0;

    examResult.answers.forEach((answer) => {
      calculatedPossiblePoints += answer.question.points;
      if (answer.selectedAnswer === answer.question.correctAnswer) {
        calculatedEarnedPoints += answer.question.points;
      }
    });

    const result = {
      exam: examResult.exam,
      result: {
        id: examResult.id,
        score: examResult.score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        totalEarnedPoints: calculatedEarnedPoints,
        totalPossiblePoints: calculatedPossiblePoints,
        percentage,
        passed,
        startTime: examResult.startTime,
        endTime: examResult.endTime,
        duration: examResult.endTime ? Math.round((new Date(examResult.endTime).getTime() - new Date(examResult.startTime).getTime()) / (1000 * 60)) : 0,
      },
      questions,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching exam result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
