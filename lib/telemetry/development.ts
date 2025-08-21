import { TelemetryProvider, TraceContext, PerformanceMeasurement } from './types';
import { trace, Span } from '@opentelemetry/api';

/**
 * Development utilities for OpenTelemetry debugging and visualization
 */
export class TelemetryDevelopmentTools {
  private provider: TelemetryProvider;
  private traceLog: Array<{
    timestamp: Date;
    traceId: string;
    spanId: string;
    operation: string;
    duration: number;
    attributes: Record<string, any>;
    status: 'ok' | 'error';
    error?: string;
  }> = [];

  constructor(provider: TelemetryProvider) {
    this.provider = provider;
    this.setupDevelopmentConsole();
  }

  /**
   * Set up development console commands
   */
  private setupDevelopmentConsole(): void {
    if (typeof window !== 'undefined') {
      // Add telemetry debugging commands to window
      (window as any).telemetry = {
        getTraceLog: () => this.traceLog,
        clearTraceLog: () => this.clearTraceLog(),
        getActiveTrace: () => this.getActiveTrace(),
        printTraceTree: () => this.printTraceTree(),
        getMetrics: () => this.getCurrentMetrics(),
        startTrace: (name: string) => this.startDevelopmentTrace(name),
        endTrace: (span: Span) => span.end(),
        recordEvent: (name: string, data: any) => this.recordDevelopmentEvent(name, data),
      };

      console.log('🔍 [Telemetry] Development tools available at window.telemetry');
      console.log('   - window.telemetry.getTraceLog() - View trace log');
      console.log('   - window.telemetry.getActiveTrace() - Get current trace');
      console.log('   - window.telemetry.printTraceTree() - Print trace tree');
      console.log('   - window.telemetry.getMetrics() - Get current metrics');
    }

    if (typeof global !== 'undefined') {
      // Add telemetry debugging commands to global (Node.js)
      (global as any).telemetry = {
        getTraceLog: () => this.traceLog,
        clearTraceLog: () => this.clearTraceLog(),
        getActiveTrace: () => this.getActiveTrace(),
        printTraceTree: () => this.printTraceTree(),
        getMetrics: () => this.getCurrentMetrics(),
      };
    }
  }

  /**
   * Start a development trace
   */
  startDevelopmentTrace(name: string): Span {
    const tracer = trace.getActiveTracer('nextvibe-dev');
    const span = tracer.startSpan(`dev.${name}`, {
      attributes: {
        'dev.manual_trace': true,
        'dev.timestamp': Date.now(),
      },
    });

    console.log(`🔍 [Dev Trace] Started: ${name}`);
    return span;
  }

