import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo/structured-data";
import { AboutPageClient } from "./AboutPageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";

export const metadata: Metadata = genMeta({
  title: "À propos de Viridial - Révolutionner l'immobilier durable",
  description:
    "Découvrez la mission de Viridial : construire la plateforme SaaS immobilière de demain, centrée sur la durabilité et l'innovation technologique. Notre équipe passionnée transforme l'industrie immobilière.",
  keywords: [
    "à propos Viridial",
    "équipe Viridial",
    "mission Viridial",
    "histoire Viridial",
    "entreprise immobilière",
    "SaaS immobilier durable",
  ],
  canonical: "/about",
  ogImage: "/og-about.jpg",
});

export default function AboutPage() {
  const organizationSchema = generateOrganizationSchema({
    name: "Viridial",
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
    name: "Viridial",
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
    <>
      <StructuredData data={[organizationSchema, websiteSchema]} />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <AboutPageClient />
        </main>
        <Footer />
      </div>
    </>
  );
}
