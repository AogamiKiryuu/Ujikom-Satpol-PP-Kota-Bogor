import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordFieldProps = {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function PasswordField({ label, error, ...props }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block mb-1 text-gray-200">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none transition-all duration-300 backdrop-blur-sm text-white bg-gray-800/70 border-gray-600 focus:border-blue-500 hover:border-gray-500 placeholder:text-gray-400 focus:bg-gray-800/90"
        />
        <span
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-200 transition-colors"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
