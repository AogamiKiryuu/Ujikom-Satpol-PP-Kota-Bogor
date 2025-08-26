'use client';

import LoginForm from '@/components/login/LoginForm';
import Logo from '@/components/ui/Logo';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="max-w-md w-full space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center">
            <Logo size="lg" className="justify-center mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Selamat Datang!</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Masuk ke akun untuk memulai ujian</p>
          </motion.div>

          {/* Login Card with Glass Morphism */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="relative">
            {/* Glass Card */}
            <div className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>

              <div className="relative">
                <LoginForm />

                {/* Links */}
                <div className="mt-6 text-center space-y-2">
                  <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                    Belum punya akun? Daftar disini
                  </Link>
                  <br />
                  <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xs transition-colors">
                    ← Kembali ke beranda
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }} className="text-center text-xs text-gray-500 dark:text-gray-400">
            © 2025 Satuan Polisi Pamong Praja Kota Bogor
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
