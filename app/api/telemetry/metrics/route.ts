import { NextRequest, NextResponse } from 'next/server';
import { getMetrics, calculateBusinessMetrics } from '@/lib/telemetry/metrics';
import { getTelemetryProvider } from '@/lib/telemetry';
import { BusinessMetrics } from '@/lib/telemetry/types';

/**
 * Get current telemetry metrics
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';
    const category = url.searchParams.get('category') || 'all';
    
    const metricsInstance = getMetrics();
    const provider = getTelemetryProvider();
    
    if (!metricsInstance || !provider?.isInitialized) {
      return NextResponse.json(
        { error: 'Telemetry not initialized or metrics not available' },
        { status: 503 }
      );
    }
    
    const businessMetrics = await calculateBusinessMetrics();
    const timestamp = new Date().toISOString();
    
    const metricsData = {
      timestamp,
      service: 'nextvibe',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      category,
      metrics: businessMetrics,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };
    
    // Filter metrics by category if specified
    if (category !== 'all') {
      switch (category) {
        case 'business':
          metricsData.metrics = {
            habitCompletionRate: businessMetrics.habitCompletionRate,
            moodEntriesPerDay: businessMetrics.moodEntriesPerDay,
            aiFeatureAdoption: businessMetrics.aiFeatureAdoption,
            userRetentionRate: businessMetrics.userRetentionRate,
            featureUsageDistribution: businessMetrics.featureUsageDistribution,
            // Include required fields with default values
            apiResponseTime: { p50: 0, p90: 0, p95: 0, p99: 0 },
            errorRate: 0,
            claudeApiCost: 0,
            databaseQueryPerformance: 0,
            memoryUsage: 0,
            pageLoadTime: { lcp: 0, fid: 0, cls: 0 },
            timeToInteractive: 0,
            bounceRate: 0,
            featureCompletionRate: 0,
            errorRecoveryRate: 0
          } as BusinessMetrics;
          break;
        
        case 'technical':
          metricsData.metrics = {
            apiResponseTime: businessMetrics.apiResponseTime,
            errorRate: businessMetrics.errorRate,
            claudeApiCost: businessMetrics.claudeApiCost,
            databaseQueryPerformance: businessMetrics.databaseQueryPerformance,
            memoryUsage: businessMetrics.memoryUsage,
            // Include required fields with default values
            habitCompletionRate: 0,
            moodEntriesPerDay: 0,
            aiFeatureAdoption: 0,
            userRetentionRate: 0,
            featureUsageDistribution: {},
            pageLoadTime: { lcp: 0, fid: 0, cls: 0 },
            timeToInteractive: 0,
            bounceRate: 0,
            featureCompletionRate: 0,
            errorRecoveryRate: 0
          } as BusinessMetrics;
          break;
        
        case 'ux':
          metricsData.metrics = {
            pageLoadTime: businessMetrics.pageLoadTime,
            timeToInteractive: businessMetrics.timeToInteractive,
            bounceRate: businessMetrics.bounceRate,
            featureCompletionRate: businessMetrics.featureCompletionRate,
            errorRecoveryRate: businessMetrics.errorRecoveryRate,
            // Include required fields with default values
            habitCompletionRate: 0,
            moodEntriesPerDay: 0,
            aiFeatureAdoption: 0,
            userRetentionRate: 0,
            featureUsageDistribution: {},
            apiResponseTime: { p50: 0, p90: 0, p95: 0, p99: 0 },
            errorRate: 0,
            claudeApiCost: 0,
            databaseQueryPerformance: 0,
            memoryUsage: 0
          } as BusinessMetrics;
          break;
      }
    }
    
    // Return in requested format
    if (format === 'prometheus') {
      return new Response(formatPrometheusMetrics(metricsData), {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(metricsData);
    
  } catch (error) {
    console.error('[Telemetry Metrics] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Format metrics for Prometheus
 */
