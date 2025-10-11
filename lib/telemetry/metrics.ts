import { Meter, Counter, Histogram, Gauge, ObservableGauge } from '@opentelemetry/api';
import { TelemetryProvider, BusinessMetrics, MetricEvent, HabitNexSpanAttributes } from './types';
import { createMeter } from './index';

/**
 * HabitNex metrics collection
 */
export class HabitNexMetrics {
  private meter: Meter;
  
  // Business metrics
  private habitCompletionCounter: Counter;
  private moodEntryCounter: Counter;
  private aiFeatureUsageCounter: Counter;
  private userSessionDuration: Histogram;
  private featureAdoptionGauge: ObservableGauge;
  
  // Technical metrics
  private apiResponseTime: Histogram;
  private apiRequestCounter: Counter;
  private errorCounter: Counter;
  private claudeApiCostCounter: Counter;
  private claudeTokenUsage: Counter;
  private databaseQueryDuration: Histogram;
  private cacheHitRatio: Counter;
  
  // User experience metrics
  private pageLoadTime: Histogram;
  private webVitalsGauge: Gauge;
  private interactionDuration: Histogram;
  private errorRecoveryCounter: Counter;
  
  // System metrics
  private memoryUsageGauge: ObservableGauge;
  private activeUsersGauge: ObservableGauge;
  private concurrentRequestsGauge: ObservableGauge;
  
  constructor() {
    this.meter = createMeter('habitnex-metrics');
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // Business metrics
    this.habitCompletionCounter = this.meter.createCounter('habit_completions_total', {
      description: 'Total number of habit completions',
    });

    this.moodEntryCounter = this.meter.createCounter('mood_entries_total', {
      description: 'Total number of mood entries',
    });

    this.aiFeatureUsageCounter = this.meter.createCounter('ai_feature_usage_total', {
      description: 'Total AI feature usage by type',
    });

    this.userSessionDuration = this.meter.createHistogram('user_session_duration_seconds', {
      description: 'User session duration in seconds',
      boundaries: [30, 60, 120, 300, 600, 1200, 3600], // 30s to 1h
    });

    this.featureAdoptionGauge = this.meter.createObservableGauge('feature_adoption_rate', {
      description: 'Feature adoption rate percentage',
    });

    // Technical metrics
    this.apiResponseTime = this.meter.createHistogram('api_response_time_ms', {
      description: 'API response time in milliseconds',
      boundaries: [10, 50, 100, 200, 500, 1000, 2000, 5000], // 10ms to 5s
    });

    this.apiRequestCounter = this.meter.createCounter('api_requests_total', {
      description: 'Total number of API requests',
    });

    this.errorCounter = this.meter.createCounter('errors_total', {
      description: 'Total number of errors',
    });

    this.claudeApiCostCounter = this.meter.createCounter('claude_api_cost_total', {
      description: 'Total Claude API cost in USD',
    });

    this.claudeTokenUsage = this.meter.createCounter('claude_tokens_total', {
      description: 'Total tokens used for Claude API',
    });

    this.databaseQueryDuration = this.meter.createHistogram('database_query_duration_ms', {
      description: 'Database query duration in milliseconds',
      boundaries: [1, 5, 10, 25, 50, 100, 250, 500, 1000], // 1ms to 1s
    });

    this.cacheHitRatio = this.meter.createCounter('cache_operations_total', {
      description: 'Cache operations (hits and misses)',
    });

    // User experience metrics
    this.pageLoadTime = this.meter.createHistogram('page_load_time_ms', {
      description: 'Page load time in milliseconds',
      boundaries: [100, 300, 500, 1000, 1500, 2000, 3000, 5000], // 100ms to 5s
    });

    this.webVitalsGauge = this.meter.createGauge('web_vitals', {
      description: 'Core Web Vitals metrics',
    });

    this.interactionDuration = this.meter.createHistogram('interaction_duration_ms', {
      description: 'User interaction duration in milliseconds',
      boundaries: [10, 50, 100, 200, 500, 1000], // 10ms to 1s
    });

    this.errorRecoveryCounter = this.meter.createCounter('error_recoveries_total', {
      description: 'Number of error recoveries',
    });

    // System metrics
    this.memoryUsageGauge = this.meter.createObservableGauge('memory_usage_bytes', {
      description: 'Memory usage in bytes',
    });

    this.activeUsersGauge = this.meter.createObservableGauge('active_users_current', {
      description: 'Current number of active users',
    });

    this.concurrentRequestsGauge = this.meter.createObservableGauge('concurrent_requests_current', {
      description: 'Current number of concurrent requests',
    });

    // Set up observable metric callbacks
    this.setupObservableMetrics();
  }

