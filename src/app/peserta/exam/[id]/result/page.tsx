'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Clock, BookOpen, ArrowLeft, Trophy, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface QuestionResult {
  number: number;
  question: Question;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

interface ExamResultData {
  exam: {
    id: string;
    title: string;
    subject: string;
    description: string;
    passingScore: number;
    duration: number;
  };
  result: {
    id: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    percentage: number;
    passed: boolean;
    startTime: string;
    endTime: string;
    duration: number;
  };
  questions: QuestionResult[];
}

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [resultData, setResultData] = useState<ExamResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const fetchExamResult = useCallback(async () => {
    try {
      const response = await fetch(`/api/peserta/exam/${examId}/result`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data: ExamResultData = await response.json();
        setResultData(data);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memuat hasil ujian');
        router.push('/peserta/dashboard');
      }
    } catch (error) {
      console.error('Error fetching exam result:', error);
      toast.error('Terjadi kesalahan saat memuat hasil ujian');
      router.push('/peserta/dashboard');
    } finally {
      setLoading(false);
    }
  }, [examId, router]);

  useEffect(() => {
    fetchExamResult();
  }, [fetchExamResult]);

  const getOptionText = (question: Question, option: string) => {
    switch (option) {
      case 'A':
        return question.optionA;
      case 'B':
        return question.optionB;
      case 'C':
        return question.optionC;
      case 'D':
        return question.optionD;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat hasil ujian...</p>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Hasil ujian tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const { exam, result, questions } = resultData;

  const pct = Math.round(result.percentage ?? 0);
  const primaryColor = result.passed ? '#10b981' /* emerald-500 */ : '#ef4444'; /* red-500 */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/peserta/dashboard')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </button>
        </div>

        {/* Banner */}
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-sm border border-indigo-700 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Hasil Ujian</h1>
              <p className="text-indigo-100">
                {exam.title} • {exam.subject}
              </p>
            </div>
            <div>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-white/20 ${result.passed ? 'bg-white/10' : 'bg-white/10'}`}>
                {result.passed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    LULUS
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    TIDAK LULUS
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score donut */}
            <div className="flex items-center justify-center">
              <div className="relative w-44 h-44">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${primaryColor} ${pct * 3.6}deg, #e5e7eb 0deg)`,
                  }}
                />
                <div className="absolute inset-3 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{pct}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Skor Akhir</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-600">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Jawaban Benar</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{result.correctAnswers.toLocaleString('id-ID')}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-600">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Jawaban Salah</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{result.wrongAnswers.toLocaleString('id-ID')}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-600">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Durasi</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{result.duration} menit</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-600">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span className="text-gray-500 dark:text-gray-400">Waktu Mulai:</span>
              <div className="text-gray-900 dark:text-white">{new Date(result.startTime).toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span className="text-gray-500 dark:text-gray-400">Waktu Selesai:</span>
              <div className="text-gray-900 dark:text-white">{new Date(result.endTime).toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span className="text-gray-500 dark:text-gray-400">Total Soal:</span>
              <div className="text-gray-900 dark:text-white">{result.totalQuestions.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span className="text-gray-500 dark:text-gray-400">Nilai Minimal Lulus:</span>
              <div className="text-gray-900 dark:text-white">{exam.passingScore}</div>
            </div>
          </div>
        </div>

        {/* Toggle Details */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            <BookOpen className="w-5 h-5" />
            {showDetails ? 'Sembunyikan' : 'Tampilkan'} Detail Jawaban
          </button>
        </div>

        {/* Question Details */}
        {showDetails && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Detail Jawaban</h3>
            <div className="space-y-5">
              {questions.map((q) => (
                <div
                  key={q.number}
                  className={`rounded-lg p-4 border ${
                    q.isCorrect ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Soal {q.number}</h4>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${q.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {q.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{q.isCorrect ? 'Benar' : 'Salah'}</span>
                    </div>
                  </div>

                  <div className="text-gray-700 dark:text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: q.question.questionText }} />

                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div
                        key={option}
                        className={`p-2 rounded border ${
                          option === q.correctAnswer
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600'
                            : option === q.selectedAnswer && !q.isCorrect
                            ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600'
                            : 'bg-gray-50 dark:bg-gray-700 border-transparent'
                        }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{option}. </span>
                        <span className="text-gray-700 dark:text-gray-300">{getOptionText(q.question, option)}</span>
                        {option === q.correctAnswer && <span className="ml-2 text-green-600 dark:text-green-400 font-medium">(Jawaban Benar)</span>}
                        {option === q.selectedAnswer && option !== q.correctAnswer && <span className="ml-2 text-red-600 dark:text-red-400 font-medium">(Jawaban Anda)</span>}
                      </div>
                    ))}
                  </div>

                  {!q.selectedAnswer && <div className="mt-2 text-orange-600 dark:text-orange-400 font-medium">Tidak dijawab</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
