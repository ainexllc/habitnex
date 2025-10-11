import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { trace, metrics, DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';

import { TelemetryConfig, TelemetryProvider } from './types';
import { createExporters } from './exporters';
import { createCustomMetrics } from './metrics';
import { setupDevelopmentTools } from './development';

/**
 * Default telemetry configuration
 */
const getDefaultConfig = (): TelemetryConfig => ({
  serviceName: process.env.OTEL_SERVICE_NAME || 'habitnex',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  enableTracing: process.env.OTEL_ENABLE_TRACING !== 'false',
  enableMetrics: process.env.OTEL_ENABLE_METRICS !== 'false',
  enableLogging: process.env.OTEL_ENABLE_LOGGING !== 'false',
  samplingRate: parseFloat(process.env.OTEL_SAMPLING_RATE || '1.0'),
  exporters: {
    console: process.env.NODE_ENV === 'development',
    otlp: {
      enabled: !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
        JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : undefined,
    },
    datadog: {
      enabled: !!process.env.DD_API_KEY,
      apiKey: process.env.DD_API_KEY,
      site: process.env.DD_SITE || 'datadoghq.com',
    },
    newrelic: {
      enabled: !!process.env.NEW_RELIC_LICENSE_KEY,
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
    },
    honeycomb: {
      enabled: !!process.env.HONEYCOMB_API_KEY,
      apiKey: process.env.HONEYCOMB_API_KEY,
      dataset: process.env.HONEYCOMB_DATASET || 'habitnex',
    },
    vercel: {
      enabled: !!process.env.VERCEL,
    },
  },
  development: {
    consoleOutput: process.env.NODE_ENV === 'development',
    detailedLogging: process.env.OTEL_LOG_LEVEL === 'debug',
    traceVisualization: process.env.NODE_ENV === 'development',
  },
});

/**
 * Global telemetry instance
 */
let telemetryInstance: {
  sdk: NodeSDK | null;
  provider: TelemetryProvider | null;
  initialized: boolean;
} = {
  sdk: null,
  provider: null,
  initialized: false,
};

/**
 * Initialize OpenTelemetry
 */
export async function initializeTelemetry(config?: Partial<TelemetryConfig>): Promise<TelemetryProvider> {
  if (telemetryInstance.initialized) {
    console.log('[Telemetry] Already initialized');
    return telemetryInstance.provider!;
  }

  const fullConfig: TelemetryConfig = { ...getDefaultConfig(), ...config };

  try {
    // Set up diagnostic logging
    if (fullConfig.development.detailedLogging) {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }

    // Create resource identification
    const resource = resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: fullConfig.serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: fullConfig.version,
      'service.environment': fullConfig.environment,
      'service.namespace': 'habitnex',
      'deployment.environment': fullConfig.environment,
    });

    // Create exporters
    const { traceExporter, metricExporter } = await createExporters(fullConfig);

    // Create SDK with auto-instrumentations
    const sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader: metricExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable problematic instrumentations
          '@opentelemetry/instrumentation-winston': {
            enabled: false,
          },
          '@opentelemetry/instrumentation-fs': {
            // Disable file system instrumentation in production for performance
            enabled: fullConfig.environment === 'development',
          },
          '@opentelemetry/instrumentation-http': {
            enabled: fullConfig.enableTracing,
            requestHook: (span, request) => {
              // Add custom request attributes
              const url = request.url || '';
              const method = request.method || '';
              
              span.setAttributes({
                'http.route': extractRoute(url),
                'http.user_agent': request.headers?.['user-agent'] || '',
                'http.real_ip': request.headers?.['x-forwarded-for'] || 
                              request.headers?.['x-real-ip'] || '',
              });
            },
            responseHook: (span, response) => {
              // Add response attributes
              span.setAttributes({
                'http.status_code': response.statusCode || 0,
                'http.status_text': response.statusMessage || '',
              });
            },
          },
          '@opentelemetry/instrumentation-fetch': {
            enabled: fullConfig.enableTracing,
            requestHook: (span, request) => {
              // Track external API calls
              const url = typeof request === 'string' ? request : request.url;
              if (url.includes('api.anthropic.com')) {
                span.updateName('claude_api_call');
                span.setAttributes({
                  'ai.provider': 'anthropic',
                  'ai.model': 'claude',
                });
              }
            },
          },
        }),
      ],
    });

    // Initialize the SDK
    await sdk.start();

    console.log('[Telemetry] OpenTelemetry initialized successfully');

    // Get providers
    const tracerProvider = trace.getTracerProvider() as any;
    const meterProvider = metrics.getMeterProvider() as any;

    const provider: TelemetryProvider = {
      tracerProvider,
      meterProvider,
      isInitialized: true,
      config: fullConfig,
    };

    // Initialize custom metrics
    await createCustomMetrics(provider);

    // Set up development tools
    if (fullConfig.development.consoleOutput) {
      await setupDevelopmentTools(provider);
    }

    // Store instance
    telemetryInstance = {
      sdk,
      provider,
      initialized: true,
    };

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[Telemetry] Shutting down OpenTelemetry...');
      await shutdownTelemetry();
    });

    return provider;

  } catch (error) {
    console.error('[Telemetry] Failed to initialize OpenTelemetry:', error);
    
    // Return a minimal provider in case of failure
    return {
      tracerProvider: trace.getTracerProvider() as any,
      meterProvider: metrics.getMeterProvider() as any,
      isInitialized: false,
      config: fullConfig,
    };
  }
}

