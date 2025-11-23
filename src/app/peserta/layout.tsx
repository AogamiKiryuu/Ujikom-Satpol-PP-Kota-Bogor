'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';

export default function PesertaLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Hide top bar only on the active exam taking page (/peserta/exam/[id])
  const hideTopBar = Boolean(pathname && /^\/peserta\/exam\/[^/]+$/.test(pathname));

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        toast.success('Berhasil logout');
        // Clear client-side auth hints
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
        } catch {}
        setTimeout(() => router.replace('/'), 600);
      } else {
        toast.error('Gagal logout');
      }
    } catch {
      toast.error('Terjadi kesalahan saat logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top bar for peserta (hidden during active exam) */}
      {!hideTopBar && (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative">
                <Image
                  src="/logo.png"
                  alt="CBT Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <Link
                href="/peserta/dashboard"
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Area Peserta
              </Link>
            </div>
            <button onClick={handleLogout} className="pressable inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm">
              Logout
            </button>
          </div>
        </header>
      )}

      {children}
    </div>
  );
}
