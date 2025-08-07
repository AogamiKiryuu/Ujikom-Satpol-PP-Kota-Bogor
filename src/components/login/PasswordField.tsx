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
    <div className="flex flex-col space-y-1">
      <label htmlFor={String(id)} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={String(id)}
          type={showPassword ? 'text' : 'password'}
          {...register(id)}
          className={`border rounded-md px-3 py-2 w-full outline-none dark:bg-gray-800 dark:border-gray-700 ${error ? 'border-red-500' : ''}`}
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm">
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
