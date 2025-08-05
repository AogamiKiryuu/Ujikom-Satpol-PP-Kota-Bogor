'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { format, parse } from 'date-fns';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Minimal 6 karakter'),
    gender: z.enum(['LAKI_LAKI', 'PEREMPUAN'], 'Pilih jenis kelamin'),
    birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
    birthDate: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const formattedDate = parse(data.birthDate, 'yyyy-MM-dd', new Date());
      const formattedBirthDate = format(formattedDate, 'MM/dd/yyyy');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, birthDate: formattedBirthDate }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Registrasi gagal');
      }

      toast.success('Registrasi berhasil! Mengarahkan ke login...', { autoClose: 2000 });

      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField label="Nama" {...register('name')} error={errors.name?.message} />
      <InputField label="Email" type="email" {...register('email')} error={errors.email?.message} />

      <PasswordField
        label="Password"
        {...register('password')}
        error={errors.password?.message}
        visible={showPassword}
        toggleVisibility={() => setShowPassword((prev) => !prev)}
      />

      <PasswordField
        label="Konfirmasi Password"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
        visible={showConfirm}
        toggleVisibility={() => setShowConfirm((prev) => !prev)}
      />

      <InputField label="Tempat Lahir" {...register('birthPlace')} error={errors.birthPlace?.message} />
      <InputField label="Tanggal Lahir" type="date" {...register('birthDate')} error={errors.birthDate?.message} />

      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300">Jenis Kelamin</label>
        <select {...register('gender')} className="input dark:bg-gray-700 dark:text-white w-full rounded-lg border px-3 py-2">
          <option value="">-- Pilih --</option>
          <option value="LAKI_LAKI">Laki-laki</option>
          <option value="PEREMPUAN">Perempuan</option>
        </select>
        {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
        Daftar
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
        Sudah punya akun?{' '}
        <a href="/login" className="text-cyan-300 hover:underline">
          <u><b>Masuk di sini</b></u>
        </a>
      </p>
    </form>
  );
}

// Reusable Input Field
const InputField = ({ label, error, ...props }: any) => (
  <div>
    <label className="block mb-1 text-gray-700 dark:text-gray-300">{label}</label>
    <input {...props} className="input dark:bg-gray-700 dark:text-white w-full rounded-lg border px-3 py-2" />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

// Password Field with Toggle Eye Icon
const PasswordField = ({ label, error, visible, toggleVisibility, ...props }: any) => (
  <div>
    <label className="block mb-1 text-gray-700 dark:text-gray-300">{label}</label>
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className="input dark:bg-gray-700 dark:text-white w-full rounded-lg border px-3 py-2 pr-10"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-300"
      >
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);
