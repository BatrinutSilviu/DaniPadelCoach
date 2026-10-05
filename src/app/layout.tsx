import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Dani - Antrenor Padel Timișoara | Act!ve Padel Academy",
  description:
    "Antrenamente de padel pentru adulți și copii în Timișoara cu Dani, antrenor certificat PadelMBA. Active Arena & X3 Padel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={jakarta.variable}>
      <body className="flex min-h-screen flex-col bg-[#faf8f5] font-sans text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
