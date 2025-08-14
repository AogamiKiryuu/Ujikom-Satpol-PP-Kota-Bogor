type SelectFieldProps = {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectField({ label, error, options, ...props }: SelectFieldProps) {
  return (
    <div>
      <label className="block mb-1 text-gray-200">{label}</label>
      <select
        {...props}
        className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 backdrop-blur-sm text-white bg-gray-800/70 border-gray-600 focus:border-blue-500 hover:border-gray-500"
      >
        <option value="" className="bg-gray-800 text-white">
          -- Pilih --
        </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value} className="bg-gray-800 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
