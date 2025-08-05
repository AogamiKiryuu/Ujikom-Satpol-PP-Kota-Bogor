import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password wajib diisi'),
    gender: z.enum(['LAKI_LAKI', 'PEREMPUAN'], {
      message: 'Jenis kelamin wajib dipilih',
    }),
    birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
    birthDate: z.string().nonempty('Tanggal lahir wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
