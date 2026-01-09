import { Metadata } from "next";
import { TermsPageClient } from "./TermsPageClient";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation de la plateforme Viridial - Lisez nos CGU avant d'utiliser nos services.",
  keywords: ["CGU", "conditions générales", "terms of service", "conditions d'utilisation"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Conditions Générales d'Utilisation | Viridial",
    description: "Conditions générales d'utilisation de Viridial.",
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}

