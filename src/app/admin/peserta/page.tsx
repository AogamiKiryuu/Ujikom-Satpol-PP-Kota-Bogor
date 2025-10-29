'use client';

import { Plus, Search, Edit, Trash2, Eye, User, Calendar, Mail, Filter, Download } from 'lucide-react';
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
  const [filterGender, setFilterGender] = useState<'ALL' | 'LAKI_LAKI' | 'PEREMPUAN'>('ALL');
  const [showFilter, setShowFilter] = useState(false);

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
      birthDate: peserta.birthDate,
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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
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

  const handleExport = async () => {
    try {
      // Fetch all peserta data for export
      const response = await fetch('/api/admin/peserta?page=1&limit=10000', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        toast.error('Gagal mengambil data untuk export');
        return;
      }

      const data = await response.json();
      const pesertaData = data.data;

      // Prepare CSV content
      const headers = ['No', 'Nama', 'Email', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Ujian Diikuti', 'Bergabung'];
      const rows = pesertaData.map((p: Peserta, index: number) => [
        index + 1,
        p.name,
        p.email,
        p.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan',
        p.birthPlace,
        formatDate(p.birthDate),
        p._count.examResults,
        formatDate(p.createdAt),
      ]);

      // Create CSV content
      const csvContent = [headers.join(','), ...rows.map((row: (string | number)[]) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `peserta_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Data peserta berhasil diexport');
    } catch (error) {
      console.error('Error exporting peserta:', error);
      toast.error('Terjadi kesalahan saat export');
    }
  };

  const handleFilterChange = (gender: 'ALL' | 'LAKI_LAKI' | 'PEREMPUAN') => {
    setFilterGender(gender);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Peserta</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola data peserta ujian CBT</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Peserta
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter Berdasarkan Jenis Kelamin</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterGender === 'ALL'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => handleFilterChange('LAKI_LAKI')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterGender === 'LAKI_LAKI'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Laki-laki
                  </button>
                  <button
                    onClick={() => handleFilterChange('PEREMPUAN')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterGender === 'PEREMPUAN'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-600">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Peserta</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-600">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {peserta
                  .filter((p) => {
                    const created = new Date(p.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  })
                  .length.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-600">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laki-laki</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{peserta.filter((p) => p.gender === 'LAKI_LAKI').length.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-pink-600">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Perempuan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{peserta.filter((p) => p.gender === 'PEREMPUAN').length.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Peserta ({pagination.total})</h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 w-full bg-gray-100 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
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
                {peserta
                  .filter((person) => filterGender === 'ALL' || person.gender === filterGender)
                  .map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{person.name.charAt(0).toUpperCase()}</span>
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {person._count.examResults.toLocaleString('id-ID')} ujian
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(person.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(person)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(person)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(person)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Hapus"
                          >
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
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Menampilkan {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} dari {pagination.total} peserta
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Halaman {currentPage} dari {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay dark:modal-overlay.dark">
          <div className="modal-content dark:modal-content.dark modal-elevated max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password {modalType === 'edit' && '(kosongkan jika tidak ingin mengubah)'}</label>
                  <input
                    type="password"
                    required={modalType === 'create'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'LAKI_LAKI' | 'PEREMPUAN' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempat Lahir *</label>
                  <input
                    type="text"
                    required
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </form>
            )}

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {modalType === 'view' ? 'Tutup' : 'Batal'}
              </button>
              {modalType !== 'view' && (
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors">
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
