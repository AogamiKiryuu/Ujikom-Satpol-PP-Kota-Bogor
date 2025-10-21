import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

interface RouteParams {
  params: Promise<{ id: string; rankId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: examId, rankId } = await params;
    
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const examRank = await prisma.examRank.findUnique({
      where: {
        examId_rankId: {
          examId,
          rankId,
        },
      },
    });

    if (!examRank) {
      return NextResponse.json({ error: 'Exam rank not found' }, { status: 404 });
    }

    await prisma.examRank.delete({
      where: {
        examId_rankId: {
          examId,
          rankId,
        },
      },
    });

    return NextResponse.json({ message: 'Exam rank deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam rank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
