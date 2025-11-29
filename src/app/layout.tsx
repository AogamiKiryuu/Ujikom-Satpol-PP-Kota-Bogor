// @ts-expect-error: allow importing global CSS without type declarations
import "./globals.css";
import { ThemeProvider } from "@/app/context/ThemeProvider";
import { ToastContainer } from "react-toastify";
// @ts-expect-error: allow importing css from react-toastify without type declarations
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
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
