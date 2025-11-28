import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/middlewares/auth';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportedQuestion {
  examTitle: string;
  examSubject?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT and check if user is admin
    const decodedToken = await verifyJWT(request);
    if (!decodedToken || decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk melakukan import soal' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        {
          error: 'Format file tidak didukung. Gunakan CSV atau Excel.',
        },
        { status: 400 }
      );
    }

    let questions: ImportedQuestion[];

    try {
      if (fileName.endsWith('.csv')) {
        // Parse CSV
        const fileContent = await file.text();
        const parseResult = Papa.parse<ImportedQuestion>(fileContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
        });

        if (parseResult.errors.length > 0) {
          return NextResponse.json(
            {
              error: 'Gagal membaca file CSV. Pastikan format file sudah benar',
            },
            { status: 400 }
          );
        }

        questions = parseResult.data;
      } else {
        // Parse Excel
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header row as keys
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        if (jsonData.length < 2) {
          return NextResponse.json(
            {
              error: 'File Excel harus memiliki minimal 2 baris (header + 1 data)',
            },
            { status: 400 }
          );
        }

        // Get headers from first row
        const headers = jsonData[0] as string[];

        // Convert rows to objects
        questions = jsonData
          .slice(1)
          .map((row: unknown[]) => {
            const obj: Record<string, unknown> = {};
            headers.forEach((header, i) => {
              // Convert to string to ensure .trim() works
              const value = row[i];
              obj[header] = value !== null && value !== undefined ? String(value) : '';
            });
            return obj as unknown as ImportedQuestion;
          })
          .filter((q) => q.examTitle && q.questionText); // Filter out empty rows
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      return NextResponse.json(
        {
          error: 'Gagal membaca file. Pastikan file sesuai dengan template yang disediakan',
        },
        { status: 400 }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'File tidak mengandung data soal atau format tidak sesuai',
        },
        { status: 400 }
      );
    }

    // Validate required columns
    const requiredColumns = ['examTitle', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
    const firstRow = questions[0];
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Format file tidak sesuai template. Pastikan semua kolom ada dan tidak diubah`,
        },
        { status: 400 }
      );
    }

    // Group questions by exam
    const examGroups = new Map<string, ImportedQuestion[]>();

    for (const question of questions) {
      // Create exam key (title + subject if available)
      const examKey = question.examSubject ? `${question.examTitle}|${question.examSubject}` : question.examTitle;

      if (!examGroups.has(examKey)) {
        examGroups.set(examKey, []);
      }
      examGroups.get(examKey)!.push(question);
    }

    // Validate and prepare data
    const validQuestions = [];
    const errors = [];
    const processedExams = new Set<string>();

    for (const [examKey, examQuestions] of examGroups) {
      const [title, subject] = examKey.includes('|') ? examKey.split('|') : [examKey, null];

      // Find exam by title and subject (if provided)
      let exam;
      if (subject) {
        exam = await prisma.exam.findFirst({
          where: {
            title: { equals: title, mode: 'insensitive' },
            subject: { equals: subject, mode: 'insensitive' },
          },
        });
      } else {
        exam = await prisma.exam.findFirst({
          where: { title: { equals: title, mode: 'insensitive' } },
        });
      }

      if (!exam) {
        errors.push(`Ujian tidak ditemukan: "${title}"${subject ? ` (${subject})` : ''}`);
        continue;
      }

      // Validate questions for this exam
      for (let i = 0; i < examQuestions.length; i++) {
        const question = examQuestions[i];
        const questionIndex = questions.indexOf(question) + 2; // +2 for header and 0-based

        // Validate correctAnswer
        if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer.toUpperCase())) {
          errors.push(`Baris ${questionIndex}: Jawaban benar harus A, B, C, atau D`);
          continue;
        }

        // Validate required fields
        if (!question.questionText || !question.optionA || !question.optionB || !question.optionC || !question.optionD) {
          errors.push(`Baris ${questionIndex}: Semua field harus diisi`);
          continue;
        }

        validQuestions.push({
          examId: exam.id,
          questionText: question.questionText.trim(),
          optionA: question.optionA.trim(),
          optionB: question.optionB.trim(),
          optionC: question.optionC.trim(),
          optionD: question.optionD.trim(),
          correctAnswer: question.correctAnswer.toUpperCase(),
        });
      }

      processedExams.add(exam.id);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Ada kesalahan dalam data soal',
          details: errors,
        },
        { status: 400 }
      );
    }

    if (validQuestions.length === 0) {
      return NextResponse.json(
        {
          error: 'Tidak ada soal yang dapat diimport. Periksa kembali data Anda',
        },
        { status: 400 }
      );
    }

    // Insert questions
    const createdQuestions = await prisma.question.createMany({
      data: validQuestions,
    });

    // Update exam totalQuestions count
    for (const examId of processedExams) {
      const questionCount = await prisma.question.count({
        where: { examId },
      });

      await prisma.exam.update({
        where: { id: examId },
        data: { totalQuestions: questionCount },
      });
    }

    return NextResponse.json({
      message: 'Import berhasil',
      imported: createdQuestions.count,
      examsUpdated: processedExams.size,
    });
  } catch (error) {
    console.error('Error importing questions:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat import',
      },
      { status: 500 }
    );
  }
}
