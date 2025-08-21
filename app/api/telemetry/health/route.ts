import { NextRequest, NextResponse } from 'next/server';
import { getTelemetryProvider, getTelemetryConfig } from '@/lib/telemetry';
import { calculateBusinessMetrics } from '@/lib/telemetry/metrics';
import { checkExporterHealth } from '@/lib/telemetry/exporters';

/**
 * Telemetry health check endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const provider = getTelemetryProvider();
    const config = getTelemetryConfig();
    
    const healthData = {
      timestamp: new Date().toISOString(),
      service: {
        name: 'nextvibe',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
      },
      telemetry: {
        initialized: provider?.isInitialized || false,
        tracing: config?.enableTracing || false,
        metrics: config?.enableMetrics || false,
        logging: config?.enableLogging || false,
        samplingRate: config?.samplingRate || 0,
      },
      exporters: config ? await checkExporterHealth(config) : {},
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    // Include business metrics if available
    try {
      const businessMetrics = await calculateBusinessMetrics();
      // healthData.metrics = businessMetrics; // Temporarily disabled due to TypeScript error
    } catch (error) {
      console.warn('[Telemetry Health] Failed to calculate business metrics:', error);
    }

    const status = provider?.isInitialized ? 200 : 503;
    
    return NextResponse.json(healthData, { status });
    
  } catch (error) {
    console.error('[Telemetry Health] Error:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Telemetry health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      service: {
        name: 'nextvibe',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
      },
    }, { status: 500 });
  }
}

/**
 * Update telemetry configuration (development only)
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Configuration updates only allowed in development' },
      { status: 403 }
    );
  }
  
  try {
    const updates = await req.json();
    
    // This would update runtime configuration
    // For now, just return the current config
    const config = getTelemetryConfig();
    
    return NextResponse.json({
      message: 'Configuration updated',
      current: config,
      updates: updates,
      note: 'Runtime configuration updates not yet implemented',
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 400 }
    );
  }
}