import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

// Reset ujian untuk peserta tertentu
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decodedToken = await verifyJWT(request);
    if (!decodedToken || decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk mereset ujian' }, { status: 403 });
    }

    const { participantIds } = await request.json();
    const examId = params.id;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: 'Data peserta tidak valid' }, { status: 400 });
    }

    // Hapus semua hasil ujian peserta yang dipilih
    const deleted = await prisma.examResult.deleteMany({
      where: {
        examId,
        userId: {
          in: participantIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: participantIds.length === 1 ? 'Ujian peserta berhasil direset' : `Ujian ${participantIds.length} peserta berhasil direset`,
      count: deleted.count,
    });
  } catch (error) {
    console.error('Error resetting exam:', error);
    return NextResponse.json({ error: 'Gagal mereset ujian. Silakan coba lagi' }, { status: 500 });
  }
}

// Reset ujian untuk semua peserta
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decodedToken = await verifyJWT(request);
    if (!decodedToken || decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk mereset ujian' }, { status: 403 });
    }

    const examId = params.id;

    // Hapus semua hasil ujian untuk ujian ini
    const deleted = await prisma.examResult.deleteMany({
      where: {
        examId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Semua hasil ujian berhasil direset',
      count: deleted.count,
    });
  } catch (error) {
    console.error('Error resetting all exam results:', error);
    return NextResponse.json({ error: 'Gagal mereset semua hasil ujian. Silakan coba lagi' }, { status: 500 });
  }
}
