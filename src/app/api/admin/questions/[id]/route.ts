import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get question by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// PUT - Update question
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, points = 1 } = body;

    // Validate input
    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return NextResponse.json({ error: 'Jawaban benar harus A, B, C, atau D' }, { status: 400 });
    }

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 });
    }

    // Update question
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        points: parseInt(points),
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Soal berhasil diperbarui',
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE - Delete question
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    const { id } = await params;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        exam: true,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 });
    }

    // Delete question (this will also delete related answers due to cascade)
    await prisma.question.delete({
      where: { id },
    });

    // Update exam's total questions count
    const remainingQuestions = await prisma.question.count({
      where: { examId: existingQuestion.examId },
    });

    await prisma.exam.update({
      where: { id: existingQuestion.examId },
      data: { totalQuestions: remainingQuestions },
    });

    return NextResponse.json({
      message: 'Soal berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