/**
 * Get the current telemetry provider
 */
export function getTelemetryProvider(): TelemetryProvider | null {
  return telemetryInstance.provider;
}

/**
 * Check if telemetry is initialized
 */
export function isTelemetryInitialized(): boolean {
  return telemetryInstance.initialized;
}

/**
 * Shutdown telemetry gracefully
 */
export async function shutdownTelemetry(): Promise<void> {
  if (!telemetryInstance.sdk) {
    return;
  }

  try {
    await telemetryInstance.sdk.shutdown();
    console.log('[Telemetry] OpenTelemetry shutdown complete');
  } catch (error) {
    console.error('[Telemetry] Error during shutdown:', error);
  } finally {
    telemetryInstance = {
      sdk: null,
      provider: null,
      initialized: false,
    };
  }
}

/**
 * Get telemetry configuration
 */
export function getTelemetryConfig(): TelemetryConfig | null {
  return telemetryInstance.provider?.config || null;
}

/**
 * Helper function to extract route from URL
 */
function extractRoute(url: string): string {
  try {
    // Handle Next.js API routes
    if (url.includes('/api/')) {
      const apiPath = url.split('/api/')[1];
      const pathSegments = apiPath.split('?')[0].split('/');
      
      // Replace dynamic segments with placeholders
      return '/api/' + pathSegments.map(segment => {
        // Check if segment looks like an ID (UUID, number, etc.)
        if (/^[a-f0-9-]{36}$/.test(segment) || /^\d+$/.test(segment)) {
          return ':id';
        }
        return segment;
      }).join('/');
    }

    // Handle page routes
    const pathSegments = url.split('?')[0].split('/');
    return pathSegments.map(segment => {
      if (/^[a-f0-9-]{36}$/.test(segment) || /^\d+$/.test(segment)) {
        return ':id';
      }
      return segment;
    }).join('/');
    
  } catch (error) {
    return url;
  }
}

/**
 * Create a tracer for a specific component
 */
export function createTracer(name: string) {
  const provider = getTelemetryProvider();
  if (!provider?.tracerProvider) {
    // Return a no-op tracer if telemetry is not initialized
    return trace.getTracer(name);
  }
  
  return provider.tracerProvider.getTracer(name, getTelemetryConfig()?.version);
}

/**
 * Create a meter for a specific component
 */
export function createMeter(name: string) {
  const provider = getTelemetryProvider();
  if (!provider?.meterProvider) {
    // Return a no-op meter if telemetry is not initialized
    return metrics.getMeter(name);
  }
  
  return provider.meterProvider.getMeter(name, getTelemetryConfig()?.version);
}

// Export commonly used telemetry APIs
export { trace, metrics, context } from '@opentelemetry/api';
export type { Tracer, Meter, Span } from '@opentelemetry/api';