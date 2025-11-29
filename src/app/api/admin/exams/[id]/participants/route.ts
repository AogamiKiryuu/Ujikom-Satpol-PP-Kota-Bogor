import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decodedToken = await verifyJWT(request);
    if (!decodedToken || decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Anda tidak memiliki akses' }, { status: 403 });
    }

    const examId = params.id;

    // Get all users with role PESERTA
    const participants = await prisma.user.findMany({
      where: {
        role: 'PESERTA',
      },
      select: {
        id: true,
        name: true,
        email: true,
        examResults: {
          where: {
            examId,
          },
          select: {
            id: true,
            score: true,
            isCompleted: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform data
    const participantsData = participants.map((participant) => {
      const examResult = participant.examResults[0];
      return {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        hasSubmitted: examResult?.isCompleted || false,
        score: examResult?.score || null,
        submittedAt: examResult?.endTime || null,
      };
    });

    return NextResponse.json({
      success: true,
      participants: participantsData,
      total: participantsData.length,
      submitted: participantsData.filter((p) => p.hasSubmitted).length,
      notSubmitted: participantsData.filter((p) => !p.hasSubmitted).length,
    });
  } catch (error) {
    console.error('Error fetching exam participants:', error);
    return NextResponse.json({ error: 'Gagal memuat data peserta' }, { status: 500 });
  }
}
