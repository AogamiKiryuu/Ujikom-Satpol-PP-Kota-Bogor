'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Download, Upload, X, FileText, AlertCircle } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  isActive: boolean;
}

interface PreviewQuestion {
  examTitle: string;
  examSubject: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  points: number;
  rowIndex: number;
  errors?: string[];
}

interface QuestionImportProps {
  onImportSuccess: () => void;
}

export default function QuestionImport({ onImportSuccess }: QuestionImportProps) {
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewQuestion[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    if (showModal) {
      fetchExams();
    } else {
      // Reset selection when modal is closed
      setSelectedExam(null);
      setDragActive(false);
      setShowPreview(false);
      setPreviewData([]);
      setPreviewFile(null);
    }
  }, [showModal]);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exams/list', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data.exams);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // First, send for preview/parsing
      const response = await fetch('/api/admin/questions/preview', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPreviewData(result.questions || []);
        setPreviewFile(file);
        setShowPreview(true);
        toast.success(`File berhasil diparsing! Ditemukan ${result.questions?.length || 0} soal untuk di-preview.`);
      } else {
        if (result.details) {
          // Show first few errors in detail
          const errorPreview = result.details.slice(0, 3).join('\n');
          const remainingErrors = result.details.length > 3 ? `\n... dan ${result.details.length - 3} error lainnya` : '';
          toast.error(`Parsing gagal:\n${errorPreview}${remainingErrors}`);
        } else {
          toast.error(result.error || 'Parsing file gagal');
        }
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Terjadi kesalahan saat parsing file');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewFile) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', previewFile);

      const response = await fetch('/api/admin/questions/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Import berhasil! ${result.imported} soal ditambahkan ke ${result.examsUpdated} ujian.`);
        onImportSuccess();
        setShowModal(false);
        setShowPreview(false);
        setPreviewData([]);
        setPreviewFile(null);
      } else {
        if (result.details) {
          const errorPreview = result.details.slice(0, 3).join('\n');
          const remainingErrors = result.details.length > 3 ? `\n... dan ${result.details.length - 3} error lainnya` : '';
          toast.error(`Import gagal:\n${errorPreview}${remainingErrors}`);
        } else {
          toast.error(result.error || 'Import gagal');
        }
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Terjadi kesalahan saat import file');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewData([]);
    setPreviewFile(null);
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        await handleFileUpload(file);
      } else {
        toast.error('File harus berformat CSV atau Excel (.csv, .xlsx, .xls)');
      }
    }
  };

  const downloadTemplate = () => {
    if (!selectedExam) {
      toast.error('Pilih ujian terlebih dahulu sebelum download template!');
      return;
    }

    // Create template with selected exam data
    let csvContent = 'examTitle,examSubject,questionText,optionA,optionB,optionC,optionD,correctAnswer,points\n';

    // Add example questions with selected exam data
    csvContent += `"${selectedExam.title}","${selectedExam.subject}","Contoh pertanyaan untuk ${selectedExam.title}?","Pilihan A","Pilihan B","Pilihan C","Pilihan D","A",1\n`;
    csvContent += `"${selectedExam.title}","${selectedExam.subject}","Pertanyaan kedua untuk ${selectedExam.title}?","Opsi 1","Opsi 2","Opsi 3","Opsi 4","B",1\n`;
    csvContent += `"${selectedExam.title}","${selectedExam.subject}","Soal ketiga untuk ${selectedExam.title}?","Jawaban A","Jawaban B","Jawaban C","Jawaban D","C",1\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${selectedExam.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success(`Template CSV untuk "${selectedExam.title}" berhasil didownload!`);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import Soal
      </button>

      {/* Import Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-auto">
            <div className="p-3 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Import Soal dari File</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Petunjuk Import:</h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>Pilih ujian yang akan ditambahkan soal</li>
                  <li>Download template CSV untuk mendapatkan format yang benar</li>
                  <li>Isi data soal sesuai format template</li>
                  <li>Upload file CSV/Excel yang sudah diisi</li>
                  <li>Review preview sebelum konfirmasi import</li>
                </ol>
              </div>

              {/* Exam Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Ujian Target
                </label>
                <select
                  value={selectedExam?.id || ''}
                  onChange={(e) => {
                    const exam = exams.find(ex => ex.id === e.target.value);
                    setSelectedExam(exam || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Pilih Ujian --</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title} - {exam.subject} ({exam.totalQuestions} soal)
                    </option>
                  ))}
                </select>
              </div>

              {/* Download Template */}
              <div className="mb-6">
                <button
                  onClick={downloadTemplate}
                  disabled={!selectedExam}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template CSV
                </button>
                {selectedExam && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Template untuk: <strong>{selectedExam.title}</strong>
                  </p>
                )}
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload File Soal
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag & drop file CSV/Excel di sini, atau klik untuk pilih file
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    Format yang didukung: .csv, .xlsx, .xls
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Processing...' : 'Pilih File'}
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-6 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-hidden">
            <div className="p-3 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Preview Import Soal ({previewData.length} soal)
                </h3>
                <button
                  onClick={handleCancelPreview}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Preview data yang akan diimport. Periksa kembali sebelum melanjutkan.
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-auto max-h-[50vh] sm:max-h-96 border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ujian
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pertanyaan
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                        Pilihan
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Jawaban Benar
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {previewData.map((question, index) => (
                      <tr key={index} className={question.errors?.length ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {question.rowIndex}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium truncate">{question.examTitle}</div>
                            <div className="text-gray-500 dark:text-gray-400 truncate">{question.examSubject}</div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white max-w-[150px] sm:max-w-xs">
                          <div className="truncate" title={question.questionText}>
                            {question.questionText}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          <div className="space-y-1">
                            <div>A: {question.optionA}</div>
                            <div>B: {question.optionB}</div>
                            <div>C: {question.optionC}</div>
                            <div>D: {question.optionD}</div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {question.correctAnswer}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {question.errors?.length ? (
                            <div className="space-y-1">
                              <span className="text-red-600 dark:text-red-400 font-medium">Error</span>
                              {question.errors.map((error, idx) => (
                                <div key={idx} className="text-xs text-red-500 dark:text-red-400">
                                  {error}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 font-medium">Valid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Total Soal: </span>
                    <span className="text-gray-600 dark:text-gray-400">{previewData.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-600 dark:text-green-400">Valid: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {previewData.filter(q => !q.errors?.length).length}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-red-600 dark:text-red-400">Error: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {previewData.filter(q => q.errors?.length).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleCancelPreview}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={uploading || previewData.filter(q => q.errors?.length).length > 0}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                  {uploading ? 'Importing...' : 'Konfirmasi Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
