/**
 * SEO Metadata utilities
 * Helpers for generating page metadata for Next.js
 */

import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";
const siteName = "Viridial";

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  locale?: string;
}

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  ogImage,
  canonical,
  noIndex = false,
  locale = "fr_FR",
}: PageMetadata): Metadata {
  const fullTitle = title.includes("Viridial")
    ? title
    : `${title} | ${siteName}`;
  const imageUrl = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${siteUrl}${ogImage}`
    : `${siteUrl}/og-image.jpg`;
  const canonicalUrl = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${siteUrl}${canonical}`
    : undefined;

  const defaultKeywords = [
    "SaaS immobilier",
    "plateforme immobilière",
    "gestion de propriétés",
    "recherche immobilière",
    "éco-quartiers",
    "immobilier durable",
    "logiciel immobilier",
    "CRM immobilier",
  ];

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords],
    authors: [{ name: "Viridial" }],
    creator: "Viridial",
    publisher: "Viridial",
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      locale,
      url: canonicalUrl || siteUrl,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: "@viridial",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "fr-FR": `${siteUrl}?locale=fr`,
        "en-US": `${siteUrl}?locale=en`,
        "es-ES": `${siteUrl}?locale=es`,
        "ar-SA": `${siteUrl}?locale=ar`,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
  };
}

/**
 * Generate hreflang alternates for multilingual pages
 */
export function generateHreflangAlternates(
  path: string,
  supportedLocales: string[] = ["fr", "en", "es", "ar"]
) {
  const basePath = path.startsWith("/") ? path : `/${path}`;
  return supportedLocales.reduce((acc, locale) => {
    const localeCode = locale === "fr" ? "fr-FR" : locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "ar-SA";
    acc[localeCode] = `${siteUrl}${basePath}?locale=${locale}`;
    return acc;
  }, {} as Record<string, string>);
}
