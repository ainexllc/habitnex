/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export to support API routes in production
  // ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true
  },
  // Optimize development experience
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Improve hot reload performance
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      
      // Optimize Fast Refresh
      config.optimization = {
        ...config.optimization,
        providedExports: false,
        usedExports: false,
        sideEffects: false,
      }
    }
    return config
  },
  // Experimental features for better dev experience  
  experimental: {
    optimizePackageImports: ['@anthropic-ai/sdk'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
}

module.exports = nextConfig