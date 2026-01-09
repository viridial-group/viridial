import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateLocalBusinessSchema } from "@/lib/seo/structured-data";
import { ContactPageClient } from "./ContactPageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";

export const metadata: Metadata = genMeta({
  title: "Contactez Viridial - Support & Ventes",
  description:
    "Contactez notre équipe pour toute question commerciale, support technique ou demande de partenariat. Nous vous répondons sous 24h. Email, téléphone et formulaire de contact.",
  keywords: [
    "contact Viridial",
    "support Viridial",
    "ventes Viridial",
    "aide Viridial",
    "assistance technique",
    "commercial immobilier",
  ],
  canonical: "/contact",
  ogImage: "/og-contact.jpg",
});

export default function ContactPage() {
  const localBusinessSchema = generateLocalBusinessSchema({
    name: "Viridial",
    address: {
      streetAddress: "Paris",
      addressLocality: "Paris",
      addressRegion: "Île-de-France",
      postalCode: "75000",
      addressCountry: "FR",
    },
    telephone: "+33-1-XX-XX-XX-XX",
    url: siteUrl,
    priceRange: "€€",
  });

  return (
    <>
      <StructuredData data={localBusinessSchema} />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <ContactPageClient />
        </main>
        <Footer />
      </div>
    </>
  );
}
