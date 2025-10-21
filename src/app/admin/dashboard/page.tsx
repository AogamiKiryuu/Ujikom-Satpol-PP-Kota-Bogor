'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Users, FileText, Clock, BarChart3, Calendar, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  charts: {
    scoreDistribution: Array<{ range: string; count: number }>;
    examStatus: Array<{ status: string; count: number; color: string }>;
    examsBySubject: Array<{ subject: string; count: number }>;
  };
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
    charts: {
      scoreDistribution: [],
      examStatus: [],
      examsBySubject: [],
    },
  });
  // Initial page load state (controls skeletons)
  const [loading, setLoading] = useState(true);
  // Subsequent background refresh state (no skeletons, avoids flicker)
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async (mode: 'initial' | 'refresh' = 'initial') => {
      try {
        if (mode === 'initial') {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const statsResponse = await fetch('/api/admin/dashboard/stats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
          setLastUpdated(Date.now());
        } else if (statsResponse.status === 401) {
          toast.error('Sesi telah berakhir. Silakan login kembali.');
          router.push('/login');
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard data');
        toast.error('Gagal memuat data dashboard');
      } finally {
        if (mode === 'initial') {
          setLoading(false);
        }
        setRefreshing(false);
      }
    };

    // First load with skeletons
    fetchStats('initial');

    // Auto refresh every 30 seconds (only when tab is visible)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchStats('refresh');
      }
    }, 30000);

    // Also refresh once when window gains focus after being hidden
    const onFocus = () => fetchStats('refresh');
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [router]);

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // No quick actions here; left menu is in the sidebar

  const statCards = [
    { title: 'Total Peserta', value: stats.totalPeserta, icon: Users, color: 'bg-blue-600' },
    { title: 'Total Ujian', value: stats.totalExams, icon: FileText, color: 'bg-green-600' },
    { title: 'Ujian Aktif', value: stats.activeExams, icon: Clock, color: 'bg-orange-600' },
    { title: 'Ujian Selesai', value: stats.completedExams, icon: BarChart3, color: 'bg-purple-600' },
  ];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg mb-4">Gagal memuat data dashboard</div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Banner */}
          <div className="mb-6">
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-sm border border-indigo-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Selamat Datang di Dashboard Admin</h2>
                <p className="text-sm text-indigo-100">Kelola sistem CBT dengan mudah dan efisien</p>
              </div>
              <div className="hidden sm:block">
                <div className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {loading ? (
                        <span className="inline-block w-16 h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      ) : typeof stat.value === 'number' ? (
                        stat.value.toLocaleString('id-ID')
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aktivitas Terbaru</h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    {refreshing ? (
                      <span className="inline-flex items-center gap-1">
                        <RefreshCcw className="w-3 h-3 animate-spin" /> Menyegarkan
                      </span>
                    ) : lastUpdated ? (
                      <span>Terakhir diperbarui {new Date(lastUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    ) : null}
                  </div>
                </div>
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Score Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Distribusi Nilai Ujian</h3>
                {loading ? (
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.charts.scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="range" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                          color: '#f9fafb',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Jumlah Peserta" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Exam Status Chart */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status Ujian</h3>
                {loading ? (
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : stats.charts.examStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={stats.charts.examStatus} cx="50%" cy="50%" labelLine={true} label outerRadius={100} fill="#8884d8" dataKey="count" nameKey="status">
                        {stats.charts.examStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                          color: '#f9fafb',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada data ujian</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exams by Subject Chart */}
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ujian Berdasarkan Mata Pelajaran</h3>
                {loading ? (
                  <div className="h-80 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : stats.charts.examsBySubject.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={stats.charts.examsBySubject} cx="50%" cy="50%" labelLine={true} label outerRadius={120} fill="#8884d8" dataKey="count" nameKey="subject">
                        {stats.charts.examsBySubject.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                          color: '#f9fafb',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada data ujian</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
