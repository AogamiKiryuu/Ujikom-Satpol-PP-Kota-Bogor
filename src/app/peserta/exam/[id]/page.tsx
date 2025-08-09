'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Clock, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  userAnswer: string | null;
}

interface ExamData {
  exam: {
    id: string;
    title: string;
    subject: string;
    duration: number;
    description: string;
  };
  examResult: {
    id: string;
    startTime: string;
    remainingMinutes: number;
  };
  questions: Question[];
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchExamData = useCallback(async () => {
    try {
      const response = await fetch(`/api/peserta/exam/${examId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data: ExamData = await response.json();
        setExamData(data);
        setTimeRemaining(data.examResult.remainingMinutes * 60);
        
        // Initialize answers from existing user answers
        const initialAnswers: { [questionId: string]: string } = {};
        data.questions.forEach(question => {
          if (question.userAnswer) {
            initialAnswers[question.id] = question.userAnswer;
          }
        });
        setAnswers(initialAnswers);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memuat data ujian');
        router.push('/peserta/dashboard');
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast.error('Terjadi kesalahan saat memuat ujian');
      router.push('/peserta/dashboard');
    } finally {
      setLoading(false);
    }
  }, [examId, router]);

  const handleSubmitExam = useCallback(async () => {
    if (submitting) return;

    const unansweredQuestions = examData?.questions.filter((q) => !answers[q.id]).length || 0;

    if (unansweredQuestions > 0) {
      const confirm = window.confirm(`Masih ada ${unansweredQuestions} soal yang belum dijawab. Yakin ingin menyelesaikan ujian?`);
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/peserta/exam/${examId}/submit`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Ujian selesai! Skor Anda: ${result.score}`);
        // Redirect to result page instead of dashboard
        setTimeout(() => {
          router.push(`/peserta/exam/${examId}/result`);
        }, 1500);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyelesaikan ujian');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Terjadi kesalahan saat menyelesaikan ujian');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, examData?.questions, answers, examId, router]);

  const handleAutoSubmit = useCallback(async () => {
    toast.warning('Waktu ujian telah habis. Ujian akan diselesaikan otomatis.');
    await handleSubmitExam();
  }, [handleSubmitExam]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  useEffect(() => {
    if (examData && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examData, timeRemaining, handleAutoSubmit]);

  const saveAnswer = async (questionId: string, selectedOption: string) => {
    try {
      await fetch(`/api/peserta/exam/${examId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questionId,
          selectedOption,
        }),
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleAnswerChange = (questionId: string, selectedOption: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));

    // Auto-save answer
    saveAnswer(questionId, selectedOption);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 300) return 'text-green-600'; // > 5 minutes
    if (timeRemaining > 60) return 'text-yellow-600'; // > 1 minute
    return 'text-red-600'; // <= 1 minute
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (examData && currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat ujian...</p>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Ujian tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = examData.questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">{examData.exam.title}</h1>
              <span className="text-sm text-gray-500">({examData.exam.subject})</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  {answeredQuestions}/{totalQuestions} Terjawab
                </span>
              </div>
              <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Navigasi Soal</h3>
              <div className="grid grid-cols-5 gap-2">
                {examData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                      index === currentQuestionIndex ? 'bg-blue-600 text-white' : answers[examData.questions[index].id] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Soal {currentQuestionIndex + 1} dari {totalQuestions}
                  </h2>
                </div>
                <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { option: 'A', text: currentQuestion.optionA },
                    { option: 'B', text: currentQuestion.optionB },
                    { option: 'C', text: currentQuestion.optionC },
                    { option: 'D', text: currentQuestion.optionD },
                  ].map(({ option, text }) => (
                    <label
                      key={option}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerChange(currentQuestion.id, option)}
                        className="mt-1 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{option}.</span>
                        <span className="ml-2 text-gray-700">{text}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex space-x-3">
                  {currentQuestionIndex === totalQuestions - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Menyelesaikan...' : 'Selesaikan Ujian'}
                    </button>
                  ) : (
                    <button onClick={goToNextQuestion} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      <span>Selanjutnya</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