  /**
   * Record a development event
   */
  recordDevelopmentEvent(name: string, data: any): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent(name, {
        'dev.event_data': JSON.stringify(data),
        'dev.event_timestamp': Date.now(),
      });
    }

    console.log(`📝 [Dev Event] ${name}:`, data);
  }

  /**
   * Get current active trace context
   */
  getActiveTrace(): TraceContext | null {
    const span = trace.getActiveSpan();
    if (!span) return null;

    const spanContext = span.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      flags: spanContext.traceFlags,
    };
  }

  /**
   * Print current trace tree to console
   */
  printTraceTree(): void {
    const activeTrace = this.getActiveTrace();
    if (!activeTrace) {
      console.log('🔍 [Trace Tree] No active trace');
      return;
    }

    console.group(`🌳 [Trace Tree] ${activeTrace.traceId}`);
    
    // Filter trace log for current trace
    const traceSpans = this.traceLog.filter(log => log.traceId === activeTrace.traceId);
    
    if (traceSpans.length === 0) {
      console.log('No spans recorded for this trace');
    } else {
      traceSpans.forEach((span, index) => {
        const indent = '  '.repeat(index);
        const statusIcon = span.status === 'ok' ? '✅' : '❌';
        const duration = span.duration.toFixed(2);
        
        console.log(`${indent}${statusIcon} ${span.operation} (${duration}ms)`);
        
        if (Object.keys(span.attributes).length > 0) {
          console.log(`${indent}   Attributes:`, span.attributes);
        }
        
        if (span.error) {
          console.log(`${indent}   Error: ${span.error}`);
        }
      });
    }
    
    console.groupEnd();
  }

  /**
   * Get current metrics summary
   */
  async getCurrentMetrics(): Promise<any> {
    // This would integrate with the metrics system to get current values
    return {
      traceCount: this.traceLog.length,
      errorRate: this.calculateErrorRate(),
      averageResponseTime: this.calculateAverageResponseTime(),
      topOperations: this.getTopOperations(),
      recentErrors: this.getRecentErrors(),
    };
  }

  /**
   * Clear trace log
   */
  clearTraceLog(): void {
    this.traceLog = [];
    console.log('🗑️  [Telemetry] Trace log cleared');
  }

  /**
   * Calculate error rate from trace log
   */
  private calculateErrorRate(): number {
    if (this.traceLog.length === 0) return 0;
    
    const errorCount = this.traceLog.filter(log => log.status === 'error').length;
    return (errorCount / this.traceLog.length) * 100;
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    if (this.traceLog.length === 0) return 0;
    
    const totalDuration = this.traceLog.reduce((sum, log) => sum + log.duration, 0);
    return totalDuration / this.traceLog.length;
  }

  /**
   * Get top operations by frequency
   */
  private getTopOperations(): Array<{ operation: string; count: number; avgDuration: number }> {
    const operationStats: Record<string, { count: number; totalDuration: number }> = {};
    
    this.traceLog.forEach(log => {
      if (!operationStats[log.operation]) {
        operationStats[log.operation] = { count: 0, totalDuration: 0 };
      }
      operationStats[log.operation].count++;
      operationStats[log.operation].totalDuration += log.duration;
    });
    
    return Object.entries(operationStats)
      .map(([operation, stats]) => ({
        operation,
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get recent errors
   */
  private getRecentErrors(): Array<{
    timestamp: Date;
    operation: string;
    error: string;
    traceId: string;
  }> {
    return this.traceLog
      .filter(log => log.status === 'error')
      .slice(-10)
      .map(log => ({
        timestamp: log.timestamp,
        operation: log.operation,
        error: log.error || 'Unknown error',
        traceId: log.traceId,
      }));
  }

  /**
   * Create performance measurement visualization
   */
  createPerformanceVisualization(measurements: PerformanceMeasurement[]): void {
    if (measurements.length === 0) return;

    console.group('📊 [Performance Visualization]');
    
    const sorted = measurements.sort((a, b) => b.duration - a.duration);
    const maxDuration = sorted[0].duration;
    
    sorted.forEach(measurement => {
      const percentage = (measurement.duration / maxDuration) * 100;
      const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
      
      console.log(`${measurement.name.padEnd(30)} ${bar} ${measurement.duration.toFixed(2)}ms`);
    });
    
    console.groupEnd();
  }

  /**
   * Monitor real-time telemetry data
   */
  startRealTimeMonitor(intervalMs: number = 5000): () => void {
    let intervalId: NodeJS.Timeout;
    
    const monitor = () => {
      console.group(`🔄 [Real-time Monitor] ${new Date().toLocaleTimeString()}`);
      
      const recentSpans = this.traceLog.filter(
        log => Date.now() - log.timestamp.getTime() < intervalMs
      );
      
      if (recentSpans.length > 0) {
        console.log(`📈 Spans in last ${intervalMs/1000}s: ${recentSpans.length}`);
        console.log(`⚡ Avg response time: ${this.calculateAverageResponseTime().toFixed(2)}ms`);
        console.log(`🚨 Error rate: ${this.calculateErrorRate().toFixed(2)}%`);
        
        const operations = this.getTopOperations().slice(0, 3);
        if (operations.length > 0) {
          console.log('🔥 Top operations:');
          operations.forEach(op => {
            console.log(`   ${op.operation}: ${op.count} calls, ${op.avgDuration.toFixed(2)}ms avg`);
          });
        }
      } else {
        console.log('💤 No activity in the last interval');
      }
      
      console.groupEnd();
    };
    
    console.log(`🚀 [Telemetry] Starting real-time monitor (${intervalMs/1000}s interval)`);
    monitor(); // Run immediately
    intervalId = setInterval(monitor, intervalMs);
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      console.log('🛑 [Telemetry] Real-time monitor stopped');
    };
  }

  /**
   * Export trace data for analysis
   */
  exportTraceData(): string {
    const data = {
      exportTimestamp: new Date().toISOString(),
      config: this.provider.config,
      traces: this.traceLog,
      summary: {
        totalSpans: this.traceLog.length,
        errorRate: this.calculateErrorRate(),
        averageResponseTime: this.calculateAverageResponseTime(),
        topOperations: this.getTopOperations(),
        timeRange: {
          start: this.traceLog[0]?.timestamp,
          end: this.traceLog[this.traceLog.length - 1]?.timestamp,
        },
      },
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generate telemetry health report
   */
  generateHealthReport(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    recommendations: string[];
    metrics: any;
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const errorRate = this.calculateErrorRate();
    const avgResponseTime = this.calculateAverageResponseTime();
    
    // Check error rate
    if (errorRate > 10) {
      issues.push(`High error rate: ${errorRate.toFixed(2)}%`);
      recommendations.push('Investigate recent errors and fix underlying issues');
    } else if (errorRate > 5) {
      issues.push(`Elevated error rate: ${errorRate.toFixed(2)}%`);
    }
    
    // Check response time
    if (avgResponseTime > 2000) {
      issues.push(`High average response time: ${avgResponseTime.toFixed(2)}ms`);
      recommendations.push('Optimize slow operations and consider caching');
    } else if (avgResponseTime > 1000) {
      issues.push(`Elevated response time: ${avgResponseTime.toFixed(2)}ms`);
    }
    
    // Check trace volume
    if (this.traceLog.length < 10) {
      issues.push('Low telemetry data volume - may indicate instrumentation issues');
      recommendations.push('Verify telemetry is properly configured and collecting data');
    }
    
    const status = issues.length === 0 ? 'healthy' : 
                   issues.some(i => i.includes('High')) ? 'unhealthy' : 'degraded';
    
    return {
      status,
      issues,
      recommendations,
      metrics: {
        errorRate,
        avgResponseTime,
        traceCount: this.traceLog.length,
        topOperations: this.getTopOperations().slice(0, 5),
      },
    };
  }
}

/**
 * Mock telemetry data generator for testing
 */
export class TelemetryMockData {
  /**
   * Generate mock trace data
   */
  static generateMockTraces(count: number = 50): any[] {
    const operations = [
      'habit.create',
      'habit.complete',
      'mood.create',
      'ai.enhance_habit',
      'api.claude',
      'db.firestore_query',
      'auth.sign_in',
      'component.dashboard',
    ];
    
    const traces = [];
    
    for (let i = 0; i < count; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const duration = Math.random() * 1000 + 50; // 50-1050ms
      const isError = Math.random() < 0.05; // 5% error rate
      
      traces.push({
        timestamp: new Date(Date.now() - Math.random() * 86400000), // Last 24 hours
        traceId: `trace-${i.toString().padStart(3, '0')}`,
        spanId: `span-${i.toString().padStart(3, '0')}`,
        operation,
        duration,
        status: isError ? 'error' : 'ok',
        error: isError ? 'Mock error for testing' : undefined,
        attributes: {
          'user.id': `user-${Math.floor(Math.random() * 10)}`,
          'component.name': operation.split('.')[0],
        },
      });
    }
    
    return traces.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  /**
   * Generate mock performance measurements
   */
  static generateMockPerformanceMeasurements(count: number = 20): PerformanceMeasurement[] {
    const operations = [
      'page_load',
      'api_call',
      'database_query',
      'ai_processing',
      'component_render',
    ];
    
    return Array.from({ length: count }, (_, i) => {
      const name = operations[Math.floor(Math.random() * operations.length)];
      const duration = Math.random() * 500 + 10; // 10-510ms
      
      return {
        name: `${name}_${i}`,
        startTime: performance.now(),
        endTime: performance.now() + duration,
        duration,
        attributes: {
          'test.mock': true,
          'test.index': i,
        },
      };
    });
  }
}

/**
 * Set up development tools
 */
export async function setupDevelopmentTools(provider: TelemetryProvider): Promise<TelemetryDevelopmentTools> {
  const devTools = new TelemetryDevelopmentTools(provider);
  
  console.log('🛠️  [Telemetry] Development tools initialized');
  
  // In development mode, start real-time monitoring
  if (provider.config.environment === 'development') {
    // Start monitoring with 10-second intervals
    devTools.startRealTimeMonitor(10000);
    
    // Generate some mock data for demonstration
    const mockTraces = TelemetryMockData.generateMockTraces(20);
    (devTools as any).traceLog.push(...mockTraces);
    
    console.log('📊 [Telemetry] Added mock data for development visualization');
  }
  
  return devTools;
}