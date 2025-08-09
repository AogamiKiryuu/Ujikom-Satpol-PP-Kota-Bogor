'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, Clock, Users, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Exam {
  id: string;
  title: string;
  subject: string;
  description?: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  questionsCount: number;
  participantsCount: number;
  status: 'upcoming' | 'active' | 'completed' | 'inactive';
}

interface ExamFormData {
  title: string;
  subject: string;
  description: string;
  duration: number;
  passingScore: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminUjianPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    subject: '',
    description: '',
    duration: 60,
    passingScore: 70,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const fetchExams = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/admin/exams?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data.data);
        setPagination(data.pagination);
      } else {
        toast.error('Gagal memuat data ujian');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams(currentPage, searchQuery, statusFilter);
  }, [currentPage, searchQuery, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchExams(1, searchQuery, statusFilter);
  };

  const handleCreate = () => {
    setModalType('create');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setFormData({
      title: '',
      subject: '',
      description: '',
      duration: 60,
      passingScore: 70,
      startDate: now.toISOString().slice(0, 16),
      endDate: tomorrow.toISOString().slice(0, 16),
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (exam: Exam) => {
    setModalType('edit');
    setSelectedExam(exam);
    setFormData({
      title: exam.title,
      subject: exam.subject,
      description: exam.description || '',
      duration: exam.duration,
      passingScore: exam.passingScore,
      startDate: new Date(exam.startDate).toISOString().slice(0, 16),
      endDate: new Date(exam.endDate).toISOString().slice(0, 16),
      isActive: exam.isActive,
    });
    setShowModal(true);
  };

  const handleView = (exam: Exam) => {
    setModalType('view');
    setSelectedExam(exam);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = modalType === 'create' ? '/api/admin/exams' : `/api/admin/exams/${selectedExam?.id}`;

      const method = modalType === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(`Ujian berhasil ${modalType === 'create' ? 'dibuat' : 'diperbarui'}`);
        setShowModal(false);
        fetchExams(currentPage, searchQuery, statusFilter);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    }
  };

  const handleDelete = async (exam: Exam) => {
    if (!confirm(`Yakin ingin menghapus ujian "${exam.title}"?`)) return;

    try {
      const response = await fetch(`/api/admin/exams/${exam.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Ujian berhasil dihapus');
        fetchExams(currentPage, searchQuery, statusFilter);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menghapus ujian');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Terjadi kesalahan saat menghapus');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktif
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Akan Datang
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Selesai
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Nonaktif
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Manajemen Ujian</h1>
            </div>
            <button onClick={handleCreate} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Buat Ujian
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari ujian berdasarkan judul atau mata pelajaran..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="upcoming">Akan Datang</option>
                    <option value="completed">Selesai</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
                <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Cari
                </button>
              </div>
            </form>
          </div>

          {/* Exams Grid */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat data...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Tidak ada ujian ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{exam.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exam.subject}</p>
                      </div>
                      <div className="ml-4">{getStatusBadge(exam.status)}</div>
                    </div>

                    {/* Description */}
                    {exam.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{exam.description}</p>}

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{exam.duration} menit</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{exam.participantsCount} peserta</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>{exam.questionsCount} soal</span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jadwal</div>
                      <div className="text-sm text-gray-900 dark:text-white">{formatDateTime(exam.startDate)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">s/d {formatDateTime(exam.endDate)}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(exam)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </button>
                      <button onClick={() => handleEdit(exam)} className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(exam)} className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Menampilkan {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} dari {pagination.total} ujian
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Halaman {currentPage} dari {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {modalType === 'create' && 'Buat Ujian Baru'}
                {modalType === 'edit' && 'Edit Ujian'}
                {modalType === 'view' && 'Detail Ujian'}
              </h3>
            </div>

            {modalType === 'view' && selectedExam ? (
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul Ujian</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedExam.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mata Pelajaran</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedExam.subject}</p>
                </div>
                {selectedExam.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedExam.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Durasi</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedExam.duration} menit</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nilai Lulus</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedExam.passingScore}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Soal</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedExam.totalQuestions} soal</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peserta</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedExam.participantsCount} peserta</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jadwal</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(selectedExam.startDate)} - {formatDateTime(selectedExam.endDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedExam.status)}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Ujian *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Masukkan judul ujian"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Masukkan mata pelajaran"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Deskripsi ujian (opsional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durasi (menit) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="480"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai Lulus (%) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Selesai *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Aktifkan ujian
                  </label>
                </div>
              </form>
            )}

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {modalType === 'view' ? 'Tutup' : 'Batal'}
              </button>
              {modalType !== 'view' && (
                <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  {modalType === 'create' ? 'Buat' : 'Simpan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
