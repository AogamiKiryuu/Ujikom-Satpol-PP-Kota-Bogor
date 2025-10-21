/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, Download, Users, Award, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface OverviewStats {
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  totalResults: number;
  activeExams: number;
  averageScore: number;
}

interface RecentResult {
  id: string;
  userName: string;
  examTitle: string;
  subject: string;
  score: number;
  createdAt: string;
}

interface ExamPerformance {
  examId: string;
  examTitle: string;
  subject: string;
  totalParticipants: number;
  averageScore: number;
  passRate: number;
  questionAnalysis: {
    questionId: string;
    questionText: string;
    fullQuestionText: string;
    correctAnswer: string;
    totalAnswers: number;
    correctAnswers: number;
    correctPercentage: number;
    difficultyRate: number; // backward compatibility
    difficultyLevel: string;
    difficultyColor: string;
    difficultyDescription: string;
    answerDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      unanswered: number;
    };
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
  }[];
}

interface UserPerformance {
  userId: string;
  userName: string;
  email: string;
  totalExams: number;
  averageScore: number;
  passedExams: number;
  passRate: number;
  lastExamDate: string;
  recentExams: {
    examTitle: string;
    subject: string;
    score: number;
    passed: boolean;
    date: string;
  }[];
}

interface TimeTrend {
  date: string;
  count: number;
  avgScore: number;
  formattedDate: string;
}

