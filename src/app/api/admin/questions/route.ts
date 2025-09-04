import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

// GET - Get all questions with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const examId = searchParams.get('examId') || '';
    const skip = (page - 1) * limit;

    const where: {
      questionText?: { contains: string; mode: 'insensitive' };
      examId?: string;
    } = {};

    if (search) {
      where.questionText = { contains: search, mode: 'insensitive' };
    }

    if (examId) {
      where.examId = examId;
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              subject: true,
            },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new question
export async function POST(request: NextRequest) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, questionText, optionA, optionB, optionC, optionD, correctAnswer } = body;

    // Validate required fields
    if (!examId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate correct answer
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return NextResponse.json({ error: 'Correct answer must be A, B, C, or D' }, { status: 400 });
    }

    // Check if exam exists
    const examExists = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!examExists) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        examId,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
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

    // Update exam's total questions count
    await prisma.exam.update({
      where: { id: examId },
      data: {
        totalQuestions: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
