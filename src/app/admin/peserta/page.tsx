'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, User, Calendar, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Peserta {
  id: string;
  name: string;
  email: string;
  gender: 'LAKI_LAKI' | 'PEREMPUAN';
  birthDate: string;
  birthPlace: string;
  createdAt: string;
  _count: {
    examResults: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PesertaFormData {
  name: string;
  email: string;
  password?: string;
  gender: 'LAKI_LAKI' | 'PEREMPUAN';
  birthDate: string;
  birthPlace: string;
}

export default function AdminPesertaPage() {
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  const [formData, setFormData] = useState<PesertaFormData>({
    name: '',
    email: '',
    password: '',
    gender: 'LAKI_LAKI',
    birthDate: '',
    birthPlace: '',
  });

  const fetchPeserta = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/peserta?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPeserta(data.data);
        setPagination(data.pagination);
      } else {
        toast.error('Gagal memuat data peserta');
      }
    } catch (error) {
      console.error('Error fetching peserta:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPeserta(1, searchQuery);
  };

  const handleCreate = () => {
    setModalType('create');
    setFormData({
      name: '',
      email: '',
      password: '',
      gender: 'LAKI_LAKI',
      birthDate: '',
      birthPlace: '',
    });
    setShowModal(true);
  };

  const handleEdit = (peserta: Peserta) => {
    setModalType('edit');
    setSelectedPeserta(peserta);
    setFormData({
      name: peserta.name,
      email: peserta.email,
      password: '',
      gender: peserta.gender,
      birthDate: peserta.birthDate.split('T')[0],
      birthPlace: peserta.birthPlace,
    });
    setShowModal(true);
  };

  const handleView = (peserta: Peserta) => {
    setModalType('view');
    setSelectedPeserta(peserta);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = modalType === 'create' ? '/api/admin/peserta' : `/api/admin/peserta/${selectedPeserta?.id}`;

      const method = modalType === 'create' ? 'POST' : 'PUT';

      const submitData = { ...formData };
      if (modalType === 'edit' && !formData.password?.trim()) {
        delete submitData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(`Peserta berhasil ${modalType === 'create' ? 'ditambahkan' : 'diperbarui'}`);
        setShowModal(false);
        fetchPeserta(currentPage, searchQuery);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving peserta:', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    }
  };

  const handleDelete = async (peserta: Peserta) => {
    if (!confirm(`Yakin ingin menghapus peserta ${peserta.name}?`)) return;

    try {
      const response = await fetch(`/api/admin/peserta/${peserta.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Peserta berhasil dihapus');
        fetchPeserta(currentPage, searchQuery);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menghapus peserta');
      }
    } catch (error) {
      console.error('Error deleting peserta:', error);
      toast.error('Terjadi kesalahan saat menghapus');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Manajemen Peserta</h1>
            </div>
            <button onClick={handleCreate} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Peserta
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari peserta berdasarkan nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Cari
              </button>
            </form>
          </div>

          {/* Peserta Table */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Daftar Peserta ({pagination.total})</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat data...</p>
              </div>
            ) : peserta.length === 0 ? (
              <div className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">Tidak ada peserta ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peserta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Info Personal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ujian Diikuti</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bergabung</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {peserta.map((person) => (
                      <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium">{person.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {person.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{person.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {person.birthPlace}, {formatDate(person.birthDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{person._count.examResults} ujian</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(person.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button onClick={() => handleView(person)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Lihat Detail">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(person)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(person)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Menampilkan {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} dari {pagination.total} peserta
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
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {modalType === 'create' && 'Tambah Peserta Baru'}
                {modalType === 'edit' && 'Edit Peserta'}
                {modalType === 'view' && 'Detail Peserta'}
              </h3>
            </div>

            {modalType === 'view' && selectedPeserta ? (
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPeserta.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPeserta.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Kelamin</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPeserta.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tempat, Tanggal Lahir</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedPeserta.birthPlace}, {formatDate(selectedPeserta.birthDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ujian Diikuti</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPeserta._count.examResults} ujian</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bergabung</label>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedPeserta.createdAt)}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password {modalType === 'edit' && '(kosongkan jika tidak ingin mengubah)'}</label>
                  <input
                    type="password"
                    required={modalType === 'create'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'LAKI_LAKI' | 'PEREMPUAN' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempat Lahir *</label>
                  <input
                    type="text"
                    required
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
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
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {modalType === 'create' ? 'Tambah' : 'Simpan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