  private setupObservableMetrics(): void {
    // Memory usage callback
    this.meter.addBatchObservableCallback(
      (observableResult) => {
        if (typeof process !== 'undefined' && process.memoryUsage) {
          const memUsage = process.memoryUsage();
          observableResult.observe(this.memoryUsageGauge, memUsage.heapUsed, {
            type: 'heap_used',
          });
          observableResult.observe(this.memoryUsageGauge, memUsage.heapTotal, {
            type: 'heap_total',
          });
          observableResult.observe(this.memoryUsageGauge, memUsage.rss, {
            type: 'rss',
          });
        }
      },
      [this.memoryUsageGauge]
    );

    // Feature adoption callback (would typically query your database)
    this.meter.addBatchObservableCallback(
      async (observableResult) => {
        // This would typically fetch real adoption metrics from your database
        // For now, we'll use placeholder values
        observableResult.observe(this.featureAdoptionGauge, 85.5, {
          feature: 'habit_tracking',
        });
        observableResult.observe(this.featureAdoptionGauge, 65.2, {
          feature: 'mood_tracking',
        });
        observableResult.observe(this.featureAdoptionGauge, 45.8, {
          feature: 'ai_coach',
        });
      },
      [this.featureAdoptionGauge]
    );
  }

  // Business metrics methods
  recordHabitCompletion(attributes: HabitNexSpanAttributes = {}): void {
    this.habitCompletionCounter.add(1, {
      'user.id': attributes['user.id'],
      'habit.category': attributes['habit.category'],
      'habit.id': attributes['habit.id'],
    });
  }

  recordMoodEntry(rating: number, attributes: HabitNexSpanAttributes = {}): void {
    this.moodEntryCounter.add(1, {
      'user.id': attributes['user.id'],
      'mood.rating': rating,
    });
  }

  recordAIFeatureUsage(feature: string, attributes: HabitNexSpanAttributes = {}): void {
    this.aiFeatureUsageCounter.add(1, {
      'ai.feature': feature,
      'user.id': attributes['user.id'],
      'ai.model': attributes['ai.model'],
    });
  }

  recordUserSessionDuration(durationSeconds: number, attributes: HabitNexSpanAttributes = {}): void {
    this.userSessionDuration.record(durationSeconds, {
      'user.id': attributes['user.id'],
    });
  }

  // Technical metrics methods
  recordApiRequest(
    endpoint: string, 
    method: string, 
    statusCode: number, 
    durationMs: number, 
    attributes: HabitNexSpanAttributes = {}
  ): void {
    this.apiRequestCounter.add(1, {
      'api.endpoint': endpoint,
      'api.method': method,
      'api.status_code': statusCode,
      'user.id': attributes['user.id'],
    });

    this.apiResponseTime.record(durationMs, {
      'api.endpoint': endpoint,
      'api.method': method,
    });

    if (statusCode >= 400) {
      this.recordError('api_error', endpoint, attributes);
    }
  }

  recordError(
    errorType: string, 
    context: string, 
    attributes: HabitNexSpanAttributes = {}
  ): void {
    this.errorCounter.add(1, {
      'error.type': errorType,
      'error.context': context,
      'user.id': attributes['user.id'],
      'component.name': attributes['component.name'],
    });
  }

  recordClaudeApiUsage(
    inputTokens: number, 
    outputTokens: number, 
    cost: number, 
    attributes: HabitNexSpanAttributes = {}
  ): void {
    this.claudeTokenUsage.add(inputTokens, {
      type: 'input',
      'ai.feature': attributes['ai.feature'],
    });

    this.claudeTokenUsage.add(outputTokens, {
      type: 'output',  
      'ai.feature': attributes['ai.feature'],
    });

    this.claudeApiCostCounter.add(cost, {
      'ai.feature': attributes['ai.feature'],
      'user.id': attributes['user.id'],
    });
  }

