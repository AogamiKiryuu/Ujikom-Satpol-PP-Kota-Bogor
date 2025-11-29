import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

interface CSVRow {
  examTitle: string;
  examSubject: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface PreviewQuestion {
  examTitle: string;
  examSubject: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  rowIndex: number;
  errors?: string[];
}

function validateQuestion(row: CSVRow, rowIndex: number): PreviewQuestion {
  const errors: string[] = [];

  // Convert to string and trim
  const examTitle = String(row.examTitle || '').trim();
  const examSubject = String(row.examSubject || '').trim();
  const questionText = String(row.questionText || '').trim();
  const optionA = String(row.optionA || '').trim();
  const optionB = String(row.optionB || '').trim();
  const optionC = String(row.optionC || '').trim();
  const optionD = String(row.optionD || '').trim();
  const correctAnswer = String(row.correctAnswer || '').trim().toUpperCase();

  // Required field validation with more strict checks
  if (!examTitle) {
    errors.push('Judul ujian tidak boleh kosong');
  } else if (examTitle.length < 3) {
    errors.push('Judul ujian minimal 3 karakter');
  } else if (examTitle.length > 200) {
    errors.push('Judul ujian maksimal 200 karakter');
  }

  if (!examSubject) {
    errors.push('Mata pelajaran tidak boleh kosong');
  } else if (examSubject.length < 2) {
    errors.push('Mata pelajaran minimal 2 karakter');
  } else if (examSubject.length > 100) {
    errors.push('Mata pelajaran maksimal 100 karakter');
  }

  if (!questionText) {
    errors.push('Teks pertanyaan tidak boleh kosong');
  } else if (questionText.length < 5) {
    errors.push('Teks pertanyaan minimal 5 karakter');
  } else if (questionText.length > 1000) {
    errors.push('Teks pertanyaan maksimal 1000 karakter');
  }

  if (!optionA) {
    errors.push('Pilihan A tidak boleh kosong');
  } else if (optionA.length > 500) {
    errors.push('Pilihan A maksimal 500 karakter');
  }

  if (!optionB) {
    errors.push('Pilihan B tidak boleh kosong');
  } else if (optionB.length > 500) {
    errors.push('Pilihan B maksimal 500 karakter');
  }

  if (!optionC) {
    errors.push('Pilihan C tidak boleh kosong');
  } else if (optionC.length > 500) {
    errors.push('Pilihan C maksimal 500 karakter');
  }

  if (!optionD) {
    errors.push('Pilihan D tidak boleh kosong');
  } else if (optionD.length > 500) {
    errors.push('Pilihan D maksimal 500 karakter');
  }

  // Correct answer validation
  if (!correctAnswer) {
    errors.push('Jawaban benar tidak boleh kosong');
  } else if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    errors.push(`Jawaban benar harus A, B, C, atau D (ditemukan: "${correctAnswer}")`);
  }

  // Check for duplicate options
  const options = [optionA, optionB, optionC, optionD].filter(Boolean);
  const uniqueOptions = new Set(options);
  if (options.length !== uniqueOptions.size) {
    errors.push('Tidak boleh ada pilihan jawaban yang sama');
  }

  // Check if all options are too similar (potential copy-paste error)
  if (optionA && optionB && optionC && optionD) {
    const allSame = optionA === optionB && optionB === optionC && optionC === optionD;
    if (allSame) {
      errors.push('Semua pilihan jawaban tidak boleh sama persis');
    }
  }

  return {
    examTitle,
    examSubject,
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
    rowIndex,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function parseCSV(buffer: Buffer): PreviewQuestion[] {
  const csvText = buffer.toString('utf-8');
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (records.length === 0) {
    throw new Error('File CSV tidak mengandung data');
  }

  // Validate headers from first record
  const firstRecord = records[0];
  const requiredHeaders = ['examTitle', 'examSubject', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
  const actualHeaders = Object.keys(firstRecord);

  const missingHeaders = requiredHeaders.filter((required) => !actualHeaders.includes(required));
  if (missingHeaders.length > 0) {
    throw new Error(`Kolom berikut tidak ditemukan: ${missingHeaders.join(', ')}. Pastikan header sesuai dengan template.`);
  }

  // Check for extra/unknown headers
  const unknownHeaders = actualHeaders.filter((header) => header && !requiredHeaders.includes(header));
  if (unknownHeaders.length > 0) {
    throw new Error(`Kolom tidak dikenal ditemukan: ${unknownHeaders.join(', ')}. Gunakan template yang sesuai.`);
  }

  return records.map((row: CSVRow, index: number) => validateQuestion(row, index + 2)); // +2 because CSV starts from row 2 (after header)
}

function parseExcel(buffer: Buffer): PreviewQuestion[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

  if (jsonData.length < 2) {
    throw new Error('File Excel harus memiliki minimal 2 baris (header + 1 data)');
  }

  // Get headers from first row
  const headers = jsonData[0] as string[];

  // Validate required headers
  const requiredHeaders = ['examTitle', 'examSubject', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
  const missingHeaders = requiredHeaders.filter((required) => !headers.includes(required));

  if (missingHeaders.length > 0) {
    throw new Error(`Kolom berikut tidak ditemukan: ${missingHeaders.join(', ')}. Pastikan header sesuai dengan template.`);
  }

  // Check for extra/unknown headers
  const unknownHeaders = headers.filter((header) => header && !requiredHeaders.includes(header));
  if (unknownHeaders.length > 0) {
    throw new Error(`Kolom tidak dikenal ditemukan: ${unknownHeaders.join(', ')}. Gunakan template yang sesuai.`);
  }

  // Convert rows to objects using actual headers
  const records = jsonData
    .slice(1)
    .map((row: unknown[], index: number) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header, i) => {
        // Convert to string to ensure .trim() works
        const value = row[i];
        obj[header] = value !== null && value !== undefined ? String(value) : '';
      });
      return validateQuestion(obj as unknown as CSVRow, index + 2);
    })
    .filter((q) => q.examTitle && q.questionText); // Filter out empty rows

  return records;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let questions: PreviewQuestion[];

    if (file.name.endsWith('.csv')) {
      questions = parseCSV(buffer);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      questions = parseExcel(buffer);
    } else {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan CSV atau Excel (.xlsx, .xls)' }, { status: 400 });
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: 'File tidak mengandung data soal yang valid' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      questions,
      summary: {
        total: questions.length,
        valid: questions.filter((q) => !q.errors?.length).length,
        invalid: questions.filter((q) => q.errors?.length).length,
      },
    });
  } catch (error) {
    console.error('Error in preview API:', error);

    let errorMessage = 'Terjadi kesalahan saat memproses file';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
