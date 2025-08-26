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
  points: string;
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
  points: number;
  rowIndex: number;
  errors?: string[];
}

function validateQuestion(row: CSVRow, rowIndex: number): PreviewQuestion {
  const errors: string[] = [];

  // Required field validation
  if (!row.examTitle?.trim()) {
    errors.push('Judul ujian tidak boleh kosong');
  }
  if (!row.examSubject?.trim()) {
    errors.push('Mata pelajaran tidak boleh kosong');
  }
  if (!row.questionText?.trim()) {
    errors.push('Teks pertanyaan tidak boleh kosong');
  }
  if (!row.optionA?.trim()) {
    errors.push('Pilihan A tidak boleh kosong');
  }
  if (!row.optionB?.trim()) {
    errors.push('Pilihan B tidak boleh kosong');
  }
  if (!row.optionC?.trim()) {
    errors.push('Pilihan C tidak boleh kosong');
  }
  if (!row.optionD?.trim()) {
    errors.push('Pilihan D tidak boleh kosong');
  }

  // Correct answer validation
  const correctAnswer = row.correctAnswer?.trim().toUpperCase();
  if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    errors.push('Jawaban benar harus A, B, C, atau D');
  }

  // Points validation
  const points = parseInt(row.points || '1');
  if (isNaN(points) || points < 1) {
    errors.push('Poin harus berupa angka positif');
  }

  return {
    examTitle: row.examTitle?.trim() || '',
    examSubject: row.examSubject?.trim() || '',
    questionText: row.questionText?.trim() || '',
    optionA: row.optionA?.trim() || '',
    optionB: row.optionB?.trim() || '',
    optionC: row.optionC?.trim() || '',
    optionD: row.optionD?.trim() || '',
    correctAnswer: correctAnswer || '',
    points: points || 1,
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

  return records.map(
    (row: CSVRow, index: number) => validateQuestion(row, index + 2) // +2 because CSV starts from row 2 (after header)
  );
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

  // Convert rows to objects using actual headers
  const records = jsonData
    .slice(1)
    .map((row: unknown[], index: number) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
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
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
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
