'use client';

import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import { ReactNode } from 'react';
import { Users, BookOpen, FileText, Settings, LogOut, BarChart3, Home } from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

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
    { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Manajemen Peserta', href: '/admin/peserta' },
    { icon: BookOpen, label: 'Manajemen Soal', href: '/admin/soal' },
    { icon: FileText, label: 'Manajemen Ujian', href: '/admin/ujian' },
    { icon: BarChart3, label: 'Laporan & Analisis', href: '/admin/laporan' },
    { icon: Settings, label: 'Pengaturan Sistem', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel - CBT Exam</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                ))}
              </nav>
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

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto py-2 space-x-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
