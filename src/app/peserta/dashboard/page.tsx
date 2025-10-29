'use client';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, AlertCircle, Calendar, Trophy } from 'lucide-react';

interface PesertaStats {
  availableExams: number;
  completedExams: number;
  ongoingExams: number;
  totalScore: number;
  averageScore: number;
}

interface ExamItem {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: number;
  status: 'available' | 'ongoing' | 'completed';
  score?: number;
  deadline: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function PesertaDashboard() {
  const [stats, setStats] = useState<PesertaStats>({
    availableExams: 0,
    completedExams: 0,
    ongoingExams: 0,
    totalScore: 0,
    averageScore: 0,
  });
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'ongoing' | 'completed'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Small delay to ensure cookies are properly set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Fetch user info first to check authentication
        const userRes = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserInfo(userData.user);
        } else {
          // If user info fails, likely auth issue - but wait a bit before redirect
          console.warn('Authentication failed, status:', userRes.status);

          // Try one more time after a short delay
          await new Promise((resolve) => setTimeout(resolve, 500));
          const retryRes = await fetch('/api/auth/me', { credentials: 'include' });

          if (retryRes.ok) {
            const userData = await retryRes.json();
            setUserInfo(userData.user);
          } else {
            console.warn('Authentication failed after retry, redirecting to login');
            window.location.href = '/login';
            return;
          }
        }

        // Then fetch other data
        const [statsRes, examsRes] = await Promise.all([fetch('/api/peserta/stats', { credentials: 'include' }), fetch('/api/exams', { credentials: 'include' })]);

        if (statsRes.ok && examsRes.ok) {
          const statsData = await statsRes.json();
          const examsData = await examsRes.json();

          setStats(statsData);
          setExams(examsData);
        } else {
          toast.error('Gagal memuat data ujian');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartExam = (examId: string) => {
    setSelectedExamId(examId);
    setShowConfirmModal(true);
  };

  const handleConfirmStartExam = async () => {
    if (!selectedExamId) return;

    const exam = exams.find((e) => e.id === selectedExamId);
    if (!exam) return;

    try {
      setShowConfirmModal(false);
      // Start the exam session
      const response = await fetch(`/api/peserta/exam/${selectedExamId}/start`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success(`Memulai ujian: ${exam.title}`);
        // Redirect to exam page
        window.location.href = `/peserta/exam/${selectedExamId}`;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memulai ujian');
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      toast.error('Terjadi kesalahan saat memulai ujian');
    }
  };

  const handleResumeExam = async (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    toast.info(`Melanjutkan ujian: ${exam.title}`);
    // Redirect to exam page
    window.location.href = `/peserta/exam/${examId}`;
  };

  const handleViewResult = async (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    toast.info(`Melihat hasil ujian: ${exam.title}`);
    // Redirect to results page
    window.location.href = `/peserta/exam/${examId}/result`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'ongoing':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'completed':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'ongoing':
        return 'Sedang Berlangsung';
      case 'completed':
        return 'Selesai';
      default:
        return 'Unknown';
    }
  };

  const statCards = [
    { title: 'Ujian Tersedia', value: stats.availableExams, icon: BookOpen, bgColor: 'bg-emerald-600' },
    { title: 'Ujian Selesai', value: stats.completedExams, icon: CheckCircle, bgColor: 'bg-blue-600' },
    { title: 'Ujian Berlangsung', value: stats.ongoingExams, icon: Clock, bgColor: 'bg-orange-600' },
    { title: 'Rata-rata Nilai', value: `${stats.averageScore}%`, icon: Trophy, bgColor: 'bg-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Banner */}
          <div className="mb-6">
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-sm border border-indigo-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Halo, {userInfo?.name || 'Peserta'}</h2>
                <p className="text-sm text-indigo-100">Selamat datang di Dashboard Peserta</p>
              </div>
              <div className="hidden sm:block">
                <div className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {loading ? (
                        <span className="inline-block w-16 h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      ) : typeof stat.value === 'number' ? (
                        stat.value.toLocaleString('id-ID')
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exam List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Ujian</h3>
                <div className="flex items-center gap-2">
                  {(['all', 'available', 'ongoing', 'completed'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        statusFilter === key
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {key === 'all' ? 'Semua' : key === 'available' ? 'Tersedia' : key === 'ongoing' ? 'Berlangsung' : 'Selesai'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : exams.filter((e) => (statusFilter === 'all' ? true : e.status === statusFilter)).length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 dark:text-gray-400">Tidak ada ujian untuk filter ini</div>
                  </div>
                ) : (
                  exams
                    .filter((e) => (statusFilter === 'all' ? true : e.status === statusFilter))
                    .map((exam) => (
                      <div key={exam.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{exam.title}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.status)}`}>{getStatusText(exam.status)}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" />
                                {exam.subject}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {exam.duration} menit
                              </div>
                              <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {exam.questions} soal
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Deadline: {new Date(exam.deadline).toLocaleDateString('id-ID')}
                              </div>
                            </div>
                            {typeof exam.score === 'number' && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">Nilai: {exam.score}/100</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {exam.status === 'available' && (
                              <button
                                onClick={() => handleStartExam(exam.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow"
                              >
                                Mulai Ujian
                              </button>
                            )}
                            {exam.status === 'ongoing' && (
                              <button
                                onClick={() => handleResumeExam(exam.id)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow"
                              >
                                Lanjutkan
                              </button>
                            )}
                            {exam.status === 'completed' && (
                              <button onClick={() => handleViewResult(exam.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow">
                                Lihat Hasil
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedExamId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 pointer-events-auto border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Konfirmasi Mulai Ujian</h2>
            </div>
            <div className="px-6 py-5">
              {exams.find((e) => e.id === selectedExamId) && (
                <>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">Anda akan memulai ujian:</p>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 rounded-lg p-4 mb-5 border border-blue-200 dark:border-blue-800/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{exams.find((e) => e.id === selectedExamId)?.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Mata Pelajaran:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{exams.find((e) => e.id === selectedExamId)?.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jumlah Soal:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{exams.find((e) => e.id === selectedExamId)?.questions} soal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durasi:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{exams.find((e) => e.id === selectedExamId)?.duration} menit</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-5 border border-amber-200 dark:border-amber-800/50">
                    <p className="text-sm text-amber-900 dark:text-amber-200">
                      <span className="font-semibold">⚠️ Perhatian:</span> Pastikan koneksi internet stabil. Waktu ujian akan terus berjalan meskipun Anda meninggalkan halaman.
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-3 justify-end rounded-b-xl">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button onClick={handleConfirmStartExam} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg">
                Mulai Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
