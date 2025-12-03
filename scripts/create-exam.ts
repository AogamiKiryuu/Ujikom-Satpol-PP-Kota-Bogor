/**
 * Script untuk membuat ujian baru dengan soal otomatis
 * Jalankan: npx tsx scripts/create-exam.ts
 * 
 * Opsi environment variables:
 *   EXAM_TITLE="Judul Ujian"
 *   EXAM_SUBJECT="Mata Pelajaran"
 *   EXAM_QUESTIONS=20
 *   EXAM_DURATION=60
 *   EXAM_PASSING=70
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Konfigurasi default
const CONFIG = {
  title: process.env.EXAM_TITLE || 'Ujian Test ' + new Date().toLocaleDateString('id-ID'),
  subject: process.env.EXAM_SUBJECT || 'Umum',
  totalQuestions: parseInt(process.env.EXAM_QUESTIONS || '20'),
  duration: parseInt(process.env.EXAM_DURATION || '60'),
  passingScore: parseInt(process.env.EXAM_PASSING || '70'),
};

// Template soal untuk berbagai mata pelajaran
const QUESTION_TEMPLATES: Record<string, { questions: string[]; options: string[][] }> = {
  Umum: {
    questions: [
      'Apa ibu kota Indonesia?',
      'Siapa presiden pertama Indonesia?',
      'Berapa jumlah provinsi di Indonesia saat ini?',
      'Kapan Indonesia merdeka?',
      'Apa nama pulau terbesar di Indonesia?',
      'Apa mata uang Indonesia?',
      'Di mana letak Candi Borobudur?',
      'Siapa penemu Pancasila?',
      'Berapa lama masa jabatan presiden?',
      'Apa nama lagu kebangsaan Indonesia?',
    ],
    options: [
      ['Surabaya', 'Bandung', 'Jakarta', 'Yogyakarta'],
      ['Soekarno', 'Soeharto', 'Habibie', 'Megawati'],
      ['34', '38', '27', '33'],
      ['17 Agustus 1945', '17 Agustus 1950', '1 Juni 1945', '28 Oktober 1928'],
      ['Kalimantan', 'Sumatera', 'Papua', 'Sulawesi'],
      ['Dollar', 'Rupiah', 'Ringgit', 'Peso'],
      ['Jawa Tengah', 'Jawa Timur', 'Jawa Barat', 'DIY'],
      ['Soekarno', 'Hatta', 'Sjahrir', 'Tan Malaka'],
      ['4 tahun', '5 tahun', '6 tahun', '7 tahun'],
      ['Garuda Pancasila', 'Indonesia Raya', 'Tanah Airku', 'Bagimu Negeri'],
    ],
  },
  Matematika: {
    questions: [
      'Hasil dari 15 × 8 adalah...',
      'Berapa akar kuadrat dari 144?',
      'Jika x + 5 = 12, maka x = ...',
      'Hasil dari 1000 ÷ 25 adalah...',
      'Berapa hasil dari 2³?',
      'Keliling persegi dengan sisi 7 cm adalah...',
      'Luas lingkaran dengan jari-jari 7 cm adalah... (π = 22/7)',
      'Hasil dari 0.5 × 100 adalah...',
      '75% dari 200 adalah...',
      'Berapa nilai dari 5! (5 faktorial)?',
    ],
    options: [
      ['110', '120', '130', '140'],
      ['11', '12', '13', '14'],
      ['5', '6', '7', '8'],
      ['30', '35', '40', '45'],
      ['6', '8', '9', '16'],
      ['21 cm', '28 cm', '35 cm', '49 cm'],
      ['154 cm²', '144 cm²', '132 cm²', '168 cm²'],
      ['5', '50', '500', '0.5'],
      ['100', '125', '150', '175'],
      ['60', '100', '120', '720'],
    ],
  },
  'Bahasa Indonesia': {
    questions: [
      'Kata baku dari "aktifitas" adalah...',
      'Sinonim dari kata "pandai" adalah...',
      'Antonim dari kata "optimis" adalah...',
      'Kalimat efektif adalah kalimat yang...',
      'Unsur intrinsik cerpen meliputi, kecuali...',
      'Kata serapan dari bahasa Inggris adalah...',
      'Ejaan yang benar adalah...',
      'Jenis kata "dengan" adalah...',
      'Majas personifikasi adalah...',
      'Paragraf deduktif memiliki kalimat utama di...',
    ],
    options: [
      ['aktivitas', 'aktifitas', 'aktipitas', 'aktiVitas'],
      ['bodoh', 'pintar', 'lamban', 'malas'],
      ['pesimis', 'realistis', 'fantastis', 'praktis'],
      ['bertele-tele', 'singkat dan jelas', 'panjang', 'kompleks'],
      ['tema', 'alur', 'penerbit', 'tokoh'],
      ['teknologi', 'matahari', 'gunung', 'sungai'],
      ['analisa', 'analisis', 'analis', 'analise'],
      ['kata benda', 'kata kerja', 'kata depan', 'kata sifat'],
      ['perbandingan', 'pengandaian benda hidup', 'sindiran', 'penegasan'],
      ['awal', 'tengah', 'akhir', 'tersebar'],
    ],
  },
  PKn: {
    questions: [
      'Pancasila sebagai dasar negara tercantum dalam...',
      'Lambang negara Indonesia adalah...',
      'HAM adalah singkatan dari...',
      'Lembaga legislatif di Indonesia adalah...',
      'Pemilu di Indonesia dilaksanakan setiap...',
      'Bhinneka Tunggal Ika artinya...',
      'Konstitusi Indonesia adalah...',
      'Tugas MPR adalah...',
      'Demokrasi berasal dari bahasa...',
      'Warga negara Indonesia diatur dalam...',
    ],
    options: [
      ['UUD 1945', 'GBHN', 'Tap MPR', 'UU'],
      ['Banteng', 'Garuda', 'Harimau', 'Elang'],
      ['Hak Azasi Manusia', 'Hak Asasi Manusia', 'Hak Asazi Manusia', 'Hak Asasi Masyarakat'],
      ['DPR/MPR', 'Presiden', 'MA', 'MK'],
      ['4 tahun', '5 tahun', '6 tahun', '7 tahun'],
      ['Berbeda-beda tetapi tetap satu', 'Satu untuk semua', 'Bersatu kita teguh', 'Merdeka atau mati'],
      ['UUD 1945', 'Pancasila', 'GBHN', 'Tap MPR'],
      ['Membuat UU', 'Mengubah UUD', 'Mengadili', 'Menjalankan pemerintahan'],
      ['Latin', 'Yunani', 'Inggris', 'Arab'],
      ['Pasal 26 UUD 1945', 'Pasal 27 UUD 1945', 'Pasal 28 UUD 1945', 'Pasal 29 UUD 1945'],
    ],
  },
};

// Jawaban benar (index 0-3 = A-D)
const CORRECT_ANSWERS: Record<string, string[]> = {
  Umum: ['C', 'A', 'B', 'A', 'A', 'B', 'A', 'A', 'B', 'B'],
  Matematika: ['B', 'B', 'C', 'C', 'B', 'B', 'A', 'B', 'C', 'C'],
  'Bahasa Indonesia': ['A', 'B', 'A', 'B', 'C', 'A', 'B', 'C', 'B', 'A'],
  PKn: ['A', 'B', 'B', 'A', 'B', 'A', 'A', 'B', 'B', 'A'],
};

async function createExam() {
  console.log('🚀 Create Exam Script\n');
  console.log(`📊 Konfigurasi:`);
  console.log(`   - Judul: ${CONFIG.title}`);
  console.log(`   - Mata Pelajaran: ${CONFIG.subject}`);
  console.log(`   - Jumlah Soal: ${CONFIG.totalQuestions}`);
  console.log(`   - Durasi: ${CONFIG.duration} menit`);
  console.log(`   - Passing Score: ${CONFIG.passingScore}%\n`);

  try {
    // Buat ujian
    const exam = await prisma.exam.create({
      data: {
        title: CONFIG.title,
        subject: CONFIG.subject,
        description: `Ujian ${CONFIG.subject} dengan ${CONFIG.totalQuestions} soal`,
        duration: CONFIG.duration,
        totalQuestions: CONFIG.totalQuestions,
        passingScore: CONFIG.passingScore,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
      },
    });

    console.log(`✅ Ujian dibuat dengan ID: ${exam.id}\n`);

    // Buat soal
    const template = QUESTION_TEMPLATES[CONFIG.subject] || QUESTION_TEMPLATES.Umum;
    const answers = CORRECT_ANSWERS[CONFIG.subject] || CORRECT_ANSWERS.Umum;

    const questionData = [];
    for (let i = 0; i < CONFIG.totalQuestions; i++) {
      const templateIndex = i % template.questions.length;
      const questionNum = Math.floor(i / template.questions.length) + 1;
      
      questionData.push({
        examId: exam.id,
        questionText: questionNum > 1 
          ? `[Variasi ${questionNum}] ${template.questions[templateIndex]}`
          : template.questions[templateIndex],
        optionA: template.options[templateIndex][0],
        optionB: template.options[templateIndex][1],
        optionC: template.options[templateIndex][2],
        optionD: template.options[templateIndex][3],
        correctAnswer: answers[templateIndex],
      });
    }

    await prisma.question.createMany({ data: questionData });

    console.log(`✅ ${questionData.length} soal berhasil dibuat!\n`);
    console.log('📋 Detail Ujian:');
    console.log(`   ID: ${exam.id}`);
    console.log(`   Judul: ${exam.title}`);
    console.log(`   Mata Pelajaran: ${exam.subject}`);
    console.log(`   Durasi: ${exam.duration} menit`);
    console.log(`   Passing Score: ${exam.passingScore}%`);
    console.log(`   Status: ${exam.isActive ? 'Aktif' : 'Tidak Aktif'}`);
    console.log(`   Periode: ${exam.startDate.toLocaleDateString('id-ID')} - ${exam.endDate.toLocaleDateString('id-ID')}`);

  } catch (error) {
    console.error('❌ Gagal membuat ujian:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createExam();
