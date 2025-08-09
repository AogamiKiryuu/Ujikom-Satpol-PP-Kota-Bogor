'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  BookOpen, 
  ArrowLeft,
  Trophy,
  AlertCircle 
} from 'lucide-react';

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
      case 'A': return question.optionA;
      case 'B': return question.optionB;
      case 'C': return question.optionC;
      case 'D': return question.optionD;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat hasil ujian...</p>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Hasil ujian tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const { exam, result, questions } = resultData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/peserta/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke Dashboard</span>
              </button>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Hasil Ujian</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Result Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {result.passed ? <Trophy className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h2>
            <p className="text-gray-600">{exam.subject}</p>
            <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold mt-4 ${
              result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {result.passed ? '✅ LULUS' : '❌ TIDAK LULUS'}
            </div>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{result.score}</div>
                <div className="text-sm text-gray-600">Skor Akhir</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{result.correctAnswers}</div>
                <div className="text-sm text-gray-600">Jawaban Benar</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-red-50 rounded-lg p-4">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{result.wrongAnswers}</div>
                <div className="text-sm text-gray-600">Jawaban Salah</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 rounded-lg p-4">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{result.duration}</div>
                <div className="text-sm text-gray-600">Menit</div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <strong>Waktu Mulai:</strong> {new Date(result.startTime).toLocaleString('id-ID')}
            </div>
            <div>
              <strong>Waktu Selesai:</strong> {new Date(result.endTime).toLocaleString('id-ID')}
            </div>
            <div>
              <strong>Total Soal:</strong> {result.totalQuestions}
            </div>
            <div>
              <strong>Nilai Minimal Lulus:</strong> {exam.passingScore}
            </div>
          </div>
        </div>

        {/* Toggle Details */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span>{showDetails ? 'Sembunyikan' : 'Tampilkan'} Detail Jawaban</span>
          </button>
        </div>

        {/* Question Details */}
        {showDetails && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Detail Jawaban</h3>
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.number} className={`border rounded-lg p-4 ${
                  q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Soal {q.number}</h4>
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      q.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {q.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{q.isCorrect ? 'Benar' : 'Salah'}</span>
                    </div>
                  </div>
                  
                  <div 
                    className="text-gray-700 mb-4"
                    dangerouslySetInnerHTML={{ __html: q.question.questionText }}
                  />
                  
                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div
                        key={option}
                        className={`p-2 rounded ${
                          option === q.correctAnswer
                            ? 'bg-green-100 border border-green-300'
                            : option === q.selectedAnswer && !q.isCorrect
                            ? 'bg-red-100 border border-red-300'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{option}. </span>
                        <span>{getOptionText(q.question, option)}</span>
                        {option === q.correctAnswer && (
                          <span className="ml-2 text-green-600 font-medium">(Jawaban Benar)</span>
                        )}
                        {option === q.selectedAnswer && option !== q.correctAnswer && (
                          <span className="ml-2 text-red-600 font-medium">(Jawaban Anda)</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {!q.selectedAnswer && (
                    <div className="mt-2 text-orange-600 font-medium">
                      Tidak dijawab
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
