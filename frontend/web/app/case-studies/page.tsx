import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import { CaseStudiesPageClient } from "./CaseStudiesPageClient";

export const metadata: Metadata = genMeta({
  title: "Études de Cas - Succès Clients Viridial",
  description:
    "Découvrez comment nos clients transforment leur activité immobilière avec Viridial. Études de cas détaillées avec résultats mesurables : ROI, automatisation, croissance.",
  keywords: [
    "études de cas Viridial",
    "cas clients SaaS immobilier",
    "succès clients",
    "ROI immobilier",
    "transformation digitale immobilier",
  ],
  canonical: "/case-studies",
  ogImage: "/og-case-studies.jpg",
});

export default function CaseStudiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CaseStudiesPageClient />
      </main>
      <Footer />
    </div>
  );
}
