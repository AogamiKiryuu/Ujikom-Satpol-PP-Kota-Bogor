import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

// GET - Get all exams with pagination and filtering
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
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const where: {
      title?: { contains: string; mode: 'insensitive' };
      isActive?: boolean;
      startDate?: { lte?: Date; gte?: Date };
      endDate?: { gte?: Date; lt?: Date };
    } = {};

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Filter by status
    if (status === 'active') {
      where.isActive = true;
      where.startDate = { lte: new Date() };
      where.endDate = { gte: new Date() };
    } else if (status === 'upcoming') {
      where.isActive = true;
      where.startDate = { gte: new Date() };
    } else if (status === 'completed') {
      where.endDate = { lt: new Date() };
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          questions: {
            select: { id: true },
          },
          examResults: {
            where: { isCompleted: true },
            select: { id: true },
          },
        },
      }),
      prisma.exam.count({ where }),
    ]);

    // Add computed fields
    const examsWithStats = exams.map((exam) => {
      const now = new Date();
      let examStatus = 'upcoming';

      if (!exam.isActive) {
        examStatus = 'inactive';
      } else if (exam.startDate <= now && exam.endDate >= now) {
        examStatus = 'active';
      } else if (exam.endDate < now) {
        examStatus = 'completed';
      }

      return {
        ...exam,
        questionsCount: exam.questions.length,
        participantsCount: exam.examResults.length,
        status: examStatus,
        questions: undefined, // Remove from response
        examResults: undefined, // Remove from response
      };
    });

    return NextResponse.json({
      data: examsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get exams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new exam
export async function POST(request: NextRequest) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, subject, description, duration, passingScore, startDate, endDate, isActive = true } = body;

    // Validate required fields
    if (!title || !subject || !duration || !passingScore || !startDate || !endDate) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const newExam = await prisma.exam.create({
      data: {
        title,
        subject,
        description,
        duration: parseInt(duration),
        totalQuestions: 0, // Will be updated when questions are added
        passingScore: parseInt(passingScore),
        isActive,
        startDate: start,
        endDate: end,
      },
    });

    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
