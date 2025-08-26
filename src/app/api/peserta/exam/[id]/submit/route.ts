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

    // Get exam result with answers
    const examResult = await prisma.examResult.findFirst({
      where: {
        examId,
        userId,
        isCompleted: false,
      },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!examResult) {
      return NextResponse.json({ error: 'Sesi ujian tidak ditemukan' }, { status: 404 });
    }

    // Calculate score with weighted points and update answer correctness
    let correctAnswers = 0;
    let totalEarnedPoints = 0;
    let totalPossiblePoints = 0;
    const totalQuestions = examResult.exam.questions.length;

    // Calculate total possible points
    for (const question of examResult.exam.questions) {
      totalPossiblePoints += question.points;
    }

    // Update each answer with isCorrect flag and calculate weighted score
    for (const answer of examResult.answers) {
      const isCorrect = answer.selectedAnswer === answer.question.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
        totalEarnedPoints += answer.question.points; // Add weighted points
      }

      // Update the answer with isCorrect flag
      await prisma.answer.update({
        where: { id: answer.id },
        data: { isCorrect },
      });
    }

    // Calculate weighted score as percentage
    const score = totalPossiblePoints > 0 ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100) : 0;

    // Update exam result
    await prisma.examResult.update({
      where: { id: examResult.id },
      data: {
        isCompleted: true,
        endTime: new Date(),
        score,
        correctAnswers,
      },
    });

    return NextResponse.json({
      message: 'Ujian berhasil diselesaikan',
      score,
      correctAnswers,
      totalQuestions,
      totalEarnedPoints,
      totalPossiblePoints,
      passingScore: examResult.exam.passingScore,
      passed: score >= examResult.exam.passingScore,
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
