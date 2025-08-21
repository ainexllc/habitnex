/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export to support API routes in production
  // ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true
  },
  
  // OpenTelemetry instrumentation (temporarily disabled for stability)
  experimental: {
    instrumentationHook: false, // Disabled to prevent white screen issues
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
  
  // Optimize development experience and prevent white screen issues
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Improve hot reload performance and stability
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
      
      // Optimize Fast Refresh and prevent cache corruption
      config.optimization = {
        ...config.optimization,
        providedExports: false,
        usedExports: false,
        sideEffects: false,
        // Prevent module ID conflicts that cause white screens
        moduleIds: 'named',
        chunkIds: 'named',
      }
      
      // Prevent symlink issues that can cause module resolution problems
      config.resolve.symlinks = false
      
      // Add cache busting for development to prevent stale chunks
      config.output = {
        ...config.output,
        filename: dev ? '[name].js?v=[fullhash]' : config.output.filename,
        chunkFilename: dev ? '[name].js?v=[fullhash]' : config.output.chunkFilename,
      }
    }
    
    // OpenTelemetry webpack configuration
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Ensure OpenTelemetry modules are resolved correctly
        '@opentelemetry/api': require.resolve('@opentelemetry/api'),
        '@opentelemetry/sdk-node': require.resolve('@opentelemetry/sdk-node'),
      }
    }
    
    return config
  },
  
  // Environment variables for telemetry
  env: {
    // Service identification
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME || 'nextvibe',
    OTEL_SERVICE_VERSION: process.env.npm_package_version || '1.0.0',
    
    // Telemetry configuration
    OTEL_ENABLE_TRACING: process.env.OTEL_ENABLE_TRACING || 'true',
    OTEL_ENABLE_METRICS: process.env.OTEL_ENABLE_METRICS || 'true',
    OTEL_SAMPLING_RATE: process.env.OTEL_SAMPLING_RATE || (process.env.NODE_ENV === 'production' ? '0.1' : '1.0'),
    
    // Development settings
    OTEL_LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info'] // Keep important logs in production
    } : false,
  },
  
  // Headers for telemetry and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options', 
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Telemetry headers for tracing
          {
            key: 'X-Service-Name',
            value: 'nextvibe',
          },
          {
            key: 'X-Service-Version',
            value: process.env.npm_package_version || '1.0.0',
          },
        ],
      },
    ];
  },
  
  // Redirects for telemetry endpoints in development
  async redirects() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/telemetry/:path*',
          destination: '/api/telemetry/:path*',
          permanent: false,
        },
      ];
    }
    return [];
  },
  
  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: true, // Generate ETags for better caching
  compress: true, // Enable gzip compression
}

module.exports = nextConfig