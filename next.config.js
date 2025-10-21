/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard build with API routes enabled (no static export)
  trailingSlash: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true
  },
  
  // Keep only essential experimental features
  experimental: {
    optimizePackageImports: ['@anthropic-ai/sdk'],
  },
  
  // Standard production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Temporarily disable TypeScript checking for build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // URL redirects for backward compatibility (family → workspace)
  async redirects() {
    return [
      {
        source: '/family/:path*',
        destination: '/workspace/:path*',
        permanent: true, // 308 redirect - permanently moved
      },
    ]
  },
}

module.exports = nextConfig
