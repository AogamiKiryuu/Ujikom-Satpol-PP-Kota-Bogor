'use client';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, AlertCircle, LogOut, Calendar, Trophy } from 'lucide-react';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Small delay to ensure cookies are properly set
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch user info first to check authentication
        const userRes = await fetch('/api/auth/me', { 
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserInfo(userData.user);
        } else {
          // If user info fails, likely auth issue - but wait a bit before redirect
          console.warn('Authentication failed, status:', userRes.status);
          
          // Try one more time after a short delay
          await new Promise(resolve => setTimeout(resolve, 500));
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
        const [statsRes, examsRes] = await Promise.all([
          fetch('/api/peserta/stats', { credentials: 'include' }), 
          fetch('/api/exams', { credentials: 'include' })
        ]);

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

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        // Clear localStorage as well if used
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');

        toast.success('Berhasil logout');

        // Small delay to show toast, then redirect
        setTimeout(() => {
          window.location.replace('/'); // Hard redirect to clear all state
        }, 1000);
      } else {
        toast.error('Gagal logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Terjadi kesalahan saat logout');
    }
  };

  const handleStartExam = async (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    try {
      // Start the exam session
      const response = await fetch(`/api/peserta/exam/${examId}/start`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success(`Memulai ujian: ${exam.title}`);
        // Redirect to exam page
        window.location.href = `/peserta/exam/${examId}`;
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
    { title: 'Ujian Tersedia', value: stats.availableExams, icon: BookOpen, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Ujian Selesai', value: stats.completedExams, icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Ujian Berlangsung', value: stats.ongoingExams, icon: Clock, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
    { title: 'Rata-rata Nilai', value: `${stats.averageScore}%`, icon: Trophy, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Peserta</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Selamat datang, {userInfo?.name || 'Peserta'}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.title}</dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{loading ? '...' : stat.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exam List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Daftar Ujian</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">Memuat data...</div>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 dark:text-gray-400">Belum ada ujian tersedia</div>
                  </div>
                ) : (
                  exams.map((exam) => (
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
                          {exam.score && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">Nilai: {exam.score}/100</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {exam.status === 'available' && (
                            <button onClick={() => handleStartExam(exam.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                              Mulai Ujian
                            </button>
                          )}
                          {exam.status === 'ongoing' && (
                            <button onClick={() => handleResumeExam(exam.id)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                              Lanjutkan
                            </button>
                          )}
                          {exam.status === 'completed' && (
                            <button onClick={() => handleViewResult(exam.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
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
    </div>
  );
}
