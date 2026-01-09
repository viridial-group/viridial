import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateFAQSchema } from "@/lib/seo/structured-data";
import { TestimonialsPageClient } from "./TestimonialsPageClient";

export const metadata: Metadata = genMeta({
  title: "Témoignages Clients - Viridial",
  description:
    "Découvrez les témoignages de nos clients satisfaits : agences immobilières, propriétaires et entreprises qui font confiance à Viridial. 98% de taux de satisfaction, ROI en 3 mois.",
  keywords: [
    "témoignages Viridial",
    "avis clients Viridial",
    "clients satisfaits",
    "études de cas immobilières",
    "retours clients SaaS immobilier",
  ],
  canonical: "/testimonials",
  ogImage: "/og-testimonials.jpg",
});

export default function TestimonialsPage() {
  // FAQ schema for testimonials page
  const faqSchema = generateFAQSchema([
    {
      question: "Quel est le taux de satisfaction des clients Viridial ?",
      answer: "Nous avons un taux de satisfaction de 98% avec plus de 500 clients satisfaits.",
    },
    {
      question: "Quel est le ROI moyen avec Viridial ?",
      answer: "Nos clients constatent un retour sur investissement moyen en 3 mois.",
    },
  ]);

  return (
    <>
      <StructuredData data={faqSchema} />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <TestimonialsPageClient />
        </main>
        <Footer />
      </div>
    </>
  );
}
