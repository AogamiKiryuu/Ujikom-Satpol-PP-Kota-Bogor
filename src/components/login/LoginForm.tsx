'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginSchemaType } from '@/lib/schemas/loginSchema';
import { useState } from 'react';
import { toast } from 'react-toastify';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <InputField<LoginSchemaType>
        label="Email"
        type="email"
        id="email"
        placeholder="contoh@email.com"
        register={register}
        error={errors.email?.message}
      />

      <PasswordField<LoginSchemaType>
        label="Password"
        id="password"
        register={register}
        error={errors.password?.message}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex justify-center items-center"
      >
        {isLoading ? <LoadingSpinner /> : 'Masuk'}
      </button>
    </form>
  );
}
