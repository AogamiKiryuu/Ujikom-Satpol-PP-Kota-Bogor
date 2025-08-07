'use client';

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginSchemaType } from '@/lib/schemas/loginSchema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import InputField from './InputField';
import PasswordField from './PasswordField';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are included
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Login gagal');
      }

      toast.success('Berhasil masuk');
      
      // Get JWT token from response (we'll add this to the API response)
      const userRole = responseData.role;
      console.log('User role:', userRole);
      
      const redirectPath = userRole === 'ADMIN' ? '/admin/dashboard' : '/peserta/dashboard';
      console.log('Redirecting to:', redirectPath);
      
      // Store token in localStorage as fallback
      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
        localStorage.setItem('userRole', userRole);
      }
      
      // Multiple redirect strategies
      setTimeout(() => {
        // Strategy 1: Direct redirect
        window.location.replace(redirectPath);
      }, 200);
      
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login gagal';
      toast.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <InputField<LoginSchemaType>
          label="Email"
          type="email"
          id="email"
          placeholder="contoh@email.com"
          register={register}
          error={errors.email?.message}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <PasswordField<LoginSchemaType>
          label="Password"
          id="password"
          register={register}
          error={errors.password?.message}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl flex justify-center items-center font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <LoadingSpinner />
              <span>Memverifikasi...</span>
            </motion.div>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Masuk
            </motion.span>
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
