/**
 * SEO Structured Data (JSON-LD) utilities
 * Generates schema.org structured data for better search engine understanding
 */

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface WebSiteSchema {
  name: string;
  url: string;
  potentialAction: {
    "@type": string;
    target: {
      "@type": string;
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export interface SoftwareApplicationSchema {
  name: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: string;
    reviewCount: string;
  };
}

export interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema(data: OrganizationSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo || `${data.url}/logo.png`,
    contactPoint: data.contactPoint
      ? {
          "@type": "ContactPoint",
          telephone: data.contactPoint.telephone,
          contactType: data.contactPoint.contactType,
          email: data.contactPoint.email,
        }
      : undefined,
    sameAs: data.sameAs || [],
  };
}

/**
 * Generate WebSite JSON-LD schema with search action
 */
export function generateWebSiteSchema(data: WebSiteSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: data.potentialAction.target.urlTemplate,
      },
      "query-input": data.potentialAction["query-input"],
    },
  };
}

/**
 * Generate SoftwareApplication JSON-LD schema
 */
export function generateSoftwareApplicationSchema(
  data: SoftwareApplicationSchema
): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: data.name,
    applicationCategory: data.applicationCategory,
    operatingSystem: data.operatingSystem,
    offers: {
      "@type": "Offer",
      price: data.offers.price,
      priceCurrency: data.offers.priceCurrency,
    },
    aggregateRating: data.aggregateRating
      ? {
          "@type": "AggregateRating",
          ratingValue: data.aggregateRating.ratingValue,
          reviewCount: data.aggregateRating.reviewCount,
        }
      : undefined,
  };
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(data: BreadcrumbSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: data.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage JSON-LD schema
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate LocalBusiness JSON-LD schema for real estate agency
 */
export function generateLocalBusinessSchema(data: {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  url: string;
  priceRange?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: data.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
    telephone: data.telephone,
    url: data.url,
    priceRange: data.priceRange,
  };
}

/**
 * Generate Product JSON-LD schema for SaaS pricing
 */
export function generateProductSchema(data: {
  name: string;
  description: string;
  url: string;
  offers: Array<{
    name: string;
    price: string;
    priceCurrency: string;
    availability: string;
  }>;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: "BusinessApplication",
    offers: data.offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      availability: offer.availability,
    })),
  };
}
