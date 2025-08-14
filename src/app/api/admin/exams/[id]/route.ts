import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single exam with detailed info
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { createdAt: 'asc' },
        },
        examResults: {
          where: { isCompleted: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 });
    }

    // Calculate statistics
    const totalParticipants = exam.examResults.length;
    const averageScore = totalParticipants > 0 ? Math.round(exam.examResults.reduce((sum, result) => sum + result.score, 0) / totalParticipants) : 0;

    // Calculate status
    const now = new Date();
    let status = 'DRAFT';
    if (exam.startDate && exam.endDate) {
      if (now < exam.startDate) {
        status = 'UPCOMING';
      } else if (now >= exam.startDate && now <= exam.endDate) {
        status = 'ONGOING';
      } else {
        status = 'COMPLETED';
      }
    }

    const examWithStats = {
      ...exam,
      status,
      totalParticipants,
      averageScore,
      totalQuestions: exam.questions.length,
    };

    return NextResponse.json(examWithStats);
  } catch (error) {
    console.error('Get exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update exam
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    const body = await request.json();
    const { title, subject, description, startDate, endDate, duration } = body;

    // Validate required fields
    if (!title || !subject || !startDate || !endDate || !duration) {
      return NextResponse.json(
        {
          error: 'Title, subject, start date, end date, and duration are required',
        },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        {
          error: 'Start date must be before end date',
        },
        { status: 400 }
      );
    }

    // Check if exam exists
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Update exam
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        subject,
        description,
        startDate: start,
        endDate: end,
        duration: parseInt(duration),
      },
      include: {
        questions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      message: 'Ujian berhasil diperbarui',
      exam: updatedExam,
    });
  } catch (error) {
    console.error('Update exam error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE - Delete exam
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        examResults: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 });
    }

    // Check if exam has results
    if (exam.examResults.length > 0) {
      return NextResponse.json(
        {
          error: 'Tidak dapat menghapus ujian yang sudah memiliki hasil',
        },
        { status: 400 }
      );
    }

    // Delete exam (this will also remove question associations due to cascade)
    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Ujian berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
