'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, Download, Users, Award, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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
    correctAnswer: string;
    totalAnswers: number;
    correctAnswers: number;
    difficultyRate: number;
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

  const exportToCSV = (data: RecentResult[] | ExamPerformance[] | UserPerformance[] | TimeTrend[], filename: string) => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    let csvContent = '';

    // Handle different data types differently
    if (filename.includes('recent-results')) {
      const recentData = data as RecentResult[];
      csvContent = 'ID,Nama Peserta,Judul Ujian,Mata Pelajaran,Nilai,Tanggal\n';
      csvContent += recentData.map((item) => `${item.id},"${item.userName}","${item.examTitle}","${item.subject}",${item.score},"${formatDateTime(item.createdAt)}"`).join('\n');
    } else if (filename.includes('performa-ujian')) {
      const examData = data as ExamPerformance[];
      csvContent = 'ID Ujian,Judul Ujian,Mata Pelajaran,Total Peserta,Rata-rata Nilai,Tingkat Kelulusan (%)\n';
      csvContent += examData.map((item) => `${item.examId},"${item.examTitle}","${item.subject}",${item.totalParticipants},${item.averageScore},${item.passRate}`).join('\n');
    } else if (filename.includes('performa-peserta')) {
      const userData = data as UserPerformance[];
      csvContent = 'ID Peserta,Nama Peserta,Email,Total Ujian,Rata-rata Nilai,Ujian Lulus,Tingkat Kelulusan (%),Ujian Terakhir\n';
      csvContent += userData
        .map((item) => `${item.userId},"${item.userName}","${item.email}",${item.totalExams},${item.averageScore},${item.passedExams},${item.passRate},"${formatDate(item.lastExamDate)}"`)
        .join('\n');
    } else if (filename.includes('tren-waktu')) {
      const trendData = data as TimeTrend[];
      csvContent = 'Tanggal,Jumlah Ujian,Rata-rata Nilai,Tanggal Format\n';
      csvContent += trendData.map((item) => `"${item.date}",${item.count},${item.avgScore},"${item.formattedDate}"`).join('\n');
    } else {
      // Fallback to generic CSV export
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
      const headers = Object.keys(flatData[0]).join(',');
      const rows = flatData
        .map((row) =>
          Object.values(row)
            .map((value) => (typeof value === 'string' && value.includes(',') ? `"${value}"` : value))
            .join(',')
        )
        .join('\n');
      csvContent = `${headers}\n${rows}`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

                  {/* Recent Results */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Hasil Ujian Terbaru</h3>
                      <button
                        onClick={() => exportToCSV(overviewData.recentResults, 'hasil-ujian-terbaru')}
                        className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Ekspor
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
                            onClick={() => exportToCSV([exam], `performa-ujian-${exam.examTitle.replace(/\s+/g, '-')}`)}
                            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Ekspor
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

                        {exam.questionAnalysis.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Analisis Soal</h4>
                            <div className="space-y-2">
                              {exam.questionAnalysis.slice(0, 5).map((question, index) => (
                                <div key={question.questionId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      Soal #{index + 1}: {question.questionText}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Jawaban: {question.correctAnswer} | {question.correctAnswers}/{question.totalAnswers} benar
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        question.difficultyRate >= 70
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          : question.difficultyRate >= 50
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}
                                    >
                                      {question.difficultyRate}% benar
                                    </span>
                                  </div>
                                </div>
                              ))}
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
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performa Peserta</h3>
                    <button
                      onClick={() => exportToCSV(userPerformanceData.userPerformance, 'performa-peserta')}
                      className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Ekspor
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
              )}

              {/* Time Trends Report */}
              {reportType === 'time-trends' && timeTrendsData && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tren Waktu (30 Hari Terakhir)</h3>
                    <button
                      onClick={() => exportToCSV(timeTrendsData.timeTrends, 'tren-waktu')}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Ekspor CSV
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

                      {/* Trends Table */}
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
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">Belum ada data ujian dalam 30 hari terakhir</div>
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
