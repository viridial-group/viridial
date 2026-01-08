/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker deployment
  env: {
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080',
    NEXT_PUBLIC_PROPERTY_API_URL: process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SEARCH_API_URL: process.env.NEXT_PUBLIC_SEARCH_API_URL || 'http://localhost:3003',
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

module.exports = nextConfig

