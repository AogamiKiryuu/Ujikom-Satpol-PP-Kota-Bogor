import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface InputFieldProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  type: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  error?: string;
}

export default function InputField<T extends FieldValues>({ label, id, type, placeholder, register, error }: InputFieldProps<T>) {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={String(id)} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={String(id)}
          type={type}
          placeholder={placeholder}
          {...register(id)}
          className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 backdrop-blur-sm
            ${error 
              ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10 focus:border-red-500' 
              : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800'
            }
            hover:border-gray-300 dark:hover:border-gray-500
            placeholder:text-gray-400
          `}
        />
        {/* Focus ring */}
        <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none
          ${error ? '' : 'group-focus-within:ring-2 group-focus-within:ring-blue-500/20'}
        `}></div>
      </div>
      {error && (
        <span className="text-sm text-red-500 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}
