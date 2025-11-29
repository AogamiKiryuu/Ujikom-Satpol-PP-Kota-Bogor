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

interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

function validateImportedQuestion(question: ImportedQuestion, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Convert to string and trim
  const examTitle = String(question.examTitle || '').trim();
  const examSubject = String(question.examSubject || '').trim();
  const questionText = String(question.questionText || '').trim();
  const optionA = String(question.optionA || '').trim();
  const optionB = String(question.optionB || '').trim();
  const optionC = String(question.optionC || '').trim();
  const optionD = String(question.optionD || '').trim();
  const correctAnswer = String(question.correctAnswer || '').trim().toUpperCase();

  // Validate examTitle
  if (!examTitle) {
    errors.push({ row: rowIndex, field: 'examTitle', message: 'Judul ujian tidak boleh kosong' });
  } else if (examTitle.length < 3) {
    errors.push({ row: rowIndex, field: 'examTitle', message: 'Judul ujian minimal 3 karakter' });
  } else if (examTitle.length > 200) {
    errors.push({ row: rowIndex, field: 'examTitle', message: 'Judul ujian maksimal 200 karakter' });
  }

  // Validate examSubject if provided
  if (examSubject && examSubject.length < 2) {
    errors.push({ row: rowIndex, field: 'examSubject', message: 'Mata pelajaran minimal 2 karakter' });
  } else if (examSubject && examSubject.length > 100) {
    errors.push({ row: rowIndex, field: 'examSubject', message: 'Mata pelajaran maksimal 100 karakter' });
  }

  // Validate questionText
  if (!questionText) {
    errors.push({ row: rowIndex, field: 'questionText', message: 'Teks pertanyaan tidak boleh kosong' });
  } else if (questionText.length < 5) {
    errors.push({ row: rowIndex, field: 'questionText', message: 'Teks pertanyaan minimal 5 karakter' });
  } else if (questionText.length > 1000) {
    errors.push({ row: rowIndex, field: 'questionText', message: 'Teks pertanyaan maksimal 1000 karakter' });
  }

  // Validate options
  if (!optionA) {
    errors.push({ row: rowIndex, field: 'optionA', message: 'Pilihan A tidak boleh kosong' });
  } else if (optionA.length > 500) {
    errors.push({ row: rowIndex, field: 'optionA', message: 'Pilihan A maksimal 500 karakter' });
  }

  if (!optionB) {
    errors.push({ row: rowIndex, field: 'optionB', message: 'Pilihan B tidak boleh kosong' });
  } else if (optionB.length > 500) {
    errors.push({ row: rowIndex, field: 'optionB', message: 'Pilihan B maksimal 500 karakter' });
  }

  if (!optionC) {
    errors.push({ row: rowIndex, field: 'optionC', message: 'Pilihan C tidak boleh kosong' });
  } else if (optionC.length > 500) {
    errors.push({ row: rowIndex, field: 'optionC', message: 'Pilihan C maksimal 500 karakter' });
  }

  if (!optionD) {
    errors.push({ row: rowIndex, field: 'optionD', message: 'Pilihan D tidak boleh kosong' });
  } else if (optionD.length > 500) {
    errors.push({ row: rowIndex, field: 'optionD', message: 'Pilihan D maksimal 500 karakter' });
  }

  // Validate correctAnswer
  if (!correctAnswer) {
    errors.push({ row: rowIndex, field: 'correctAnswer', message: 'Jawaban benar tidak boleh kosong' });
  } else if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    errors.push({ row: rowIndex, field: 'correctAnswer', message: `Jawaban benar harus A, B, C, atau D (ditemukan: "${correctAnswer}")` });
  }

  // Check for duplicate options
  const options = [optionA, optionB, optionC, optionD].filter(Boolean);
  const uniqueOptions = new Set(options);
  if (options.length !== uniqueOptions.size) {
    errors.push({ row: rowIndex, message: 'Tidak boleh ada pilihan jawaban yang sama' });
  }

  // Check if all options are identical
  if (optionA && optionB && optionC && optionD) {
    const allSame = optionA === optionB && optionB === optionC && optionC === optionD;
    if (allSame) {
      errors.push({ row: rowIndex, message: 'Semua pilihan jawaban tidak boleh sama persis' });
    }
  }

  return errors;
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

        // Validate CSV headers
        if (questions.length > 0) {
          const requiredHeaders = ['examTitle', 'examSubject', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
          const actualHeaders = Object.keys(questions[0]);
          const missingHeaders = requiredHeaders.filter((required) => !actualHeaders.includes(required));

          if (missingHeaders.length > 0) {
            return NextResponse.json(
              {
                error: `Kolom berikut tidak ditemukan: ${missingHeaders.join(', ')}. Pastikan header sesuai dengan template.`,
              },
              { status: 400 }
            );
          }

          // Check for extra/unknown headers
          const unknownHeaders = actualHeaders.filter((header) => header && !requiredHeaders.includes(header));
          if (unknownHeaders.length > 0) {
            return NextResponse.json(
              {
                error: `Kolom tidak dikenal ditemukan: ${unknownHeaders.join(', ')}. Gunakan template yang sesuai.`,
              },
              { status: 400 }
            );
          }
        }
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

        // Validate Excel headers
        const requiredHeaders = ['examTitle', 'examSubject', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
        const missingHeaders = requiredHeaders.filter((required) => !headers.includes(required));

        if (missingHeaders.length > 0) {
          return NextResponse.json(
            {
              error: `Kolom berikut tidak ditemukan: ${missingHeaders.join(', ')}. Pastikan header sesuai dengan template.`,
            },
            { status: 400 }
          );
        }

        // Check for extra/unknown headers
        const unknownHeaders = headers.filter((header) => header && !requiredHeaders.includes(header));
        if (unknownHeaders.length > 0) {
          return NextResponse.json(
            {
              error: `Kolom tidak dikenal ditemukan: ${unknownHeaders.join(', ')}. Gunakan template yang sesuai.`,
            },
            { status: 400 }
          );
        }

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

    // Validate all questions first before processing
    const allValidationErrors: string[] = [];
    for (let i = 0; i < questions.length; i++) {
      const questionErrors = validateImportedQuestion(questions[i], i + 2); // +2 for header row
      if (questionErrors.length > 0) {
        questionErrors.forEach((err) => {
          const fieldText = err.field ? ` (${err.field})` : '';
          allValidationErrors.push(`Baris ${err.row}${fieldText}: ${err.message}`);
        });
      }
    }

    // If there are validation errors, return them all
    if (allValidationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Data tidak valid. Perbaiki kesalahan berikut:',
          details: allValidationErrors.slice(0, 10), // Limit to first 10 errors
          totalErrors: allValidationErrors.length,
        },
        { status: 400 }
      );
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