  recordDatabaseQuery(
    operation: string, 
    collection: string, 
    durationMs: number, 
    success: boolean,
    attributes: HabitNexSpanAttributes = {}
  ): void {
    this.databaseQueryDuration.record(durationMs, {
      'db.operation': operation,
      'db.collection': collection,
      'db.success': success.toString(),
    });

    if (!success) {
      this.recordError('database_error', `${operation} on ${collection}`, attributes);
    }
  }

  recordCacheOperation(hit: boolean, operation: string): void {
    this.cacheHitRatio.add(1, {
      'cache.result': hit ? 'hit' : 'miss',
      'cache.operation': operation,
    });
  }

  // User experience metrics methods
  recordPageLoad(page: string, loadTimeMs: number, attributes: HabitNexSpanAttributes = {}): void {
    this.pageLoadTime.record(loadTimeMs, {
      'page.name': page,
      'user.id': attributes['user.id'],
    });
  }

  recordWebVitals(metric: string, value: number, attributes: HabitNexSpanAttributes = {}): void {
    this.webVitalsGauge.record(value, {
      'vitals.metric': metric,
      'page.name': attributes['component.name'],
    });
  }

  recordInteraction(
    type: string, 
    durationMs: number, 
    attributes: HabitNexSpanAttributes = {}
  ): void {
    this.interactionDuration.record(durationMs, {
      'interaction.type': type,
      'component.name': attributes['component.name'],
    });
  }

  recordErrorRecovery(errorType: string, attributes: HabitNexSpanAttributes = {}): void {
    this.errorRecoveryCounter.add(1, {
      'error.type': errorType,
      'user.id': attributes['user.id'],
    });
  }

  // Utility methods
  createCustomMetric(name: string, description: string, unit: string = ''): Counter {
    return this.meter.createCounter(name, { description, unit });
  }

  createCustomHistogram(
    name: string, 
    description: string, 
    boundaries: number[] = []
  ): Histogram {
    return this.meter.createHistogram(name, { 
      description, 
      boundaries: boundaries.length > 0 ? boundaries : undefined 
    });
  }
}

/**
 * Global metrics instance
 */
let globalMetrics: HabitNexMetrics | null = null;

/**
 * Initialize custom metrics
 */
export async function createCustomMetrics(provider: TelemetryProvider): Promise<HabitNexMetrics> {
  if (!globalMetrics) {
    globalMetrics = new HabitNexMetrics();
    console.log('[Telemetry] Custom metrics initialized');
  }
  
  return globalMetrics;
}

/**
 * Get global metrics instance
 */
export function getMetrics(): HabitNexMetrics | null {
  return globalMetrics;
}

/**
 * Convenience function to record custom metric events
 */
export function recordMetricEvent(event: MetricEvent): void {
  const metrics = getMetrics();
  if (!metrics) return;

  const customCounter = metrics.createCustomMetric(
    event.name,
    `Custom metric: ${event.name}`,
    event.unit
  );

  customCounter.add(event.value, event.attributes);
}

/**
 * Calculate business metrics from current data
 */
export async function calculateBusinessMetrics(): Promise<BusinessMetrics> {
  // This would typically query your database for real metrics
  // For now, return example values
  return {
    habitCompletionRate: 78.5,
    moodEntriesPerDay: 2.3,
    aiFeatureAdoption: 45.8,
    userRetentionRate: 82.1,
    featureUsageDistribution: {
      'habit_tracking': 95.2,
      'mood_tracking': 67.8,
      'ai_coach': 45.8,
      'analytics': 34.2,
    },
    apiResponseTime: {
      p50: 120,
      p90: 350,
      p95: 500,
      p99: 1200,
    },
    errorRate: 2.1,
    claudeApiCost: 12.45,
    databaseQueryPerformance: 45.2,
    memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
    pageLoadTime: {
      lcp: 1800,
      fid: 45,
      cls: 0.08,
    },
    timeToInteractive: 2100,
    bounceRate: 12.5,
    featureCompletionRate: 89.3,
    errorRecoveryRate: 76.8,
  };
}

/**
 * Export commonly used metrics functions
 */
export {
  recordMetricEvent as recordMetric,
  getMetrics as metrics,
};