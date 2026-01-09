import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ToastProvider } from "@/components/ui/simple-toast";
import { AlertDialogProvider } from "@/components/ui/simple-alert-dialog";
import { SkipLink } from "@/components/layout/SkipLink";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo/structured-data";

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
  // Global structured data for all pages
  const organizationSchema = generateOrganizationSchema({
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    contactPoint: {
      telephone: "+33-1-XX-XX-XX-XX",
      contactType: "customer service",
      email: "contact@viridial.com",
    },
    sameAs: [
      "https://twitter.com/viridial",
      "https://linkedin.com/company/viridial",
      "https://facebook.com/viridial",
    ],
  });

  const websiteSchema = generateWebSiteSchema({
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <StructuredData data={[organizationSchema, websiteSchema]} />
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
