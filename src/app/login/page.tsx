import LoginForm from "@/components/login/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Masuk ke akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sistem CBT Exam
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <LoginForm />
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
