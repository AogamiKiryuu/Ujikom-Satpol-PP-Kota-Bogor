import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/middlewares/auth';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

interface ImportedQuestion {
  examTitle: string;
  examSubject?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  points: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT and check if user is admin
    const decodedToken = await verifyJWT(request);
    if (!decodedToken || decodedToken.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json({ 
        error: 'Format file tidak didukung. Gunakan CSV atau Excel.' 
      }, { status: 400 });
    }

    const fileContent = await file.text();
    
    // Parse CSV
    const parseResult = Papa.parse<ImportedQuestion>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'Error parsing CSV: ' + parseResult.errors[0].message 
      }, { status: 400 });
    }

    const questions = parseResult.data;
    
    if (questions.length === 0) {
      return NextResponse.json({ 
        error: 'File CSV kosong atau format tidak valid' 
      }, { status: 400 });
    }

    // Validate required columns
    const requiredColumns = ['examTitle', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
    const firstRow = questions[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Kolom yang hilang: ${missingColumns.join(', ')}` 
      }, { status: 400 });
    }

    // Group questions by exam
    const examGroups = new Map<string, ImportedQuestion[]>();
    
    for (const question of questions) {
      // Create exam key (title + subject if available)
      const examKey = question.examSubject 
        ? `${question.examTitle}|${question.examSubject}`
        : question.examTitle;
      
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
            subject: { equals: subject, mode: 'insensitive' }
          }
        });
      } else {
        exam = await prisma.exam.findFirst({
          where: { title: { equals: title, mode: 'insensitive' } }
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
        if (!question.questionText || !question.optionA || !question.optionB || 
            !question.optionC || !question.optionD) {
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
          points: parseInt(question.points) || 1
        });
      }

      processedExams.add(exam.id);
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validasi gagal',
        details: errors 
      }, { status: 400 });
    }

    if (validQuestions.length === 0) {
      return NextResponse.json({ 
        error: 'Tidak ada soal yang valid untuk diimport' 
      }, { status: 400 });
    }

    // Insert questions
    const createdQuestions = await prisma.question.createMany({
      data: validQuestions
    });

    // Update exam totalQuestions count
    for (const examId of processedExams) {
      const questionCount = await prisma.question.count({
        where: { examId }
      });
      
      await prisma.exam.update({
        where: { id: examId },
        data: { totalQuestions: questionCount }
      });
    }

    return NextResponse.json({
      message: 'Import berhasil',
      imported: createdQuestions.count,
      examsUpdated: processedExams.size
    });

  } catch (error) {
    console.error('Error importing questions:', error);
    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat import' 
    }, { status: 500 });
  }
}
