import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://viridial.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/browse",
          "/search",
          "/property/",
          "/neighborhoods/",
          "/features",
          "/pricing",
          "/about",
          "/contact",
          "/testimonials",
          "/case-studies",
          "/blog",
          "/legal/",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/properties",
          "/properties/",
          "/marketing",
          "/marketing/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/api/",
          "/_next/",
          "/admin/",
          "/private/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/properties",
          "/properties/",
          "/marketing",
          "/marketing/",
        ],
        crawlDelay: 0,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/"],
        disallow: ["/dashboard", "/properties", "/marketing"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}


