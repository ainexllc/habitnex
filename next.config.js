/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for API routes
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
}

module.exports = nextConfig