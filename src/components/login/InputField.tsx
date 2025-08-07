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
    <div className="flex flex-col space-y-1">
      <label htmlFor={String(id)} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={String(id)}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        className={`border rounded-md px-3 py-2 outline-none dark:bg-gray-800 dark:border-gray-700 ${error ? 'border-red-500' : ''}`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
