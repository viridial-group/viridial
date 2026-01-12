const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker deployment
          env: {
            NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3002',
            NEXT_PUBLIC_PROPERTY_API_URL: process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'http://localhost:3003',
            NEXT_AGENCY_ORGANIZATION_API_URL: process.env.NEXT_AGENCY_ORGANIZATION_API_URL || 'http://localhost:3002',
            NEXT_PUBLIC_ORGANIZATION_API_URL: process.env.NEXT_PUBLIC_ORGANIZATION_API_URL || 'http://localhost:3002',
            NEXT_PUBLIC_SEARCH_API_URL: process.env.NEXT_PUBLIC_SEARCH_API_URL || 'http://localhost:3003',
          },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      // Add other image domains as needed (e.g., MinIO, S3, CDN)
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn-domain.com',
      //   pathname: '/**',
      // },
    ],
  },
  // Suppress hydration warnings caused by browser extensions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Webpack configuration for Leaflet
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Handle Leaflet CSS imports
  transpilePackages: ['leaflet', 'react-leaflet'],
}

module.exports = withNextIntl(nextConfig)

