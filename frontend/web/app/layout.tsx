import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ToastProvider } from "@/components/ui/simple-toast";
import { AlertDialogProvider } from "@/components/ui/simple-alert-dialog";
import { SkipLink } from "@/components/layout/SkipLink";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";
const siteName = "Viridial";
const siteTitle = "Viridial – SaaS immobilier durable multi-tenant";
const siteDescription =
  "Plateforme SaaS immobilière multi-tenant pour rechercher, gérer et analyser des propriétés, avec focus sur les éco-quartiers et l'immobilier durable.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Viridial",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "SaaS immobilier",
    "plateforme immobilière",
    "gestion de propriétés",
    "recherche immobilière",
    "éco-quartiers",
    "immobilier durable",
  ],
  authors: [{ name: "Viridial" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName,
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <I18nProvider>
          <SkipLink />
          <AuthProvider>
            <ToastProvider>
              <AlertDialogProvider>{children}</AlertDialogProvider>
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
