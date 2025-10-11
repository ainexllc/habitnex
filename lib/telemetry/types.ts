import { Timestamp } from 'firebase/firestore';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { TracerProvider } from '@opentelemetry/sdk-trace-node';

/**
 * Telemetry configuration
 */
export interface TelemetryConfig {
  serviceName: string;
  version: string;
  environment: string;
  enableTracing: boolean;
  enableMetrics: boolean;
  enableLogging: boolean;
  samplingRate: number;
  exporters: {
    console: boolean;
    otlp: {
      enabled: boolean;
      endpoint?: string;
      headers?: Record<string, string>;
    };
    datadog: {
      enabled: boolean;
      apiKey?: string;
      site?: string;
    };
    newrelic: {
      enabled: boolean;
      licenseKey?: string;
    };
    honeycomb: {
      enabled: boolean;
      apiKey?: string;
      dataset?: string;
    };
    vercel: {
      enabled: boolean;
    };
  };
  development: {
    consoleOutput: boolean;
    detailedLogging: boolean;
    traceVisualization: boolean;
  };
}

/**
 * Custom span attributes for HabitNex-specific operations
 */
export interface HabitNexSpanAttributes {
  // User attributes
  'user.id'?: string;
  'user.email'?: string;
  'user.authenticated'?: boolean;
  
  // Business logic attributes  
  'habit.id'?: string;
  'habit.name'?: string;
  'habit.category'?: string;
  'mood.id'?: string;
  'mood.rating'?: number;
  'ai.feature'?: string;
  'ai.model'?: string;
  'ai.max_tokens'?: number;
  'ai.temperature'?: number;
  'ai.tokens.input'?: number;
  'ai.tokens.output'?: number;
  'ai.cost'?: number;
  'ai.response_time_ms'?: number;
  'cache.hit'?: boolean;
  
  // Database attributes
  'db.operation'?: string;
  'db.collection'?: string;
  'db.document_id'?: string;
  'db.query_duration'?: number;
  
  // API attributes
  'api.endpoint'?: string;
  'api.method'?: string;
  'api.status_code'?: number;
  'api.response_size'?: number;
  'api.user_agent'?: string;
  'api.client_ip'?: string;
  
  // Component attributes
  'component.name'?: string;
  'component.type'?: 'page' | 'api' | 'hook' | 'service';
  'view.name'?: string;
  'view.type'?: string;
  
  // Error attributes
  'error.type'?: string;
  'error.message'?: string;
  'error.stack'?: string;
  'error.handled'?: boolean;
}

/**
 * Business metrics for HabitNex
 */
export interface BusinessMetrics {
  // User engagement metrics
  habitCompletionRate: number;
  moodEntriesPerDay: number;
  aiFeatureAdoption: number;
  userRetentionRate: number;
  featureUsageDistribution: Record<string, number>;
  
  // Technical metrics
  apiResponseTime: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  claudeApiCost: number;
  databaseQueryPerformance: number;
  memoryUsage: number;
  
  // User experience metrics
  pageLoadTime: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  timeToInteractive: number;
  bounceRate: number;
  featureCompletionRate: number;
  errorRecoveryRate: number;
}

/**
 * Custom metric event
 */
export interface MetricEvent {
  name: string;
  value: number;
  unit: string;
  attributes: HabitNexSpanAttributes;
  timestamp: Date;
}

/**
 * Trace context for distributed tracing
 */
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  flags: number;
  baggage?: Record<string, string>;
}

/**
 * Performance measurement
 */
export interface PerformanceMeasurement {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  attributes: HabitNexSpanAttributes;
}

/**
 * Telemetry provider interface
 */
export interface TelemetryProvider {
  tracerProvider: TracerProvider;
  meterProvider: MeterProvider;
  isInitialized: boolean;
  config: TelemetryConfig;
}

/**
 * Alert configuration for telemetry
 */
export interface TelemetryAlert {
  id: string;
  name: string;
  type: 'threshold' | 'anomaly' | 'error_spike';
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold?: number;
  duration: number; // in minutes
  enabled: boolean;
  recipients: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Timestamp;
  lastTriggered?: Timestamp;
}

/**
 * Telemetry dashboard configuration
 */
export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rows: number;
  };
  refreshInterval: number; // in seconds
  timeRange: {
    start: string | 'now-1h' | 'now-24h' | 'now-7d' | 'now-30d';
    end: string | 'now';
  };
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert_summary';
  title: string;
  metric?: string;
  query?: string;
  visualization?: 'line' | 'bar' | 'pie' | 'gauge' | 'number';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  options?: Record<string, any>;
}

/**
 * Telemetry export batch
 */
export interface TelemetryBatch {
  traces: any[];
  metrics: MetricEvent[];
  logs: any[];
  timestamp: Date;
  batchId: string;
}

/**
 * Real User Monitoring (RUM) data
 */
export interface RUMData {
  sessionId: string;
  userId?: string;
  pageUrl: string;
  userAgent: string;
  performance: {
    navigationTiming: PerformanceNavigationTiming;
    paintTiming: PerformancePaintTiming[];
    resourceTiming: PerformanceResourceTiming[];
  };
  vitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  };
  errors: Array<{
    message: string;
    source: string;
    lineno: number;
    colno: number;
    error: string;
    timestamp: Date;
  }>;
  interactions: Array<{
    type: string;
    target: string;
    timestamp: Date;
    duration?: number;
  }>;
}

/**
 * Telemetry service status
 */
export interface ServiceStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime?: number;
  errorRate?: number;
  uptime?: number;
  version?: string;
}