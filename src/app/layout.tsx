import "./globals.css";
import { ThemeProvider } from "@/app/context/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Ujikom SATPOL PP Kota Bogor",
  description: "Sistem Ujian",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
