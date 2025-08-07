import RegisterForm from '@/components/register/RegisterForm';
import Logo from '@/components/register/Logo';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4 py-10 transition-colors duration-300">
      <div className="w-full max-w-5xl rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Logo Section - Single Glass Layer */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-white/10 backdrop-blur-md">
          <Logo />
        </div>

        {/* Form Section - Solid Based on Theme */}
        <div className="w-full md:w-1/2 p-8 bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Buat Akun Baru</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
