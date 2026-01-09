import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/browse", "/property/"],
        disallow: ["/dashboard", "/properties", "/marketing", "/login", "/signup"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


