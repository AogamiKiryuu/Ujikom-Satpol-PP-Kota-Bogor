'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Home, Users, BookOpen, FileText, BarChart3, Settings, LogOut, User, UserPlus, PlusCircle, Upload, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { toast } from 'react-toastify';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  // Notifications removed (not used)

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Manajemen Peserta', href: '/admin/peserta' },
    { icon: BookOpen, label: 'Manajemen Soal', href: '/admin/soal' },
    { icon: FileText, label: 'Manajemen Ujian', href: '/admin/ujian' },
    { icon: BarChart3, label: 'Laporan & Analisis', href: '/admin/laporan' },
    { icon: Settings, label: 'Pengaturan Sistem', href: '/admin/settings' },
  ];

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch (error) {
      console.error('Error loading sidebar state:', error);
    }
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUserInfo(userData.user);
        } else if (response.status === 401) {
          toast.error('Sesi telah berakhir. Silakan login kembali.');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [router]);

  // Persist collapsed state to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('adminSidebarCollapsed', String(sidebarCollapsed));
      } catch (error) {
        console.error('Error saving sidebar state:', error);
      }
    }
  }, [sidebarCollapsed, mounted]);

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

  const isActive = (href: string) => {
    // Highlight parent menu for nested routes as well
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative">
              <Image
                src="/logo.png"
                alt="CBT Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className={`text-lg font-bold text-gray-900 dark:text-white transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${sidebarCollapsed ? 'hidden' : ''}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-200">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userInfo?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo?.email || 'admin@cbt.com'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch
                    onClick={() => setSidebarOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    title={item.label}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-400'}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Collapse Toggle in Sidebar */}
          <div className="hidden lg:block mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? 'Tampilkan Sidebar' : 'Sembunyikan Sidebar'}
              className={`w-full flex items-center ${
                sidebarCollapsed ? 'justify-center' : ''
              } px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors`}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <>
                  <PanelLeftClose className="w-5 h-5 mr-3" />
                  <span>Sembunyikan Menu</span>
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-2 right-2">
          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center' : ''
            } px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
          >
            <LogOut className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </div>

  {/* Mobile sidebar overlay */}
  {sidebarOpen && <div className="modal-overlay dark:modal-overlay.dark z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title for Desktop */}
            <div className="hidden lg:flex items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {pathname
                  .split('/')
                  .pop()
                  ?.replace(/-/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Dashboard'}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex-1 mx-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <Link
                  href="/admin/ujian"
                  prefetch
                  title="Buat Ujian"
                  className="pressable inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Buat Ujian
                </Link>
                <Link
                  href="/admin/peserta"
                  prefetch
                  title="Kelola / Tambah Peserta"
                  className="pressable inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Peserta
                </Link>
                <Link
                  href="/admin/soal"
                  prefetch
                  title="Kelola / Import Soal"
                  className="pressable inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Soal
                </Link>
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center">
              {/* Current time */}
              <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
