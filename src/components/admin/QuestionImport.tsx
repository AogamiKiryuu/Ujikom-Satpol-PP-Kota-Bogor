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

interface QuestionImportProps {
  onImportSuccess: () => void;
}

export default function QuestionImport({ onImportSuccess }: QuestionImportProps) {
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchExams();
    } else {
      // Reset selection when modal is closed
      setSelectedExam(null);
      setDragActive(false);
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
      } else {
        if (result.details) {
          // Show first few errors in detail
          const errorPreview = result.details.slice(0, 3).join('\n');
          const remainingErrors = result.details.length > 3 ? `\n... dan ${result.details.length - 3} error lainnya` : '';
          toast.error(`Import gagal:\n${errorPreview}${remainingErrors}`);
        } else {
          toast.error(result.error || 'Import gagal');
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Terjadi kesalahan saat upload file');
    } finally {
      setUploading(false);
    }
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
      <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
        <Upload className="w-4 h-4" />
        Import Soal
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Import Soal dari CSV/Excel</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Instructions and Upload */}
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="flex items-center gap-2 font-medium text-blue-800 dark:text-blue-300 mb-3">
                      <FileText className="w-5 h-5" />
                      Format CSV yang Diperlukan:
                    </h4>
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <strong>examTitle</strong>: Nama ujian
                        </div>
                        <div>
                          <strong>examSubject</strong>: Subject ujian
                        </div>
                        <div>
                          <strong>questionText</strong>: Teks pertanyaan
                        </div>
                        <div>
                          <strong>optionA,B,C,D</strong>: Pilihan jawaban
                        </div>
                        <div>
                          <strong>correctAnswer</strong>: Jawaban benar (A/B/C/D)
                        </div>
                        <div>
                          <strong>points</strong>: Poin soal (opsional)
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={downloadTemplate}
                    disabled={!selectedExam}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                      selectedExam ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    {selectedExam ? `Download Template untuk "${selectedExam.title}"` : 'Pilih Ujian Dulu untuk Download Template'}
                  </button>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input type="file" id="file-upload" accept=".csv,.xlsx,.xls" onChange={handleFileInputChange} disabled={uploading} className="hidden" />
                    <div className="space-y-4">
                      <Upload className={`w-12 h-12 mx-auto ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div>
                        <label
                          htmlFor="file-upload"
                          className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                            uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          <Upload className="w-5 h-5" />
                          {uploading ? 'Mengupload...' : 'Pilih File CSV/Excel'}
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                          atau <strong>drag & drop</strong> file di sini
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Format yang didukung: .csv, .xlsx, .xls
                        <br />
                        Maksimal ukuran file: 10MB
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="flex items-center gap-2 font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      Catatan Penting:
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Nama ujian di CSV harus sama persis dengan yang ada di sistem</li>
                      <li>• Jika ada subject, pastikan juga sama persis</li>
                      <li>• Soal akan ditambahkan ke ujian yang sudah ada</li>
                      <li>• Total soal ujian akan diupdate otomatis</li>
                      <li>• Gunakan tanda kutip (&quot;) untuk teks yang mengandung koma</li>
                    </ul>
                  </div>
                </div>

                {/* Right Column: Available Exams */}
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-4">
                      🎯 Ujian yang Tersedia ({exams.length}):
                      {selectedExam && (
                        <span className="ml-2 text-sm font-normal">
                          - Dipilih: <strong>{selectedExam.title}</strong>
                        </span>
                      )}
                    </h4>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {exams.length > 0 ? (
                        exams.map((exam) => (
                          <div
                            key={exam.id}
                            onClick={() => setSelectedExam(exam)}
                            className={`cursor-pointer p-4 rounded-lg border transition-all hover:shadow-md ${
                              selectedExam?.id === exam.id
                                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 ring-2 ring-blue-500 ring-opacity-50'
                                : 'bg-white dark:bg-gray-700 border-green-200 dark:border-green-700 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white text-sm">{exam.title}</div>
                                <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">Subject: {exam.subject}</div>
                                <div className="flex items-center gap-4 mt-2 text-xs">
                                  <span className="text-gray-500 dark:text-gray-400">{exam.totalQuestions} soal</span>
                                  <span
                                    className={`px-2 py-1 rounded-full ${
                                      exam.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                    }`}
                                  >
                                    {exam.isActive ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                  {selectedExam?.id === exam.id && <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 font-medium">✓ Dipilih</span>}
                                </div>
                              </div>
                            </div>
                            {selectedExam?.id === exam.id && (
                              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  Template akan berisi contoh soal untuk ujian ini. Klik &quot;Download Template&quot; untuk mendapatkan file CSV.
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Belum ada ujian yang dibuat.
                            <br />
                            Buat ujian terlebih dahulu sebelum import soal.
                          </p>
                        </div>
                      )}
                    </div>
                    {exams.length > 0 && !selectedExam && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          💡 <strong>Klik salah satu ujian di atas</strong> untuk memilih ujian dan mengaktifkan tombol download template.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3">📋 Contoh Format CSV:</h4>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border text-xs font-mono overflow-x-auto">
                      <div className="text-gray-600 dark:text-gray-400">examTitle,examSubject,questionText,optionA,optionB,optionC,optionD,correctAnswer,points</div>
                      <div className="text-gray-800 dark:text-gray-200">
                        {selectedExam
                          ? `"${selectedExam.title}","${selectedExam.subject}","Apa ibukota Indonesia?","Jakarta","Bandung","Surabaya","Medan","A",1`
                          : '"Testing CBT","Umum","Apa ibukota Indonesia?","Jakarta","Bandung","Surabaya","Medan","A",1'}
                      </div>
                    </div>
                    {selectedExam && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                        ✓ Format ini akan otomatis diisi dalam template yang Anda download.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t">
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
    </>
  );
}