function formatPrometheusMetrics(data: any): string {
  const lines: string[] = [];
  
  // Add metadata
  lines.push(`# HELP nextvibe_info Service information`);
  lines.push(`# TYPE nextvibe_info gauge`);
  lines.push(`nextvibe_info{version="${data.version}",environment="${data.environment}"} 1`);
  lines.push('');
  
  // Business metrics
  if (data.metrics.habitCompletionRate !== undefined) {
    lines.push(`# HELP nextvibe_habit_completion_rate Habit completion rate percentage`);
    lines.push(`# TYPE nextvibe_habit_completion_rate gauge`);
    lines.push(`nextvibe_habit_completion_rate ${data.metrics.habitCompletionRate}`);
    lines.push('');
  }
  
  if (data.metrics.moodEntriesPerDay !== undefined) {
    lines.push(`# HELP nextvibe_mood_entries_per_day Average mood entries per day`);
    lines.push(`# TYPE nextvibe_mood_entries_per_day gauge`);
    lines.push(`nextvibe_mood_entries_per_day ${data.metrics.moodEntriesPerDay}`);
    lines.push('');
  }
  
  if (data.metrics.aiFeatureAdoption !== undefined) {
    lines.push(`# HELP nextvibe_ai_feature_adoption AI feature adoption rate percentage`);
    lines.push(`# TYPE nextvibe_ai_feature_adoption gauge`);
    lines.push(`nextvibe_ai_feature_adoption ${data.metrics.aiFeatureAdoption}`);
    lines.push('');
  }
  
  if (data.metrics.errorRate !== undefined) {
    lines.push(`# HELP nextvibe_error_rate Error rate percentage`);
    lines.push(`# TYPE nextvibe_error_rate gauge`);
    lines.push(`nextvibe_error_rate ${data.metrics.errorRate}`);
    lines.push('');
  }
  
  if (data.metrics.claudeApiCost !== undefined) {
    lines.push(`# HELP nextvibe_claude_api_cost_usd Claude API cost in USD`);
    lines.push(`# TYPE nextvibe_claude_api_cost_usd gauge`);
    lines.push(`nextvibe_claude_api_cost_usd ${data.metrics.claudeApiCost}`);
    lines.push('');
  }
  
  // System metrics
  lines.push(`# HELP nextvibe_uptime_seconds Service uptime in seconds`);
  lines.push(`# TYPE nextvibe_uptime_seconds gauge`);
  lines.push(`nextvibe_uptime_seconds ${data.system.uptime}`);
  lines.push('');
  
  lines.push(`# HELP nextvibe_memory_usage_bytes Memory usage in bytes`);
  lines.push(`# TYPE nextvibe_memory_usage_bytes gauge`);
  lines.push(`nextvibe_memory_usage_bytes{type="heap_used"} ${data.system.memory.heapUsed}`);
  lines.push(`nextvibe_memory_usage_bytes{type="heap_total"} ${data.system.memory.heapTotal}`);
  lines.push(`nextvibe_memory_usage_bytes{type="rss"} ${data.system.memory.rss}`);
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Record custom metrics (for testing/development)
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Custom metrics recording only allowed in development' },
      { status: 403 }
    );
  }
  
  try {
    const { name, value, attributes = {} } = await req.json();
    
    if (!name || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data. Required: name (string), value (number)' },
        { status: 400 }
      );
    }
    
    const metrics = getMetrics();
    if (metrics) {
      // Create a custom metric and record the value
      const customMetric = metrics.createCustomMetric(
        `custom_${name}`,
        `Custom metric: ${name}`,
        ''
      );
      
      customMetric.add(value, attributes);
      
      return NextResponse.json({
        message: 'Custom metric recorded',
        metric: { name, value, attributes },
      });
    }
    
    return NextResponse.json(
      { error: 'Metrics not available' },
      { status: 503 }
    );
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record custom metric' },
      { status: 400 }
    );
  }
}