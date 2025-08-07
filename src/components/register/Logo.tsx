/* eslint-disable @next/next/no-img-element */
export default function Logo() {
  return (
    <div className="flex items-center justify-center w-full h-full p-6">
      <img
        src="/logo.png"
        alt="Logo"
        className="w-100 h-100 object-contain drop-shadow-xl"
      />
    </div>
  );
}
