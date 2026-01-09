import { Metadata } from "next";
import { FAQPageClient } from "./FAQPageClient";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateFAQSchema } from "@/lib/seo/structured-data";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "FAQ - Questions fréquentes",
  description: "Trouvez les réponses aux questions les plus fréquentes sur Viridial, notre plateforme SaaS immobilière durable.",
  keywords: ["FAQ", "questions fréquentes", "aide", "support", "Viridial", "SaaS immobilier"],
  openGraph: {
    title: "FAQ - Questions fréquentes | Viridial",
    description: "Trouvez les réponses aux questions les plus fréquentes sur Viridial.",
  },
};

export default function FAQPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";
  
  // FAQ Structured Data
  const faqSchema = generateFAQSchema([
    {
      question: "Qu'est-ce que Viridial ?",
      answer: "Viridial est une plateforme SaaS immobilière multi-tenant qui permet de rechercher, gérer et analyser des propriétés avec un focus particulier sur les éco-quartiers et l'immobilier durable.",
    },
    {
      question: "Comment fonctionne Viridial ?",
      answer: "Viridial fonctionne comme un service cloud accessible depuis n'importe quel navigateur. Vous créez un compte, choisissez votre plan, et accédez immédiatement à toutes les fonctionnalités.",
    },
    {
      question: "Qui peut utiliser Viridial ?",
      answer: "Viridial s'adresse aux agences immobilières, aux propriétaires indépendants, aux entreprises immobilières, et à tous les professionnels du secteur.",
    },
    {
      question: "Y a-t-il une période d'essai gratuite ?",
      answer: "Oui, nous offrons une période d'essai gratuite de 14 jours pour tous nos plans. Aucune carte bancaire n'est requise pour commencer.",
    },
    {
      question: "Comment mes données sont-elles sécurisées ?",
      answer: "La sécurité est notre priorité. Nous utilisons un chiffrement SSL/TLS pour toutes les communications, stockons les données dans des centres de données certifiés, et respectons le RGPD.",
    },
  ]);

  // Breadcrumb Structured Data
  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Accueil", url: siteUrl },
      { name: "FAQ", url: `${siteUrl}/faq` },
    ],
  });

  return (
    <>
      <StructuredData data={[faqSchema, breadcrumbSchema]} />
      <FAQPageClient />
    </>
  );
}

