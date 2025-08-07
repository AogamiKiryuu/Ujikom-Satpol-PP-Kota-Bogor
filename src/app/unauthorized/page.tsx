import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen text-center px-4">
      <div>
        <h1 className="text-4xl font-bold mb-4">403 - Akses Ditolak</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Kamu tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Login
          </Link>
          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
