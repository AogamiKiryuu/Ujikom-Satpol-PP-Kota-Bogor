import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const decodedToken = await verifyJWT(request);
    if (!decodedToken || decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Anda tidak memiliki akses' }, { status: 403 });
    }

    const { id: examId } = await params;

    // Get exam details first to check endDate
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        endDate: true,
        title: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 });
    }

    // Get ALL participants regardless of registration date
    const participants = await prisma.user.findMany({
      where: {
        role: 'PESERTA',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
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

    // Transform data and add "isTooLate" flag for those registered after exam ended
    const participantsData = participants.map((participant) => {
      const examResult = participant.examResults[0];
      const registeredAfterExam = participant.createdAt > exam.endDate;
      
      return {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        hasSubmitted: examResult?.isCompleted || false,
        score: examResult?.score || null,
        submittedAt: examResult?.endTime || null,
        isTooLate: registeredAfterExam, // Flag for participants who registered after exam ended
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
