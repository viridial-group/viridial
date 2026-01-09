import { Metadata } from "next";
import { CookiesPageClient } from "./CookiesPageClient";

export const metadata: Metadata = {
  title: "Politique des Cookies",
  description: "Découvrez comment Viridial utilise les cookies et comment gérer vos préférences de cookies.",
  keywords: ["cookies", "politique cookies", "RGPD", "confidentialité", "données personnelles"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Politique des Cookies | Viridial",
    description: "Découvrez comment Viridial utilise les cookies.",
  },
};

export default function CookiesPage() {
  return <CookiesPageClient />;
}

