import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={180} height={38} priority />
        
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-4">Sistem CBT Exam</h1>
          <p className="text-lg mb-6">Selamat datang di sistem Computer Based Test</p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/login"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          >
            Masuk ke Sistem
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
          >
            Daftar Akun
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          © 2025 CBT Exam System
        </div>
      </footer>
    </div>
  );
}
