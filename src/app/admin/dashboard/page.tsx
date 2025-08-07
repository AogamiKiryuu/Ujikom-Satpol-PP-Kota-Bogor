'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Settings, LogOut, BarChart3, Clock } from 'lucide-react';

interface DashboardStats {
  totalPeserta: number;
  totalExams: number;
  activeExams: number;
  completedExams: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPeserta: 0,
    totalExams: 0,
    activeExams: 0,
    completedExams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard stats
    const fetchStats = async () => {
      try {
        // In real app, this would be an API call
        setTimeout(() => {
          setStats({
            totalPeserta: 156,
            totalExams: 24,
            activeExams: 3,
            completedExams: 21,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Berhasil logout');
        router.push('/');
      } else {
        toast.error('Gagal logout');
      }
    } catch {
      toast.error('Terjadi kesalahan saat logout');
    }
  };

  const menuItems = [
    { icon: Users, label: 'Manajemen Peserta', href: '/admin/peserta', color: 'bg-blue-500' },
    { icon: BookOpen, label: 'Manajemen Soal', href: '/admin/soal', color: 'bg-green-500' },
    { icon: FileText, label: 'Manajemen Ujian', href: '/admin/ujian', color: 'bg-purple-500' },
    { icon: BarChart3, label: 'Laporan & Analisis', href: '/admin/laporan', color: 'bg-orange-500' },
    { icon: Settings, label: 'Pengaturan Sistem', href: '/admin/settings', color: 'bg-gray-500' },
  ];

  const statCards = [
    { title: 'Total Peserta', value: stats.totalPeserta, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Total Ujian', value: stats.totalExams, icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Ujian Aktif', value: stats.activeExams, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Ujian Selesai', value: stats.completedExams, icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Selamat datang, Admin</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.title}</dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{loading ? '...' : stat.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Menu Utama</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(item.href)}
                    className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${item.color} mr-4`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">{item.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Aktivitas Terbaru</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-white">15 peserta baru mendaftar hari ini</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 jam yang lalu</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-white">Ujian &quot;Matematika Dasar&quot; telah selesai</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5 jam yang lalu</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-white">Bank soal &quot;Fisika&quot; telah diperbarui</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1 hari yang lalu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
