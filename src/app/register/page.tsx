/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTheme } from "@/app/context/ThemeProvider";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
  birthPlace: z.string().min(1),
  birthDate: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"]
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const [message, setMessage] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();
    setMessage(result.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="flex flex-col md:flex-row max-w-4xl w-full shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800 transition-all">
        {/* Logo Area */}
        <div className="hidden md:flex items-center justify-center w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-600 p-8">
          <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain" />
        </div>

        {/* Form Area */}
        <div className="w-full md:w-1/2 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Form Registrasi</h1>
            <button onClick={toggleTheme} className="text-sm text-gray-500 dark:text-gray-300">
              Mode: {theme === "light" ? "🌞 Terang" : "🌙 Gelap"}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField label="Nama" {...register("name")} error={errors.name?.message} />
            <InputField label="Email" type="email" {...register("email")} error={errors.email?.message} />

            <PasswordField
              label="Password"
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              {...register("password")}
              error={errors.password?.message}
            />

            <PasswordField
              label="Konfirmasi Password"
              show={showConfirm}
              toggle={() => setShowConfirm(!showConfirm)}
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <InputField label="Tempat Lahir" {...register("birthPlace")} error={errors.birthPlace?.message} />
            <InputField label="Tanggal Lahir" type="date" {...register("birthDate")} error={errors.birthDate?.message} />

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Jenis Kelamin</label>
              <select {...register("gender")} className="input dark:bg-gray-700 dark:text-white w-full rounded-lg border px-3 py-2">
                <option value="">-- Pilih --</option>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
              Daftar
            </button>
            {message && <p className="text-center text-green-500 mt-2">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

// Sub Komponen Reusable
const InputField = ({ label, error, ...props }: any) => (
  <div>
    <label className="block mb-1 text-gray-700 dark:text-gray-300">{label}</label>
    <input {...props} className="input dark:bg-gray-700 dark:text-white w-full rounded-lg border px-3 py-2" />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const PasswordField = ({ label, show, toggle, error, ...props }: any) => (
  <div>
    <label className="block mb-1 text-gray-700 dark:text-gray-300">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        {...props}
        className="input dark:bg-gray-700 dark:text-white w-full rounded-lg border px-3 py-2 pr-10"
      />
      <span
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 cursor-pointer"
        onClick={toggle}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </span>
    </div>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);
