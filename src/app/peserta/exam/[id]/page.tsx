'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const autoSubmittedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);

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
        data.questions.forEach((question) => {
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

  const handleSubmitExam = useCallback(
    async (opts?: { force?: boolean }) => {
      if (submitting) return;

      const unansweredQuestions = examData?.questions.filter((q) => !answers[q.id]).length || 0;

      if (!opts?.force && unansweredQuestions > 0) {
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
    },
    [submitting, examData?.questions, answers, examId, router]
  );

  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    toast.warning('Waktu ujian telah habis. Ujian akan diselesaikan otomatis.');
    await handleSubmitExam({ force: true });
  }, [handleSubmitExam]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  // Countdown timer: avoid side-effects inside setState updater
  useEffect(() => {
    if (!examData) return;
    if (timeRemaining <= 0) return;

    // Start/restart interval
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [examData, timeRemaining]);

  // Trigger auto submit once when time hits 0
  useEffect(() => {
    if (examData && timeRemaining === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      handleAutoSubmit();
    }
  }, [timeRemaining, examData, handleAutoSubmit]);

  // Auto-scroll to active question on mobile navigation
  useEffect(() => {
    if (examData) {
      scrollToActiveQuestion(currentQuestionIndex);
    }
  }, [currentQuestionIndex, examData]);

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
    if (timeRemaining > 300) return 'text-green-600 dark:text-green-400'; // > 5 minutes
    if (timeRemaining > 60) return 'text-yellow-600 dark:text-yellow-400'; // > 1 minute
    return 'text-red-600 dark:text-red-400'; // <= 1 minute
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

  const scrollToActiveQuestion = (questionIndex: number) => {
    if (navScrollRef.current) {
      const buttonWidth = 48 + 8; // 12 * 4px (w-12) + 8px gap
      const scrollLeft = questionIndex * buttonWidth - navScrollRef.current.clientWidth / 2 + buttonWidth / 2;
      navScrollRef.current.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      });
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    scrollToActiveQuestion(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat ujian...</p>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Ujian tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const totalQuestions = examData.questions.length;

  // Safety check: ensure we have questions and valid index
  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Ujian ini belum memiliki soal</p>
          <button onClick={() => router.push('/peserta/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{examData.exam.title}</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">({examData.exam.subject})</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
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
        {/* Mobile Question Navigation Railway */}
        <div className="lg:hidden mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Navigasi Soal</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {answeredQuestions}/{totalQuestions} terjawab
              </span>
            </div>
            <div className="relative">
              <div ref={navScrollRef} className="question-navigation flex space-x-2 overflow-x-auto pb-3">
                {examData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`question-nav-item nav-no-select mobile-nav-button flex-shrink-0 w-12 h-12 rounded-lg text-sm font-medium transition-all duration-200 transform hover:shadow-lg cursor-pointer ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-200 dark:ring-blue-800'
                        : answers[examData.questions[index].id]
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-2 border-green-400 hover:scale-105 hover:bg-green-200 dark:hover:bg-green-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 border-2 border-transparent hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              {/* Progress Bar */}
              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out relative" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}>
                  <div className="absolute right-0 top-0 w-2 h-2.5 bg-blue-700 rounded-full transform translate-x-1"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Soal {currentQuestionIndex + 1}</span>
                <span>{totalQuestions} Total</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Question Navigation */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Navigasi Soal</h3>
              <div className="grid grid-cols-5 gap-2">
                {examData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded text-sm font-medium transition-all duration-200 transform hover:scale-110 hover:shadow-md cursor-pointer ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white ring-2 ring-blue-200 dark:ring-blue-800'
                        : answers[examData.questions[index].id]
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300'
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
            {!currentQuestion ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Soal tidak ditemukan</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Soal {currentQuestionIndex + 1} dari {totalQuestions}
                    </h2>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />
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
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
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
                          <span className="font-medium text-gray-900 dark:text-white">{option}.</span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{text}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="px-4 sm:px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  {/* Mobile Navigation */}
                  <div className="sm:hidden flex justify-between items-center">
                    <button
                      onClick={goToPreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="mobile-nav-button nav-no-select flex items-center justify-center w-12 h-12 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-full hover:bg-gray-50 dark:hover:bg-gray-500 hover:shadow-lg hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentQuestionIndex + 1} dari {totalQuestions}
                      </span>
                      {currentQuestionIndex === totalQuestions - 1 ? (
                        <button
                          onClick={() => handleSubmitExam()}
                          disabled={submitting}
                          className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                        >
                          {submitting ? 'Menyelesaikan...' : 'Selesaikan'}
                        </button>
                      ) : (
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div className="bg-blue-600 h-1 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={goToNextQuestion}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="mobile-nav-button nav-no-select flex items-center justify-center w-12 h-12 text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden sm:flex justify-between">
                    <button
                      onClick={goToPreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Sebelumnya</span>
                    </button>

                    <div className="flex space-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Soal {currentQuestionIndex + 1} dari {totalQuestions}
                      </span>
                    </div>

                    {currentQuestionIndex === totalQuestions - 1 ? (
                      <button
                        onClick={() => handleSubmitExam()}
                        disabled={submitting}
                        className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                      >
                        {submitting ? 'Menyelesaikan...' : 'Selesaikan Ujian'}
                      </button>
                    ) : (
                      <button
                        onClick={goToNextQuestion}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        <span>Selanjutnya</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
