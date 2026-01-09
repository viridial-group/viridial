import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Viridial Agency - Gestion Multi-tenant",
  description: "Espace d'administration pour la gestion des organisations, utilisateurs et permissions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <OrganizationProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

