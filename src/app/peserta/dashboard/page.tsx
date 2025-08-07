'use client';

import { useRouter } from 'next/navigation';
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

export default function PesertaDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PesertaStats>({
    availableExams: 0,
    completedExams: 0,
    ongoingExams: 0,
    totalScore: 0,
    averageScore: 0,
  });
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchData = async () => {
      try {
        // In real app, this would be API calls
        setTimeout(() => {
          setStats({
            availableExams: 3,
            completedExams: 5,
            ongoingExams: 1,
            totalScore: 420,
            averageScore: 84,
          });

          setExams([
            {
              id: '1',
              title: 'Ujian Matematika Dasar',
              subject: 'Matematika',
              duration: 90,
              questions: 40,
              status: 'available',
              deadline: '2025-08-10',
            },
            {
              id: '2',
              title: 'Ujian Bahasa Indonesia',
              subject: 'Bahasa Indonesia',
              duration: 60,
              questions: 30,
              status: 'ongoing',
              deadline: '2025-08-08',
            },
            {
              id: '3',
              title: 'Ujian Fisika',
              subject: 'Fisika',
              duration: 120,
              questions: 50,
              status: 'completed',
              score: 88,
              deadline: '2025-08-05',
            },
            {
              id: '4',
              title: 'Ujian Kimia',
              subject: 'Kimia',
              duration: 100,
              questions: 45,
              status: 'completed',
              score: 92,
              deadline: '2025-08-03',
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Berhasil logout');
        router.push('/');
      } else {
        toast.error('Gagal logout');
      }
    } catch {
      toast.error('Terjadi kesalahan saat logout');
    }
  };

  const handleStartExam = (examId: string) => {
    // In real app, this would redirect to exam page
    toast.info(`Memulai ujian dengan ID: ${examId}`);
    // router.push(`/peserta/exam/${examId}`);
  };

  const handleResumeExam = (examId: string) => {
    // In real app, this would redirect to ongoing exam
    toast.info(`Melanjutkan ujian dengan ID: ${examId}`);
    // router.push(`/peserta/exam/${examId}/resume`);
  };

  const handleViewResult = (examId: string) => {
    // In real app, this would show exam results
    toast.info(`Melihat hasil ujian dengan ID: ${examId}`);
    // router.push(`/peserta/results/${examId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'ongoing':
        return 'text-orange-600 bg-orange-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
    { title: 'Ujian Tersedia', value: stats.availableExams, icon: BookOpen, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Ujian Selesai', value: stats.completedExams, icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Ujian Berlangsung', value: stats.ongoingExams, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Rata-rata Nilai', value: `${stats.averageScore}%`, icon: Trophy, color: 'text-purple-600', bgColor: 'bg-purple-50' },
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
              <span className="text-sm text-gray-600 dark:text-gray-300">Selamat datang, Peserta</span>
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
