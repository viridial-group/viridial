import { Metadata } from "next";
import { BlogPageClient } from "./BlogPageClient";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Blog - Actualités et Conseils Immobiliers",
  description: "Découvrez nos articles sur l'immobilier durable, les éco-quartiers, les tendances du marché et les meilleures pratiques.",
  keywords: ["blog immobilier", "conseils immobiliers", "éco-quartiers", "immobilier durable", "actualités immobilières"],
  openGraph: {
    title: "Blog - Actualités et Conseils Immobiliers | Viridial",
    description: "Découvrez nos articles sur l'immobilier durable et les éco-quartiers.",
  },
};

export default function BlogPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";
  
  // Breadcrumb Structured Data
  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Accueil", url: siteUrl },
      { name: "Blog", url: `${siteUrl}/blog` },
    ],
  });

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <BlogPageClient />
    </>
  );
}

