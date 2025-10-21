import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: examId } = await params;
    
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const examRanks = await prisma.examRank.findMany({
      where: { examId },
      include: { rank: true },
    });

    return NextResponse.json({ data: examRanks });
  } catch (error) {
    console.error('Error fetching exam ranks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: examId } = await params;
    
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rankId } = body;

    if (!rankId) {
      return NextResponse.json({ error: 'rankId is required' }, { status: 400 });
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check if rank exists
    const rank = await prisma.rank.findUnique({
      where: { id: rankId },
    });

    if (!rank) {
      return NextResponse.json({ error: 'Rank not found' }, { status: 404 });
    }

    // Check if already exists
    const existing = await prisma.examRank.findUnique({
      where: {
        examId_rankId: {
          examId,
          rankId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'This rank is already assigned to this exam' }, { status: 400 });
    }

    const examRank = await prisma.examRank.create({
      data: {
        examId,
        rankId,
      },
      include: { rank: true },
    });

    return NextResponse.json(examRank, { status: 201 });
  } catch (error) {
    console.error('Error creating exam rank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
