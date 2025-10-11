import { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { MetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

import { TelemetryConfig } from './types';

/**
 * Console trace exporter with enhanced formatting for development
 */
class EnhancedConsoleSpanExporter implements SpanExporter {
  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    spans.forEach(span => {
      const duration = span.duration[0] + span.duration[1] / 1e9;
      const attributes = span.attributes;
      
      // Enhanced console output with colors and structure
      console.group(`🔍 [${span.name}] ${duration.toFixed(2)}ms`);
      
      if (attributes['http.method']) {
        console.log(`📡 ${attributes['http.method']} ${attributes['http.target'] || attributes['http.url']}`);
      }
      
      if (attributes['user.id']) {
        console.log(`👤 User: ${attributes['user.id']}`);
      }
      
      if (attributes['ai.model']) {
        console.log(`🤖 AI: ${attributes['ai.model']} (${attributes['ai.tokens.input']}→${attributes['ai.tokens.output']} tokens, $${attributes['ai.cost']})`);
      }
      
      if (attributes['db.operation']) {
        console.log(`🗄️  DB: ${attributes['db.operation']} on ${attributes['db.collection']}`);
      }
      
      if (span.status.code !== 1) { // Not OK
        console.log(`❌ Error: ${span.status.message}`);
      }
      
      // Show custom attributes
      const customAttrs = Object.entries(attributes).filter(([key]) => 
        key.startsWith('habit.') || key.startsWith('mood.') || key.startsWith('component.')
      );
      
      if (customAttrs.length > 0) {
        console.log('🏷️  Custom:', Object.fromEntries(customAttrs));
      }
      
      console.groupEnd();
    });
    
    resultCallback({ code: 0 });
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * Vercel Analytics exporter for Web Vitals and performance data
 */
class VercelAnalyticsExporter implements SpanExporter {
  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    // Filter spans relevant to Vercel Analytics
    const webVitalsSpans = spans.filter(span => 
      span.name.includes('web-vital') || 
      span.attributes['component.type'] === 'page'
    );

    webVitalsSpans.forEach(span => {
      // Send to Vercel Analytics
      if (typeof window !== 'undefined' && (window as any).va) {
        const vitalsData = {
          name: span.name,
          value: span.duration[0] + span.duration[1] / 1e9,
          id: span.spanContext().spanId,
          url: span.attributes['http.url'] as string,
        };
        
        (window as any).va('track', 'performance', vitalsData);
      }
    });

    resultCallback({ code: 0 });
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * DataDog exporter wrapper
 */
class DataDogExporter implements SpanExporter {
  private otlpExporter: OTLPTraceExporter;

  constructor(apiKey: string, site: string = 'datadoghq.com') {
    this.otlpExporter = new OTLPTraceExporter({
      url: `https://trace-agent.${site}/v0.4/traces`,
      headers: {
        'DD-API-KEY': apiKey,
        'Content-Type': 'application/x-protobuf',
      },
    });
  }

  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    // Transform spans for DataDog format
    const transformedSpans = spans.map(span => ({
      ...span,
      attributes: {
        ...span.attributes,
        'service.name': 'habitnex',
        'env': process.env.NODE_ENV,
      },
    }));

    this.otlpExporter.export(transformedSpans as any, resultCallback);
  }

  shutdown(): Promise<void> {
    return this.otlpExporter.shutdown();
  }

  forceFlush(): Promise<void> {
    return this.otlpExporter.forceFlush();
  }
}

/**
 * New Relic exporter wrapper
 */
class NewRelicExporter implements SpanExporter {
  private otlpExporter: OTLPTraceExporter;

  constructor(licenseKey: string) {
    this.otlpExporter = new OTLPTraceExporter({
      url: 'https://otlp.nr-data.net/v1/traces',
      headers: {
        'Api-Key': licenseKey,
      },
    });
  }

  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    this.otlpExporter.export(spans, resultCallback);
  }

  shutdown(): Promise<void> {
    return this.otlpExporter.shutdown();
  }

  forceFlush(): Promise<void> {
    return this.otlpExporter.forceFlush();
  }
}

/**
 * Honeycomb exporter wrapper
 */
class HoneycombExporter implements SpanExporter {
  private otlpExporter: OTLPTraceExporter;

  constructor(apiKey: string, dataset: string = 'habitnex') {
    this.otlpExporter = new OTLPTraceExporter({
      url: 'https://api.honeycomb.io/v1/traces',
      headers: {
        'x-honeycomb-team': apiKey,
        'x-honeycomb-dataset': dataset,
      },
    });
  }

  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    this.otlpExporter.export(spans, resultCallback);
  }

  shutdown(): Promise<void> {
    return this.otlpExporter.shutdown();
  }

  forceFlush(): Promise<void> {
    return this.otlpExporter.forceFlush();
  }
}

/**
 * Multi-exporter that sends data to multiple destinations
 */
class MultiSpanExporter implements SpanExporter {
  private exporters: SpanExporter[] = [];

  constructor(exporters: SpanExporter[]) {
    this.exporters = exporters.filter(Boolean);
  }

  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    const promises = this.exporters.map(exporter => 
      new Promise<void>((resolve, reject) => {
        exporter.export(spans, (result) => {
          if (result.code === 0) {
            resolve();
          } else {
            reject(new Error(`Export failed: ${result.error?.message}`));
          }
        });
      })
    );

    Promise.allSettled(promises).then(results => {
      const failures = results.filter(r => r.status === 'rejected').length;
      const successes = results.length - failures;

      if (successes > 0) {
        resultCallback({ code: 0 });
      } else {
        resultCallback({ code: 1, error: new Error('All exporters failed') });
      }

      if (failures > 0) {
        console.warn(`[Telemetry] ${failures} out of ${results.length} exporters failed`);
      }
    });
  }

  async shutdown(): Promise<void> {
    await Promise.all(this.exporters.map(exporter => exporter.shutdown()));
  }

  async forceFlush(): Promise<void> {
    await Promise.all(this.exporters.map(exporter => exporter.forceFlush()));
  }
}