export default function AdminLaporanPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'overview' | 'exam-performance' | 'user-performance' | 'time-trends'>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedExam, setSelectedExam] = useState('');

  // Data states
  const [overviewData, setOverviewData] = useState<{
    overview: OverviewStats;
    recentResults: RecentResult[];
  } | null>(null);
  const [examPerformanceData, setExamPerformanceData] = useState<{
    examPerformance: ExamPerformance[];
  } | null>(null);
  const [userPerformanceData, setUserPerformanceData] = useState<{
    userPerformance: UserPerformance[];
  } | null>(null);
  const [timeTrendsData, setTimeTrendsData] = useState<{
    timeTrends: TimeTrend[];
  } | null>(null);
  const [exams, setExams] = useState<{ id: string; title: string; subject: string }[]>([]);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exams', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data.data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: reportType,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(selectedExam && { examId: selectedExam }),
      });

      const response = await fetch(`/api/admin/reports?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        switch (reportType) {
          case 'overview':
            setOverviewData(data);
            break;
          case 'exam-performance':
            setExamPerformanceData(data);
            break;
          case 'user-performance':
            setUserPerformanceData(data);
            break;
          case 'time-trends':
            setTimeTrendsData(data);
            break;
        }
      } else {
        toast.error('Gagal memuat data laporan');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleGenerateReport = () => {
    fetchReportData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const exportToExcel = (data: RecentResult[] | ExamPerformance[] | UserPerformance[] | TimeTrend[], filename: string) => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Handle different data types differently
    if (filename.includes('recent-results')) {
      const recentData = data as RecentResult[];
      const headers = ['ID', 'Nama Peserta', 'Judul Ujian', 'Mata Pelajaran', 'Nilai', 'Tanggal'];
      const wsData = [headers, ...recentData.map((item) => [item.id, item.userName, item.examTitle, item.subject, item.score, formatDateTime(item.createdAt)])];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style the header row
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:F1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellRef]) ws[cellRef] = {};
        if (!ws[cellRef].s) ws[cellRef].s = {};
        ws[cellRef].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: 'F59E0B' },
            bgColor: { rgb: 'F59E0B' },
          },
          font: {
            bold: true,
            color: { rgb: 'FFFFFF' },
            size: 11,
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: false,
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }

      // Set column widths
      ws['!cols'] = [
        { width: 12 }, // ID
        { width: 25 }, // Nama Peserta
        { width: 35 }, // Judul Ujian
        { width: 20 }, // Mata Pelajaran
        { width: 12 }, // Nilai
        { width: 25 }, // Tanggal
      ];

      // Freeze header row
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      XLSX.utils.book_append_sheet(wb, ws, 'Hasil Ujian Terbaru');
    } else if (filename.includes('performa-ujian')) {
      const examData = data as ExamPerformance[];

      if (examData.length > 0 && examData[0].questionAnalysis && examData[0].questionAnalysis.length > 0) {
        // Summary sheet
        const summaryHeaders = [
          'ID Ujian',
          'Judul Ujian',
          'Mata Pelajaran',
          'Total Peserta',
          'Rata-rata Nilai',
          'Tingkat Kelulusan (%)',
          'Total Soal',
          'Soal Mudah',
          'Soal Sedang',
          'Soal Sulit',
          'Rata-rata Kesulitan (%)',
        ];
        const summaryData = [
          summaryHeaders,
          ...examData.map((exam) => {
            const difficultyStats = {
              mudah: exam.questionAnalysis.filter((q) => ['Sangat Mudah', 'Mudah'].includes(q.difficultyLevel)).length,
              sedang: exam.questionAnalysis.filter((q) => q.difficultyLevel === 'Sedang').length,
              sulit: exam.questionAnalysis.filter((q) => ['Sulit', 'Sangat Sulit', 'Ekstrem Sulit'].includes(q.difficultyLevel)).length,
            };

            const avgDifficulty = exam.questionAnalysis.length > 0 ? Math.round(exam.questionAnalysis.reduce((acc, q) => acc + q.correctPercentage, 0) / exam.questionAnalysis.length) : 0;

            return [
              exam.examId,
              exam.examTitle,
              exam.subject,
              exam.totalParticipants,
              exam.averageScore,
              exam.passRate,
              exam.questionAnalysis.length,
              difficultyStats.mudah,
              difficultyStats.sedang,
              difficultyStats.sulit,
              avgDifficulty,
            ];
          }),
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

        // Style summary header
        const summaryRange = XLSX.utils.decode_range(summaryWs['!ref'] || 'A1:K1');
        for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!summaryWs[cellRef]) summaryWs[cellRef] = {};
          if (!summaryWs[cellRef].s) summaryWs[cellRef].s = {};
          summaryWs[cellRef].s = {
            fill: {
              patternType: 'solid',
              fgColor: { rgb: 'F59E0B' },
              bgColor: { rgb: 'F59E0B' },
            },
            font: {
              bold: true,
              color: { rgb: 'FFFFFF' },
              size: 11,
            },
            alignment: {
              horizontal: 'center',
              vertical: 'center',
              wrapText: false,
            },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          };
        }

        summaryWs['!cols'] = [
          { width: 15 }, // ID Ujian
          { width: 30 }, // Judul Ujian
          { width: 20 }, // Mata Pelajaran
          { width: 15 }, // Total Peserta
          { width: 18 }, // Rata-rata Nilai
          { width: 20 }, // Tingkat Kelulusan
          { width: 15 }, // Total Soal
          { width: 15 }, // Soal Mudah
          { width: 15 }, // Soal Sedang
          { width: 15 }, // Soal Sulit
          { width: 20 }, // Rata-rata Kesulitan
        ];

        // Freeze header row
        summaryWs['!freeze'] = { xSplit: 0, ySplit: 1 };

        XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan Ujian');

        // Detailed analysis sheet
        const detailHeaders = [
          'ID Ujian',
          'Judul Ujian',
          'No Soal',
          'Pertanyaan',
          'Jawaban Benar',
          'Total Jawaban',
          'Jawaban Benar Count',
          'Persentase Benar (%)',
          'Tingkat Kesulitan',
          'Deskripsi Kesulitan',
          'Distribusi A',
          'Distribusi B',
          'Distribusi C',
          'Distribusi D',
          'Tidak Dijawab',
        ];
        const detailData = [
          detailHeaders,
          ...examData.flatMap((exam) =>
            exam.questionAnalysis.map((question, index) => [
              exam.examId,
              exam.examTitle,
              index + 1,
              question.questionText,
              question.correctAnswer,
              question.totalAnswers,
              question.correctAnswers,
              question.correctPercentage,
              question.difficultyLevel,
              question.difficultyDescription,
              question.answerDistribution.A,
              question.answerDistribution.B,
              question.answerDistribution.C,
              question.answerDistribution.D,
              question.answerDistribution.unanswered,
            ])
          ),
        ];

        const detailWs = XLSX.utils.aoa_to_sheet(detailData);

        // Style detail header
        const detailRange = XLSX.utils.decode_range(detailWs['!ref'] || 'A1:O1');
        for (let col = detailRange.s.c; col <= detailRange.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!detailWs[cellRef]) detailWs[cellRef] = {};
          if (!detailWs[cellRef].s) detailWs[cellRef].s = {};
          detailWs[cellRef].s = {
            fill: {
              patternType: 'solid',
              fgColor: { rgb: 'F59E0B' },
              bgColor: { rgb: 'F59E0B' },
            },
            font: {
              bold: true,
              color: { rgb: 'FFFFFF' },
              size: 11,
            },
            alignment: {
              horizontal: 'center',
              vertical: 'center',
              wrapText: false,
            },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          };
        }

        detailWs['!cols'] = [
          { width: 12 }, // ID Ujian
          { width: 30 }, // Judul Ujian
          { width: 10 }, // No Soal
          { width: 50 }, // Pertanyaan
          { width: 15 }, // Jawaban Benar
          { width: 15 }, // Total Jawaban
          { width: 18 }, // Jawaban Benar Count
          { width: 18 }, // Persentase Benar
          { width: 18 }, // Tingkat Kesulitan
          { width: 25 }, // Deskripsi Kesulitan
          { width: 12 }, // Distribusi A
          { width: 12 }, // Distribusi B
          { width: 12 }, // Distribusi C
          { width: 12 }, // Distribusi D
          { width: 15 }, // Tidak Dijawab
        ];

        // Freeze header row
        detailWs['!freeze'] = { xSplit: 0, ySplit: 1 };

        XLSX.utils.book_append_sheet(wb, detailWs, 'Analisis Detail');
      } else {
        // Basic exam data
        const headers = ['ID Ujian', 'Judul Ujian', 'Mata Pelajaran', 'Total Peserta', 'Rata-rata Nilai', 'Tingkat Kelulusan (%)'];
        const wsData = [headers, ...examData.map((item) => [item.examId, item.examTitle, item.subject, item.totalParticipants, item.averageScore, item.passRate])];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Style header
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:F1');
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!ws[cellRef]) ws[cellRef] = {};
          if (!ws[cellRef].s) ws[cellRef].s = {};
          ws[cellRef].s = {
            fill: {
              patternType: 'solid',
              fgColor: { rgb: 'F59E0B' },
              bgColor: { rgb: 'F59E0B' },
            },
            font: {
              bold: true,
              color: { rgb: 'FFFFFF' },
              size: 11,
            },
            alignment: {
              horizontal: 'center',
              vertical: 'center',
              wrapText: false,
            },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          };
        }

        ws['!cols'] = [
          { width: 15 }, // ID Ujian
          { width: 30 }, // Judul Ujian
          { width: 20 }, // Mata Pelajaran
          { width: 15 }, // Total Peserta
          { width: 18 }, // Rata-rata Nilai
          { width: 20 }, // Tingkat Kelulusan
        ];

        // Freeze header row
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };

        XLSX.utils.book_append_sheet(wb, ws, 'Performa Ujian');
      }
    } else if (filename.includes('performa-peserta')) {
      const userData = data as UserPerformance[];
      const headers = ['ID Peserta', 'Nama Peserta', 'Email', 'Total Ujian', 'Rata-rata Nilai', 'Ujian Lulus', 'Tingkat Kelulusan (%)', 'Ujian Terakhir'];
      const wsData = [headers, ...userData.map((item) => [item.userId, item.userName, item.email, item.totalExams, item.averageScore, item.passedExams, item.passRate, formatDate(item.lastExamDate)])];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style header
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:H1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellRef]) ws[cellRef] = {};
        if (!ws[cellRef].s) ws[cellRef].s = {};
        ws[cellRef].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: 'F59E0B' },
            bgColor: { rgb: 'F59E0B' },
          },
          font: {
            bold: true,
            color: { rgb: 'FFFFFF' },
            size: 11,
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: false,
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }

      ws['!cols'] = [
        { width: 15 }, // ID Peserta
        { width: 25 }, // Nama Peserta
        { width: 30 }, // Email
        { width: 15 }, // Total Ujian
        { width: 18 }, // Rata-rata Nilai
        { width: 15 }, // Ujian Lulus
        { width: 20 }, // Tingkat Kelulusan
        { width: 18 }, // Ujian Terakhir
      ];

      // Freeze header row
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      XLSX.utils.book_append_sheet(wb, ws, 'Performa Peserta');
    } else if (filename.includes('tren-waktu')) {
      const trendData = data as TimeTrend[];
      const headers = ['Tanggal', 'Jumlah Ujian', 'Rata-rata Nilai', 'Tanggal Format'];
      const wsData = [headers, ...trendData.map((item) => [item.date, item.count, item.avgScore, item.formattedDate])];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style header
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:D1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellRef]) ws[cellRef] = {};
        if (!ws[cellRef].s) ws[cellRef].s = {};
        ws[cellRef].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: 'F59E0B' },
            bgColor: { rgb: 'F59E0B' },
          },
          font: {
            bold: true,
            color: { rgb: 'FFFFFF' },
            size: 11,
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: false,
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }

      ws['!cols'] = [
        { width: 18 }, // Tanggal
        { width: 18 }, // Jumlah Ujian
        { width: 20 }, // Rata-rata Nilai
        { width: 18 }, // Tanggal Format
      ];

      // Freeze header row
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      XLSX.utils.book_append_sheet(wb, ws, 'Tren Waktu');
    } else {
      // Fallback to generic Excel export
      const flattenData = (items: Record<string, unknown>[]) => {
        return items.map((item) => {
          const flattened: Record<string, unknown> = {};

          Object.entries(item).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              flattened[key] = `${value.length} items`;
            } else if (value && typeof value === 'object' && value.constructor === Object) {
              Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
                flattened[`${key}_${nestedKey}`] = nestedValue;
              });
            } else {
              flattened[key] = value;
            }
          });

          return flattened;
        });
      };

      const flatData = flattenData(data as unknown as Record<string, unknown>[]);
      const headers = Object.keys(flatData[0]);
      const wsData = [headers, ...flatData.map((row) => Object.values(row))];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style header
      const range = XLSX.utils.decode_range(ws['!ref'] || `A1:${String.fromCharCode(65 + headers.length - 1)}1`);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellRef]) ws[cellRef] = {};
        if (!ws[cellRef].s) ws[cellRef].s = {};
        ws[cellRef].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: 'F59E0B' },
            bgColor: { rgb: 'F59E0B' },
          },
          font: {
            bold: true,
            color: { rgb: 'FFFFFF' },
            size: 11,
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: false,
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }

      ws['!cols'] = headers.map((header) => ({ width: 18 })); // Dynamic width based on content

      // Freeze header row
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      XLSX.utils.book_append_sheet(wb, ws, 'Data');
    }

    // Write Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('File Excel berhasil didownload!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Laporan & Analisis</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Report Controls */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Laporan</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'overview' | 'exam-performance' | 'user-performance' | 'time-trends')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="overview">Ringkasan Umum</option>
                  <option value="exam-performance">Performa Ujian</option>
                  <option value="user-performance">Performa Peserta</option>
                  <option value="time-trends">Tren Waktu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {reportType === 'exam-performance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ujian</label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Semua Ujian</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.title} - {exam.subject}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              {loading ? 'Memuat...' : 'Generate Laporan'}
            </button>
          </div>

          {/* Report Content */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat laporan...</p>
            </div>
          ) : (
            <>
              {/* Overview Report */}
              {reportType === 'overview' && overviewData && (
                <div className="space-y-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Peserta</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{overviewData.overview.totalUsers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                          <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-300" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ujian</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{overviewData.overview.totalExams}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                          <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Nilai</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{overviewData.overview.averageScore}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Section for Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart - Exam Status Distribution */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Distribusi Status Ujian</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Ujian Aktif', value: overviewData.overview.activeExams, color: '#10b981' },
                              { name: 'Ujian Selesai', value: overviewData.overview.totalExams - overviewData.overview.activeExams, color: '#6b7280' },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                          >
                            {[
                              { name: 'Ujian Aktif', value: overviewData.overview.activeExams, color: '#10b981' },
                              { name: 'Ujian Selesai', value: overviewData.overview.totalExams - overviewData.overview.activeExams, color: '#6b7280' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '0.5rem',
                              color: '#f9fafb',
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Bar Chart - Top Performers */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 5 Nilai Tertinggi</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={overviewData.recentResults.slice(0, 5).sort((a, b) => b.score - a.score)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="userName" stroke="#9ca3af" angle={-15} textAnchor="end" height={80} />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '0.5rem',
                              color: '#f9fafb',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="score" fill="#f59e0b" name="Nilai" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Results */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Hasil Ujian Terbaru</h3>
                      <button
                        onClick={() => exportToExcel(overviewData.recentResults, 'hasil-ujian-terbaru')}
                        className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Ekspor Excel
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peserta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ujian</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nilai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {overviewData.recentResults.map((result) => (
                            <tr key={result.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{result.userName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{result.examTitle}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{result.subject}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    result.score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {result.score}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateTime(result.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Exam Performance Report */}
              {reportType === 'exam-performance' && examPerformanceData && (
                <div className="space-y-6">
                  {examPerformanceData.examPerformance.map((exam) => (
                    <div key={exam.examId} className="bg-white dark:bg-gray-800 shadow rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{exam.examTitle}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{exam.subject}</p>
                          </div>
                          <button
                            onClick={() => exportToExcel([exam], `performa-ujian-${exam.examTitle.replace(/\s+/g, '-')}`)}
                            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Ekspor Excel
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.totalParticipants}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Peserta</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.averageScore}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Nilai</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.passRate}%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tingkat Kelulusan</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.questionAnalysis.length}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Soal</p>
                          </div>
                        </div>

                        {/* Charts for Exam Performance */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* Bar Chart - Difficulty Distribution */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Distribusi Tingkat Kesulitan Soal</h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart
                                data={(() => {
                                  const difficultyLevels = exam.questionAnalysis.map((q) => q.difficultyLevel);
                                  return [
                                    { level: 'Sangat Mudah', count: difficultyLevels.filter((d) => d === 'Sangat Mudah').length, color: '#10b981' },
                                    { level: 'Mudah', count: difficultyLevels.filter((d) => d === 'Mudah').length, color: '#34d399' },
                                    { level: 'Sedang', count: difficultyLevels.filter((d) => d === 'Sedang').length, color: '#3b82f6' },
                                    { level: 'Sulit', count: difficultyLevels.filter((d) => d === 'Sulit').length, color: '#f59e0b' },
                                    { level: 'Sangat Sulit', count: difficultyLevels.filter((d) => d === 'Sangat Sulit').length, color: '#ef4444' },
                                    { level: 'Ekstrem', count: difficultyLevels.filter((d) => d === 'Ekstrem Sulit').length, color: '#9333ea' },
                                  ].filter((item) => item.count > 0);
                                })()}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="level" stroke="#9ca3af" angle={-15} textAnchor="end" height={80} />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                    color: '#f9fafb',
                                  }}
                                />
                                <Bar dataKey="count" name="Jumlah Soal">
                                  {[
                                    { level: 'Sangat Mudah', count: exam.questionAnalysis.filter((q) => q.difficultyLevel === 'Sangat Mudah').length, color: '#10b981' },
                                    { level: 'Mudah', count: exam.questionAnalysis.filter((q) => q.difficultyLevel === 'Mudah').length, color: '#34d399' },
                                    { level: 'Sedang', count: exam.questionAnalysis.filter((q) => q.difficultyLevel === 'Sedang').length, color: '#3b82f6' },
                                    { level: 'Sulit', count: exam.questionAnalysis.filter((q) => q.difficultyLevel === 'Sulit').length, color: '#f59e0b' },
                                    { level: 'Sangat Sulit', count: exam.questionAnalysis.filter((q) => q.difficultyLevel === 'Sangat Sulit').length, color: '#ef4444' },
                                    { level: 'Ekstrem', count: exam.questionAnalysis.filter((q) => q.difficultyLevel === 'Ekstrem Sulit').length, color: '#9333ea' },
                                  ]
                                    .filter((item) => item.count > 0)
                                    .map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Pie Chart - Answer Distribution for Most Difficult Question */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Distribusi Jawaban (Soal Tersulit)</h4>
                            {(() => {
                              const mostDifficult = exam.questionAnalysis.reduce((prev, current) => (prev.correctPercentage < current.correctPercentage ? prev : current));
                              const answerData = [
                                { option: 'A', count: mostDifficult.answerDistribution.A },
                                { option: 'B', count: mostDifficult.answerDistribution.B },
                                { option: 'C', count: mostDifficult.answerDistribution.C },
                                { option: 'D', count: mostDifficult.answerDistribution.D },
                                { option: 'Tidak Dijawab', count: mostDifficult.answerDistribution.unanswered },
                              ].filter((item) => item.count > 0);

                              return (
                                <>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                    Soal #{exam.questionAnalysis.indexOf(mostDifficult) + 1} - {mostDifficult.correctPercentage}% benar
                                  </p>
                                  <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                      <Pie data={answerData} cx="50%" cy="50%" labelLine={true} label outerRadius={80} fill="#8884d8" dataKey="count" nameKey="option">
                                        {answerData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.option === mostDifficult.correctAnswer ? '#10b981' : index === 4 ? '#6b7280' : '#3b82f6'} />
                                        ))}
                                      </Pie>
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: '#1f2937',
                                          border: '1px solid #374151',
                                          borderRadius: '0.5rem',
                                          color: '#f9fafb',
                                        }}
                                      />
                                      <Legend />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Overall Difficulty Analysis */}
                        {exam.questionAnalysis.length > 0 &&
                          (() => {
                            const difficultyLevels = exam.questionAnalysis.map((q) => q.difficultyLevel);
                            const difficultyStats = {
                              'Sangat Mudah': difficultyLevels.filter((d) => d === 'Sangat Mudah').length,
                              Mudah: difficultyLevels.filter((d) => d === 'Mudah').length,
                              Sedang: difficultyLevels.filter((d) => d === 'Sedang').length,
                              Sulit: difficultyLevels.filter((d) => d === 'Sulit').length,
                              'Sangat Sulit': difficultyLevels.filter((d) => d === 'Sangat Sulit').length,
                              'Ekstrem Sulit': difficultyLevels.filter((d) => d === 'Ekstrem Sulit').length,
                            };
                            const avgDifficulty = exam.questionAnalysis.reduce((acc, q) => acc + q.correctPercentage, 0) / exam.questionAnalysis.length;

                            return (
                              <div className="mb-6 p-4 bg-blue-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">📊 Evaluasi Tingkat Kesulitan Ujian</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                  <div className="text-center">
                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-300">{Math.round(avgDifficulty)}%</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">Rata-rata Jawaban Benar</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-lg font-bold text-green-600 dark:text-green-300">{difficultyStats['Sangat Mudah'] + difficultyStats['Mudah']}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">Soal Mudah</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-lg font-bold text-red-600 dark:text-red-300">{difficultyStats['Sulit'] + difficultyStats['Sangat Sulit'] + difficultyStats['Ekstrem Sulit']}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">Soal Sulit</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                                  {Object.entries(difficultyStats).map(([level, count]) => (
                                    <div key={level} className="text-center p-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded">
                                      <div className="font-medium text-gray-900 dark:text-white">{count}</div>
                                      <div className="text-gray-600 dark:text-gray-300">{level}</div>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-3 p-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded text-xs">
                                  <span className="font-medium text-gray-900 dark:text-white">💡 Rekomendasi: </span>
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {avgDifficulty >= 70
                                      ? 'Ujian terlalu mudah. Pertimbangkan menambah soal yang lebih menantang.'
                                      : avgDifficulty >= 50
                                      ? 'Tingkat kesulitan ujian sudah seimbang dan sesuai.'
                                      : 'Ujian cukup sulit. Pertimbangkan review materi atau soal yang lebih mudah.'}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                        {exam.questionAnalysis.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Analisis Soal & Tingkat Kesulitan</h4>
                            <div className="space-y-4">
                              {exam.questionAnalysis.slice(0, 10).map((question, index) => (
                                <div key={question.questionId} className="bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-4">
                                  {/* Question Header */}
                                  <div className="flex justify-between items-start mb-3">
                                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Soal #{index + 1}</h5>
                                    <div className="flex gap-2">
                                      <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border
                                          ${
                                            question.difficultyColor === 'green'
                                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border-green-200 dark:border-green-700'
                                              : question.difficultyColor === 'emerald'
                                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-700'
                                              : question.difficultyColor === 'blue'
                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-700'
                                              : question.difficultyColor === 'orange'
                                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100 border-orange-200 dark:border-orange-700'
                                              : question.difficultyColor === 'red'
                                              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border-red-200 dark:border-red-700'
                                              : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 border-purple-200 dark:border-purple-700'
                                          }`}
                                      >
                                        {question.difficultyLevel}
                                      </span>
                                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-100 border border-gray-300 dark:border-slate-500">
                                        {question.correctPercentage}% benar
                                      </span>
                                    </div>
                                  </div>

                                  {/* Question Text */}
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{question.questionText}</p>

                                  {/* Statistics */}
                                  <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className="text-xs">
                                      <span className="text-gray-600 dark:text-gray-400">Jawaban Benar: </span>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {question.correctAnswers}/{question.totalAnswers}
                                      </span>
                                    </div>
                                    <div className="text-xs">
                                      <span className="text-gray-600 dark:text-gray-400">Kunci: </span>
                                      <span className="font-medium text-gray-900 dark:text-white">{question.correctAnswer}</span>
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                                      <span>Tingkat Kesulitan</span>
                                      <span>{question.difficultyDescription}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3 border dark:border-slate-500">
                                      <div
                                        className={`h-3 rounded-full transition-all duration-300 shadow-sm
                                          ${
                                            question.difficultyColor === 'green'
                                              ? 'bg-green-500 dark:bg-green-400'
                                              : question.difficultyColor === 'emerald'
                                              ? 'bg-emerald-500 dark:bg-emerald-400'
                                              : question.difficultyColor === 'blue'
                                              ? 'bg-blue-500 dark:bg-blue-400'
                                              : question.difficultyColor === 'orange'
                                              ? 'bg-orange-500 dark:bg-orange-400'
                                              : question.difficultyColor === 'red'
                                              ? 'bg-red-500 dark:bg-red-400'
                                              : 'bg-purple-500 dark:bg-purple-400'
                                          }`}
                                        style={{ width: `${question.correctPercentage}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Answer Distribution */}
                                  <div className="text-xs">
                                    <span className="text-gray-600 dark:text-gray-300 mb-2 block">Distribusi Jawaban:</span>
                                    <div className="grid grid-cols-4 gap-2">
                                      {['A', 'B', 'C', 'D'].map((option) => (
                                        <div
                                          key={option}
                                          className={`text-center p-2 rounded border ${
                                            question.correctAnswer === option
                                              ? 'bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600 text-green-800 dark:text-green-100'
                                              : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200'
                                          }`}
                                        >
                                          <div className="font-medium">{option}</div>
                                          <div className="text-xs">{question.answerDistribution[option as keyof typeof question.answerDistribution]}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {exam.questionAnalysis.length > 10 && (
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Menampilkan 10 dari {exam.questionAnalysis.length} soal</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* User Performance Report */}
              {reportType === 'user-performance' && userPerformanceData && (
                <div className="space-y-6">
                  {/* Chart - Top 10 Performers */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 10 Peserta Terbaik</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={userPerformanceData.userPerformance
                          .sort((a, b) => b.averageScore - a.averageScore)
                          .slice(0, 10)
                          .map((user) => ({
                            name: user.userName.length > 20 ? user.userName.substring(0, 20) + '...' : user.userName,
                            nilai: user.averageScore,
                            lulus: user.passRate,
                          }))}
                        layout="vertical"
                        margin={{ left: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '0.5rem',
                            color: '#f9fafb',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="nilai" fill="#3b82f6" name="Rata-rata Nilai" />
                        <Bar dataKey="lulus" fill="#10b981" name="Tingkat Kelulusan (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Table */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performa Peserta</h3>
                      <button
                        onClick={() => exportToExcel(userPerformanceData.userPerformance, 'performa-peserta')}
                        className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Ekspor Excel
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peserta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Ujian</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rata-rata Nilai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ujian Lulus</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tingkat Kelulusan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ujian Terakhir</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {userPerformanceData.userPerformance.map((user) => (
                            <tr key={user.userId}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.userName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.totalExams}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.averageScore >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {user.averageScore}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.passedExams}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.passRate >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {user.passRate}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(user.lastExamDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Trends Report */}
              {reportType === 'time-trends' && timeTrendsData && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tren Waktu (30 Hari Terakhir)</h3>
                      <button
                        onClick={() => exportToExcel(timeTrendsData.timeTrends, 'tren-waktu')}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Ekspor Excel
                      </button>
                    </div>

                    {timeTrendsData.timeTrends.length > 0 ? (
                      <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{timeTrendsData.timeTrends.reduce((sum, day) => sum + day.count, 0)}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-300">Total Ujian Selesai</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                              {Math.round(
                                timeTrendsData.timeTrends.filter((day) => day.count > 0).reduce((sum, day) => sum + day.avgScore, 0) / timeTrendsData.timeTrends.filter((day) => day.count > 0).length
                              ) || 0}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-300">Rata-rata Nilai</div>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                              {Math.round((timeTrendsData.timeTrends.reduce((sum, day) => sum + day.count, 0) / 30) * 10) / 10}
                            </div>
                            <div className="text-sm text-yellow-600 dark:text-yellow-300">Rata-rata Harian</div>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Charts Section */}
                  {timeTrendsData.timeTrends.length > 0 && (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Combined Chart - Exams Count and Average Score */}
                      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Trend Jumlah Ujian & Nilai Rata-rata</h4>
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={timeTrendsData.timeTrends.filter((day) => day.count > 0)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="formattedDate" stroke="#9ca3af" angle={-15} textAnchor="end" height={80} />
                            <YAxis yAxisId="left" stroke="#3b82f6" />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                                color: '#f9fafb',
                              }}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Jumlah Ujian" dot={{ r: 4 }} />
                            <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2} name="Rata-rata Nilai" dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Area Chart - Average Score Trend */}
                      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Trend Nilai (Area Chart)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={timeTrendsData.timeTrends.filter((day) => day.count > 0)}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="formattedDate" stroke="#9ca3af" angle={-15} textAnchor="end" height={80} />
                            <YAxis stroke="#9ca3af" domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                                color: '#f9fafb',
                              }}
                            />
                            <Area type="monotone" dataKey="avgScore" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" name="Rata-rata Nilai" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Trends Table */}
                  {timeTrendsData.timeTrends.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jumlah Ujian</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rata-rata Nilai</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {timeTrendsData.timeTrends.slice(-14).map((day) => (
                              <tr key={day.date}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{day.formattedDate}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(day.date)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{day.count}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {day.count > 0 ? (
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        day.avgScore >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}
                                    >
                                      {day.avgScore}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      day.count === 0
                                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                        : day.count >= 5
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}
                                  >
                                    {day.count === 0 ? 'Tidak Ada' : day.count >= 5 ? 'Aktif' : 'Normal'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
