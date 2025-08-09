import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: examId } = await params;
    const body = await request.json();
    const { questionId, selectedOption } = body;

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

    // Validate input
    if (!questionId || !selectedOption) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (!['A', 'B', 'C', 'D'].includes(selectedOption)) {
      return NextResponse.json({ error: 'Pilihan jawaban tidak valid' }, { status: 400 });
    }

    // Get exam result
    const examResult = await prisma.examResult.findFirst({
      where: {
        examId,
        userId,
        isCompleted: false,
      },
      include: {
        exam: true,
      },
    });

    if (!examResult) {
      return NextResponse.json({ error: 'Sesi ujian tidak ditemukan' }, { status: 404 });
    }

    // Check if time has expired
    const startTime = new Date(examResult.startTime);
    const currentTime = new Date();
    const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));

    if (elapsedMinutes >= examResult.exam.duration) {
      return NextResponse.json({ error: 'Waktu ujian telah habis' }, { status: 400 });
    }

    // Verify question belongs to this exam
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        examId,
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 });
    }

    // Save or update answer
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        examResultId: examResult.id,
        questionId,
      },
    });

    if (existingAnswer) {
      // Update existing answer
      await prisma.answer.update({
        where: { id: existingAnswer.id },
        data: { selectedAnswer: selectedOption },
      });
    } else {
      // Create new answer
      await prisma.answer.create({
        data: {
          examResultId: examResult.id,
          questionId,
          selectedAnswer: selectedOption,
        },
      });
    }

    return NextResponse.json({ message: 'Jawaban berhasil disimpan' });
  } catch (error) {
    console.error('Error saving answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
