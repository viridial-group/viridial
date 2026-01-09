import { Metadata } from "next";
import { PrivacyPageClient } from "./PrivacyPageClient";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de confidentialité de Viridial - Découvrez comment nous protégeons et utilisons vos données personnelles.",
  keywords: ["confidentialité", "données personnelles", "RGPD", "protection des données", "privacy policy"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Politique de Confidentialité | Viridial",
    description: "Politique de confidentialité de Viridial.",
  },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

