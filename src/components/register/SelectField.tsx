type SelectFieldProps = {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectField({ label, error, options, ...props }: SelectFieldProps) {
  return (
    <div>
      <label className="block mb-1 text-gray-700 dark:text-gray-300">{label}</label>
      <select
        {...props}
        className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600"
      >
        <option value="">-- Pilih --</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
