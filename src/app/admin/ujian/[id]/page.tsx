'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import ExamParticipants from '@/components/admin/ExamParticipants';

interface ExamDetail {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  hasSubmitted: boolean;
  score: number | null;
  submittedAt: string | null;
}

interface ParticipantsData {
  participants: Participant[];
  total: number;
  submitted: number;
  notSubmitted: number;
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  const [examId, setExamId] = useState<string>('');
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [participantsData, setParticipantsData] = useState<ParticipantsData>({
    participants: [],
    total: 0,
    submitted: 0,
    notSubmitted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'participants'>('info');

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setExamId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  const fetchExamDetail = async () => {
    if (!examId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/exams/${examId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setExam(data);
      } else {
        toast.error('Gagal memuat detail ujian');
        router.push('/admin/ujian');
      }
    } catch (error) {
      console.error('Error fetching exam detail:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    if (!examId) return;
    try {
      const response = await fetch(`/api/admin/exams/${examId}/participants`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setParticipantsData(data);
      } else {
        toast.error('Gagal memuat data peserta');
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Terjadi kesalahan saat memuat data peserta');
    }
  };

  useEffect(() => {
    if (examId) {
      fetchExamDetail();
      fetchParticipants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const handleRefresh = () => {
    fetchParticipants();
  };

  const getStatusBadge = (exam: ExamDetail) => {
    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);

    if (!exam.isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
          <AlertCircle className="w-4 h-4 mr-1" />
          Tidak Aktif
        </span>
      );
    }

    if (now < startDate) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          <Clock className="w-4 h-4 mr-1" />
          Akan Datang
        </span>
      );
    }

    if (now >= startDate && now <= endDate) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          <CheckCircle className="w-4 h-4 mr-1" />
          Aktif
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
        Selesai
      </span>
    );
  };

  if (loading || !exam) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/admin/ujian" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Kembali
                </Link>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Detail Ujian</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/ujian" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Detail Ujian</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Exam Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h2>
              <p className="text-gray-600 dark:text-gray-400">{exam.subject}</p>
              {exam.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{exam.description}</p>}
            </div>
            {getStatusBadge(exam)}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Durasi</span>
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{exam.duration} menit</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Jumlah Soal</span>
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{exam.totalQuestions} soal</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Nilai Lulus</span>
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{exam.passingScore}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Peserta</span>
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{participantsData.total}</p>
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Mulai:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(exam.startDate).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Selesai:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(exam.endDate).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex gap-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Informasi Ujian
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'participants'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Peserta Ujian ({participantsData.total})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Detail</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Ujian</label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">{exam.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dibuat Pada</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(exam.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status Aktif</label>
                <p className="text-gray-900 dark:text-white">{exam.isActive ? 'Ya' : 'Tidak'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && examId && (
          <ExamParticipants examId={examId} participants={participantsData.participants} onRefresh={handleRefresh} />
        )}
      </main>
    </div>
  );
}
