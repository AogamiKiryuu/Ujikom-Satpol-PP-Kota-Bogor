type InputFieldProps = {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputField({ label, error, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block mb-1 text-gray-200">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 backdrop-blur-sm text-white bg-gray-800/70 border-gray-600 focus:border-blue-500 hover:border-gray-500 placeholder:text-gray-400 focus:bg-gray-800/90"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
