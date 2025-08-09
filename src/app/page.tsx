'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { BookOpen, Users, Trophy, Clock, Shield, CheckCircle, ArrowRight, Star, TrendingUp, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = document.cookie.includes('token=') || localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    setIsLoggedIn(!!token);
    setUserRole(role);
  }, []);

  const getDashboardLink = () => {
    if (userRole === 'ADMIN') return '/admin/dashboard';
    if (userRole === 'PESERTA') return '/peserta/dashboard';
    return '/login';
  };
  const features = [
    {
      icon: BookOpen,
      title: 'Ujian Digital',
      description: 'Sistem ujian berbasis komputer yang modern dan efisien',
    },
    {
      icon: Shield,
      title: 'Keamanan Tinggi',
      description: 'Data peserta dan hasil ujian terjamin keamanannya',
    },
    {
      icon: Clock,
      title: 'Real-time Monitoring',
      description: 'Pantau progress ujian secara langsung dan akurat',
    },
    {
      icon: Trophy,
      title: 'Hasil Instant',
      description: 'Dapatkan hasil ujian langsung setelah selesai mengerjakan',
    },
  ];

  const stats = [
    { number: '500+', label: 'Peserta Aktif', icon: Users },
    { number: '50+', label: 'Ujian Tersedia', icon: BookOpen },
    { number: '95%', label: 'Tingkat Kepuasan', icon: Star },
    { number: '99.9%', label: 'Uptime System', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href={getDashboardLink()} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                      });
                      if (res.ok) {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userRole');
                        setIsLoggedIn(false);
                        setUserRole(null);
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Logout error:', error);
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">CBT Exam System</h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">Satuan Polisi Pamong Praja Kota Bogor</p>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">Platform ujian digital yang modern, aman, dan efisien untuk meningkatkan kualitas assessmen dan evaluasi</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              href="/register"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
            >
              <span>Mulai Ujian Sekarang</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
            >
              Masuk ke Akun
            </Link>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Real-time Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>User Friendly</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="text-center p-6 backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/20"
              >
                <IconComponent className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Fitur Unggulan</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Sistem CBT yang dilengkapi dengan teknologi terdepan untuk pengalaman ujian yang optimal</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                className="group p-6 backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/20 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="text-center backdrop-blur-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl border border-white/20 dark:border-gray-700/20 p-12"
        >
          <Zap className="w-16 h-16 mx-auto mb-6 text-blue-600" />
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Siap Memulai Ujian?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Bergabunglah dengan ribuan peserta lainnya dan rasakan pengalaman ujian digital yang modern</p>
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="sm" />
            <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">© 2025 Satuan Polisi Pamong Praja Kota Bogor. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
