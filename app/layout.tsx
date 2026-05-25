import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DENTRO",
  description: "Todo lo que necesitás, DENTRO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full ${nunito.variable}`}>
      <body className="min-h-full flex flex-col bg-white text-[#4A4A4A] antialiased font-[family-name:var(--font-nunito)]">{children}</body>
    </html>
  );
}
