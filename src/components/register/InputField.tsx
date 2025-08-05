type InputFieldProps = {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputField({ label, error, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block mb-1 text-gray-700 dark:text-gray-300">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
