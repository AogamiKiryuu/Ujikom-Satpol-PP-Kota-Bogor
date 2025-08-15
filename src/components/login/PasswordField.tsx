import { useState } from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface PasswordFieldProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
}

export default function PasswordField<T extends FieldValues>({ label, id, register, error }: PasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={String(id)} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative group">
        <input
          id={String(id)}
          type={showPassword ? 'text' : 'password'}
          placeholder="Masukkan password"
          {...register(id)}
          className={`w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none transition-all duration-300 backdrop-blur-sm
            ${error 
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 text-gray-900 dark:text-white' 
              : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/70 focus:border-blue-500 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white'
            }
            placeholder:text-gray-500 dark:placeholder:text-gray-400
            focus:bg-white dark:focus:bg-gray-800/90
          `}
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
        >
          {showPassword ? (
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <span className="text-sm text-red-500 dark:text-red-400 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}
