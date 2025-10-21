'use client';

import RegisterForm from '@/components/register/RegisterForm';
import Logo from '@/components/ui/Logo';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  return (
      <div className="min-h-screen relative overflow-hidden">
      {/* Solid Background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <Logo size="lg" className="justify-center mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Buat Akun Baru
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Daftar untuk mengikuti ujian CBT
            </p>
          </motion.div>

          {/* Register Card with Glass Morphism */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            {/* Glass Card */}
            <div className="backdrop-blur-lg bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              
              <div className="relative">
                <RegisterForm />
                
                {/* Links */}
                <div className="mt-6 text-center space-y-2">
                  <br />
                  <Link 
                    href="/" 
                    className="text-gray-500 hover:text-gray-700 text-xs transition-colors"
                  >
                    ← Kembali ke beranda
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center text-xs text-gray-500"
          >
            © 2025 Satuan Polisi Pamong Praja Kota Bogor
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