/**
 * Create exporters based on configuration
 */
export async function createExporters(config: TelemetryConfig): Promise<{
  traceExporter: SpanExporter | undefined;
  metricExporter: MetricReader | undefined;
}> {
  const traceExporters: SpanExporter[] = [];
  const metricExporters: MetricReader[] = [];

  try {
    // Console exporters for development
    if (config.exporters.console) {
      traceExporters.push(new EnhancedConsoleSpanExporter());
      metricExporters.push(new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
        exportIntervalMillis: 10000, // 10 seconds in development
      }));
    }

    // OTLP exporter (generic OpenTelemetry protocol)
    if (config.exporters.otlp.enabled && config.exporters.otlp.endpoint) {
      traceExporters.push(new OTLPTraceExporter({
        url: config.exporters.otlp.endpoint,
        headers: config.exporters.otlp.headers,
      }));

      metricExporters.push(new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: config.exporters.otlp.endpoint.replace('/traces', '/metrics'),
          headers: config.exporters.otlp.headers,
        }),
        exportIntervalMillis: 30000, // 30 seconds
      }));
    }

    // DataDog exporter
    if (config.exporters.datadog.enabled && config.exporters.datadog.apiKey) {
      traceExporters.push(new DataDogExporter(
        config.exporters.datadog.apiKey,
        config.exporters.datadog.site
      ));
    }

    // New Relic exporter
    if (config.exporters.newrelic.enabled && config.exporters.newrelic.licenseKey) {
      traceExporters.push(new NewRelicExporter(config.exporters.newrelic.licenseKey));
    }

    // Honeycomb exporter
    if (config.exporters.honeycomb.enabled && config.exporters.honeycomb.apiKey) {
      traceExporters.push(new HoneycombExporter(
        config.exporters.honeycomb.apiKey,
        config.exporters.honeycomb.dataset
      ));
    }

    // Vercel Analytics exporter
    if (config.exporters.vercel.enabled) {
      traceExporters.push(new VercelAnalyticsExporter());
    }

    // Create multi-exporter if we have multiple exporters
    const traceExporter = traceExporters.length > 1 
      ? new MultiSpanExporter(traceExporters)
      : traceExporters[0];

    const metricExporter = metricExporters[0]; // Use first metric exporter for now

    console.log(`[Telemetry] Configured ${traceExporters.length} trace exporters and ${metricExporters.length} metric exporters`);

    return {
      traceExporter,
      metricExporter,
    };

  } catch (error) {
    console.error('[Telemetry] Error creating exporters:', error);
    
    // Return console exporters as fallback
    return {
      traceExporter: config.development.consoleOutput ? new EnhancedConsoleSpanExporter() : undefined,
      metricExporter: config.development.consoleOutput ? new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
        exportIntervalMillis: 30000,
      }) : undefined,
    };
  }
}

/**
 * Health check for exporters
 */
export async function checkExporterHealth(config: TelemetryConfig): Promise<{
  [key: string]: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: Date;
    error?: string;
  };
}> {
  const results: any = {};
  const checkTime = new Date();

  // Check OTLP endpoint
  if (config.exporters.otlp.enabled && config.exporters.otlp.endpoint) {
    try {
      const response = await fetch(config.exporters.otlp.endpoint.replace('/v1/traces', '/health'), {
        method: 'GET',
        timeout: 5000,
      });
      results.otlp = {
        status: response.ok ? 'healthy' : 'degraded',
        lastCheck: checkTime,
      };
    } catch (error) {
      results.otlp = {
        status: 'unhealthy',
        lastCheck: checkTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Add health checks for other exporters as needed
  
  return results;
}