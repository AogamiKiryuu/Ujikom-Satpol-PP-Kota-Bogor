'use client';

import Link from 'next/link';
import { ArrowLeft, Settings, Save, Server, Database, Users, FileText, Shield, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  defaultExamDuration: number;
  defaultPassingScore: number;
  allowSelfRegistration: boolean;
  maxRetakeAttempts: number;
  emailNotifications: boolean;
  maintenanceMode: boolean;
}

interface SystemInfo {
  version: string;
  lastBackup: string;
  databaseStatus: string;
  storageUsed: string;
  uptime: string;
}

interface Statistics {
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  totalResults: number;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: '',
    siteDescription: '',
    defaultExamDuration: 60,
    defaultPassingScore: 70,
    allowSelfRegistration: true,
    maxRetakeAttempts: 3,
    emailNotifications: true,
    maintenanceMode: false,
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: '',
    lastBackup: '',
    databaseStatus: '',
    storageUsed: '',
    uptime: '',
  });
  const [statistics, setStatistics] = useState<Statistics>({
    totalUsers: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalResults: 0,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setSystemInfo(data.systemInfo);
        setStatistics(data.statistics);
      } else {
        toast.error('Gagal memuat pengaturan');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success('Pengaturan berhasil disimpan');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Pengaturan Sistem</h1>
            </div>
            <button onClick={handleSaveSettings} disabled={saving} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* System Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pengguna</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ujian</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalExams}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <Settings className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Soal</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalQuestions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Database className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hasil Ujian</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalResults}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Server className="w-5 h-5 mr-2" />
                Informasi Sistem
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Versi Sistem</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemInfo.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status Database</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{systemInfo.databaseStatus}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Penggunaan Storage</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemInfo.storageUsed}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemInfo.uptime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Backup Terakhir</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{new Date(systemInfo.lastBackup).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Site Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Pengaturan Situs
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Situs</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Situs</label>
                  <input
                    type="text"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exam Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Pengaturan Ujian
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durasi Default Ujian (menit)</label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={settings.defaultExamDuration}
                    onChange={(e) => handleInputChange('defaultExamDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai Kelulusan Default (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.defaultPassingScore}
                    onChange={(e) => handleInputChange('defaultPassingScore', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maksimal Percobaan Ulang</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={settings.maxRetakeAttempts}
                  onChange={(e) => handleInputChange('maxRetakeAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white max-w-xs"
                />
              </div>
            </div>
          </div>

          {/* User Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Pengaturan Pengguna
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Izinkan Pendaftaran Mandiri</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Peserta dapat mendaftar sendiri tanpa perlu admin</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    checked={settings.allowSelfRegistration}
                    onChange={(e) => handleInputChange('allowSelfRegistration', e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Pengaturan Notifikasi
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifikasi Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kirim notifikasi melalui email untuk aktivitas penting</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>

          {/* System Control */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Kontrol Sistem
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode Maintenance</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nonaktifkan sementara akses sistem untuk maintenance</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>

              {settings.maintenanceMode && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">⚠️ Mode maintenance aktif. Hanya admin yang dapat mengakses sistem.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
