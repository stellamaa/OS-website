import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-times-new-roman",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-times-new-roman",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oficina Satelite ",
  description: "Architecture and Design Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
