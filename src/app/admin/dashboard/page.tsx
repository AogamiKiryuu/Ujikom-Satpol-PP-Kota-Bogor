'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Users, FileText, Clock, BarChart3, BookOpen, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface DashboardStats {
  totalPeserta: number;
  totalExams: number;
  activeExams: number;
  completedExams: number;
  todayRegistrations: number;
  averageScore: number;
  recentActivity: Array<{
    id: string;
    userName: string;
    examTitle: string;
    subject: string;
    score: number;
    completedAt: string;
  }>;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPeserta: 0,
    totalExams: 0,
    activeExams: 0,
    completedExams: 0,
    todayRegistrations: 0,
    averageScore: 0,
    recentActivity: [],
  });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both stats and user info in parallel
        const [statsResponse, userResponse] = await Promise.all([
          fetch('/api/admin/dashboard/stats', {
            method: 'GET',
            credentials: 'include',
          }),
          fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          }),
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } else if (statsResponse.status === 401) {
          toast.error('Sesi telah berakhir. Silakan login kembali.');
          router.push('/login');
        } else {
          throw new Error('Failed to fetch dashboard data');
        }

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserInfo(userData.user);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard data');
        toast.error('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        toast.success('Berhasil logout');
        setTimeout(() => {
          window.location.replace('/');
        }, 1000);
      } else {
        toast.error('Gagal logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading dashboard</div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              <span className="text-sm text-gray-600 dark:text-gray-300">Selamat datang, {userInfo?.name || 'Admin'}</span>
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
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {loading ? <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div> : stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Menu Utama</h3>
                <div className="grid grid-cols-1 gap-4">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(item.href)}
                      className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${item.color} mr-4`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Aktivitas Terbaru</h3>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded mb-2"></div>
                          <div className="bg-gray-200 dark:bg-gray-700 h-3 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : stats.recentActivity.length > 0 ? (
                    stats.recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <strong>{activity.userName}</strong> menyelesaikan ujian &quot;{activity.examTitle}&quot;
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Nilai: {activity.score}/100 • {formatDate(activity.completedAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Belum ada aktivitas terbaru</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendaftar Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.todayRegistrations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : `${stats.averageScore}%`}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
