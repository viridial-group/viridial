import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";

  const now = new Date();

  // Priority pages (homepage and main marketing pages)
  const priorityPages = [
    { path: "", priority: 1.0, changeFreq: "daily" as const },
    { path: "/features", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/pricing", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/about", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/testimonials", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/case-studies", priority: 0.7, changeFreq: "weekly" as const },
    { path: "/blog", priority: 0.7, changeFreq: "daily" as const },
  ];

  // Search and browse pages
  const publicPages = [
    { path: "/browse", priority: 0.8, changeFreq: "daily" as const },
    { path: "/search", priority: 0.7, changeFreq: "daily" as const },
    { path: "/neighborhoods", priority: 0.6, changeFreq: "weekly" as const },
  ];

  // Legal pages
  const legalPages = [
    { path: "/legal/privacy", priority: 0.5, changeFreq: "yearly" as const },
    { path: "/legal/terms", priority: 0.5, changeFreq: "yearly" as const },
    { path: "/legal/cookies", priority: 0.5, changeFreq: "yearly" as const },
  ];

  const allRoutes = [...priorityPages, ...publicPages, ...legalPages];

  const routes: MetadataRoute.Sitemap = allRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));

  // Add alternate language versions for each route
  const locales = ["fr", "en", "es", "ar"];
  const multilingualRoutes: MetadataRoute.Sitemap = [];
  
  for (const route of allRoutes) {
    for (const locale of locales) {
      if (locale !== "fr") {
        multilingualRoutes.push({
          url: `${baseUrl}${route.path}?locale=${locale}`,
          lastModified: now,
          changeFrequency: route.changeFreq,
          priority: route.priority * 0.9, // Slightly lower priority for alternate languages
        });
      }
    }
  }

  return [...routes, ...multilingualRoutes];
}


