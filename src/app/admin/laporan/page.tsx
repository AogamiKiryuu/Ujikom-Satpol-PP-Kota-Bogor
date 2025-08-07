import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminLaporanPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/admin/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Laporan & Analisis</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Laporan dan Analisis</h2>
            <p className="text-gray-600 dark:text-gray-300">Halaman ini akan berisi laporan hasil ujian, statistik peserta, analisis soal, dan export laporan.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
