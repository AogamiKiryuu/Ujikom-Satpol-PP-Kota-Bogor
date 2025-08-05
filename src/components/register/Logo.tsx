/* eslint-disable @next/next/no-img-element */
export default function Logo() {
  return (
    <div className="flex items-center justify-center w-full h-full p-6 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg">
      <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain" />
    </div>
  );
}
