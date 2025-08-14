import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/middlewares/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyJWT(request);
    if (!decodedToken || decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        title: true,
        subject: true,
        totalQuestions: true,
        isActive: true,
      },
      orderBy: [{ title: 'asc' }, { subject: 'asc' }],
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}
