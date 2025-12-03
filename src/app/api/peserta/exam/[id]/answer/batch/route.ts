import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { checkRateLimit, getRateLimitKey, RATE_LIMIT_CONFIGS, getRateLimitHeaders, rateLimitResponse } from '@/lib/rateLimit';
import { answerQueue, withQueue } from '@/lib/requestQueue';
import { examCache, CacheKeys } from '@/lib/cache';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface BatchAnswer {
  questionId: string;
  selectedOption: string;
}

/**
 * Batch answer submission endpoint
 * Accepts multiple answers at once to reduce API calls
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: examId } = await params;
    
    // Verify user authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'PESERTA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = payload.id as string;

    // Rate limiting for batch (stricter)
    const rateLimitKey = getRateLimitKey(userId, 'batchAnswer');
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.batchAnswer);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        rateLimitResponse(rateLimit.resetIn),
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMIT_CONFIGS.batchAnswer.maxRequests)
        }
      );
    }

    const body = await request.json();
    const { answers } = body as { answers: BatchAnswer[] };

    // Validate input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Data jawaban tidak valid' }, { status: 400 });
    }

    // Limit batch size
    if (answers.length > 20) {
      return NextResponse.json({ error: 'Maksimal 20 jawaban per batch' }, { status: 400 });
    }

    // Validate each answer
    for (const answer of answers) {
      if (!answer.questionId || !answer.selectedOption) {
        return NextResponse.json({ error: 'Data jawaban tidak lengkap' }, { status: 400 });
      }
      if (!['A', 'B', 'C', 'D'].includes(answer.selectedOption)) {
        return NextResponse.json({ error: 'Pilihan jawaban tidak valid' }, { status: 400 });
      }
    }

    // Use queue for database operations
    type BatchQueueResult = { success: true; count: number } | { error: string; status: number };
    const result = await withQueue<BatchQueueResult>(answerQueue, async () => {
      // Get exam result (with caching)
      const cacheKey = CacheKeys.userExamResult(userId, examId);
      let examResult = examCache.get<{
        id: string;
        startTime: Date;
        exam: { duration: number };
      }>(cacheKey);

      if (!examResult) {
        const dbResult = await prisma.examResult.findFirst({
          where: {
            examId,
            userId,
            isCompleted: false,
          },
          select: {
            id: true,
            startTime: true,
            exam: {
              select: {
                duration: true,
              },
            },
          },
        });

        if (!dbResult) {
          return { error: 'Sesi ujian tidak ditemukan', status: 404 };
        }

        examResult = dbResult;
        examCache.set(cacheKey, examResult, 300000);
      }

      // Check time
      const startTime = new Date(examResult.startTime);
      const currentTime = new Date();
      const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));

      if (elapsedMinutes >= examResult.exam.duration) {
        return { error: 'Waktu ujian telah habis', status: 400 };
      }

      // Batch upsert all answers in a transaction
      const operations = answers.map(answer => 
        prisma.answer.upsert({
          where: {
            examResultId_questionId: {
              examResultId: examResult!.id,
              questionId: answer.questionId,
            },
          },
          update: {
            selectedAnswer: answer.selectedOption,
          },
          create: {
            examResultId: examResult!.id,
            questionId: answer.questionId,
            selectedAnswer: answer.selectedOption,
          },
        })
      );

      await prisma.$transaction(operations);

      return { success: true as const, count: answers.length };
    });

    if (result && 'error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const successResult = result as { success: true; count: number };
    return NextResponse.json(
      { 
        message: 'Jawaban berhasil disimpan',
        saved: successResult.count 
      },
      { 
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, RATE_LIMIT_CONFIGS.batchAnswer.maxRequests)
      }
    );
  } catch (error) {
    console.error('Error saving batch answers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
