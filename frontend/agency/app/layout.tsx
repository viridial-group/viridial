import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viridial Agency - Gestion des organisations",
  description: "Plateforme de gestion des organisations, utilisateurs et permissions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
