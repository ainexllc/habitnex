import { 
  trace, 
  context, 
  Span, 
  SpanKind, 
  SpanStatusCode, 
  Tracer 
} from '@opentelemetry/api';
import { HabitNexSpanAttributes, TraceContext, PerformanceMeasurement } from './types';
import { createTracer } from './index';

/**
 * HabitNex distributed tracing utilities
 */
export class HabitNexTracing {
  private tracer: Tracer;

  constructor(name: string = 'habitnex-tracing') {
    this.tracer = createTracer(name);
  }

  /**
   * Create a new span for a user journey
   */
  startUserJourneySpan(
    journeyName: string,
    userId?: string,
    attributes: HabitNexSpanAttributes = {}
  ): Span {
    const span = this.tracer.startSpan(`user_journey.${journeyName}`, {
      kind: SpanKind.SERVER,
      attributes: {
        'user.id': userId,
        'journey.name': journeyName,
        'component.type': 'user_journey',
        ...attributes,
      },
    });

    return span;
  }

  /**
   * Create a span for API operations
   */
  startApiSpan(
    endpoint: string,
    method: string,
    attributes: HabitNexSpanAttributes = {}
  ): Span {
    const span = this.tracer.startSpan(`api.${endpoint}`, {
      kind: SpanKind.SERVER,
      attributes: {
        'api.endpoint': endpoint,
        'api.method': method,
        'component.type': 'api',
        'http.method': method,
        'http.route': endpoint,
        ...attributes,
      },
    });

    return span;
  }

  /**
   * Create a span for database operations
   */
  startDatabaseSpan(
    operation: string,
    collection: string,
    documentId?: string,
    attributes: HabitNexSpanAttributes = {}
  ): Span {
    const span = this.tracer.startSpan(`db.${operation}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        'db.operation': operation,
        'db.collection': collection,
        'db.document_id': documentId,
        'db.system': 'firestore',
        'component.type': 'database',
        ...attributes,
      },
    });

    return span;
  }

  /**
   * Create a span for AI operations
   */
  startAISpan(
    feature: string,
    model: string = 'claude',
    attributes: HabitNexSpanAttributes = {}
  ): Span {
    const span = this.tracer.startSpan(`ai.${feature}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        'ai.feature': feature,
        'ai.model': model,
        'ai.provider': 'anthropic',
        'component.type': 'ai',
        ...attributes,
      },
    });

    return span;
  }

  /**
   * Create a span for component rendering
   */
  startComponentSpan(
    componentName: string,
    componentType: 'page' | 'component' | 'hook' = 'component',
    attributes: HabitNexSpanAttributes = {}
  ): Span {
    const span = this.tracer.startSpan(`component.${componentName}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'component.name': componentName,
        'component.type': componentType,
        ...attributes,
      },
    });

    return span;
  }

  /**
   * Create a span for habit operations
   */
  startHabitSpan(
    operation: string,
    habitId?: string,
    habitName?: string,
    attributes: HabitNexSpanAttributes = {}
  ): Span {
    const span = this.tracer.startSpan(`habit.${operation}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'habit.operation': operation,
        'habit.id': habitId,
        'habit.name': habitName,
        'component.type': 'business_logic',
        ...attributes,
      },
    });

    return span;
  }

  /**
   * Create a span for mood operations
   */
  startMoodSpan(
    operation: string,
    moodId?: string,
    rating?: number,
    attributes: HabitNexSpanAttributes = {}
  ): Span {
    const span = this.tracer.startSpan(`mood.${operation}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'mood.operation': operation,
        'mood.id': moodId,
        'mood.rating': rating,
        'component.type': 'business_logic',
        ...attributes,
      },
    });

    return span;
  }

  /**
   * Add custom attributes to current span
   */
  addAttributes(attributes: HabitNexSpanAttributes): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  }

  /**
   * Add an event to current span
   */
  addEvent(name: string, attributes?: HabitNexSpanAttributes): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent(name, attributes);
    }
  }

  /**
   * Record an exception in current span
   */
  recordException(error: Error, attributes?: HabitNexSpanAttributes): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      
      if (attributes) {
        span.setAttributes(attributes);
      }
    }
  }

  /**
   * Set span status
   */
  setSpanStatus(code: SpanStatusCode, message?: string): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.setStatus({ code, message });
    }
  }

  /**
   * Execute function within a span context
   */
  async withSpan<T>(
    spanName: string,
    fn: (span: Span) => Promise<T> | T,
    attributes: HabitNexSpanAttributes = {},
    spanKind: SpanKind = SpanKind.INTERNAL
  ): Promise<T> {
    const span = this.tracer.startSpan(spanName, {
      kind: spanKind,
      attributes,
    });

    try {
      return await context.with(trace.setSpan(context.active(), span), () => fn(span));
    } catch (error) {
      this.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Execute function within a user journey context
   */
  async withUserJourney<T>(
    journeyName: string,
    userId: string,
    fn: (span: Span) => Promise<T> | T,
    attributes: HabitNexSpanAttributes = {}
  ): Promise<T> {
    const span = this.startUserJourneySpan(journeyName, userId, attributes);

    try {
      return await context.with(trace.setSpan(context.active(), span), () => fn(span));
    } catch (error) {
      this.recordException(error as Error, {
        'user.id': userId,
        'journey.name': journeyName,
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Execute function within an API span context
   */
  async withApiSpan<T>(
    endpoint: string,
    method: string,
    fn: (span: Span) => Promise<T> | T,
    attributes: HabitNexSpanAttributes = {}
  ): Promise<T> {
    const span = this.startApiSpan(endpoint, method, attributes);

    try {
      const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      this.recordException(error as Error, {
        'api.endpoint': endpoint,
        'api.method': method,
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Execute function within a database span context
   */
  async withDatabaseSpan<T>(
    operation: string,
    collection: string,
    fn: (span: Span) => Promise<T> | T,
    documentId?: string,
    attributes: HabitNexSpanAttributes = {}
  ): Promise<T> {
    const span = this.startDatabaseSpan(operation, collection, documentId, attributes);
    const startTime = Date.now();

    try {
      const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
      
      const duration = Date.now() - startTime;
      span.setAttributes({
        'db.query_duration': duration,
      });
      
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordException(error as Error, {
        'db.operation': operation,
        'db.collection': collection,
        'db.query_duration': duration,
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Execute function within an AI span context
   */
  async withAISpan<T>(
    feature: string,
    fn: (span: Span) => Promise<T> | T,
    model: string = 'claude',
    attributes: HabitNexSpanAttributes = {}
  ): Promise<T> {
    const span = this.startAISpan(feature, model, attributes);
    const startTime = Date.now();

    try {
      const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
      
      const duration = Date.now() - startTime;
      span.setAttributes({
        'ai.response_time': duration,
      });
      
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordException(error as Error, {
        'ai.feature': feature,
        'ai.model': model,
        'ai.response_time': duration,
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Get current trace context
   */
  getCurrentTraceContext(): TraceContext | null {
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
   * Create child span from current context
   */
  createChildSpan(
    name: string,
    attributes: HabitNexSpanAttributes = {},
    spanKind: SpanKind = SpanKind.INTERNAL
  ): Span {
    return this.tracer.startSpan(name, {
      kind: spanKind,
      attributes,
    });
  }

  /**
   * Measure performance of a function
   */
  async measurePerformance<T>(
    name: string,
    fn: () => Promise<T> | T,
    attributes: HabitNexSpanAttributes = {}
  ): Promise<{ result: T; measurement: PerformanceMeasurement }> {
    const startTime = performance.now();
    
    try {
      const result = await this.withSpan(`performance.${name}`, async (span) => {
        return fn();
      }, attributes);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const measurement: PerformanceMeasurement = {
        name,
        startTime,
        endTime,
        duration,
        attributes,
      };
      
      return { result, measurement };
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const measurement: PerformanceMeasurement = {
        name,
        startTime,
        endTime,
        duration,
        attributes: {
          ...attributes,
          'error.occurred': true,
          'error.message': error instanceof Error ? error.message : 'Unknown error',
        },
      };
      
      throw { error, measurement };
    }
  }
}

/**
 * Global tracing instance
 */
let globalTracing: HabitNexTracing | null = null;

/**
 * Get global tracing instance
 */
export function getTracing(): HabitNexTracing {
  if (!globalTracing) {
    globalTracing = new HabitNexTracing();
  }
  return globalTracing;
}

/**
 * Convenience functions for common operations
 */
export const tracing = {
  startUserJourney: (journeyName: string, userId?: string, attributes?: HabitNexSpanAttributes) => 
    getTracing().startUserJourneySpan(journeyName, userId, attributes),
    
  startApi: (endpoint: string, method: string, attributes?: HabitNexSpanAttributes) =>
    getTracing().startApiSpan(endpoint, method, attributes),
    
  startDatabase: (operation: string, collection: string, documentId?: string, attributes?: HabitNexSpanAttributes) =>
    getTracing().startDatabaseSpan(operation, collection, documentId, attributes),
    
  startAI: (feature: string, model?: string, attributes?: HabitNexSpanAttributes) =>
    getTracing().startAISpan(feature, model, attributes),
    
  startComponent: (componentName: string, componentType?: 'page' | 'component' | 'hook', attributes?: HabitNexSpanAttributes) =>
    getTracing().startComponentSpan(componentName, componentType, attributes),
    
  startHabit: (operation: string, habitId?: string, habitName?: string, attributes?: HabitNexSpanAttributes) =>
    getTracing().startHabitSpan(operation, habitId, habitName, attributes),
    
  startMood: (operation: string, moodId?: string, rating?: number, attributes?: HabitNexSpanAttributes) =>
    getTracing().startMoodSpan(operation, moodId, rating, attributes),
    
  addAttributes: (attributes: HabitNexSpanAttributes) => getTracing().addAttributes(attributes),
  
  addEvent: (name: string, attributes?: HabitNexSpanAttributes) => getTracing().addEvent(name, attributes),
  
  recordException: (error: Error, attributes?: HabitNexSpanAttributes) => getTracing().recordException(error, attributes),
  
  setStatus: (code: SpanStatusCode, message?: string) => getTracing().setSpanStatus(code, message),
  
  withSpan: <T>(spanName: string, fn: (span: Span) => Promise<T> | T, attributes?: HabitNexSpanAttributes, spanKind?: SpanKind) =>
    getTracing().withSpan(spanName, fn, attributes, spanKind),
    
  withUserJourney: <T>(journeyName: string, userId: string, fn: (span: Span) => Promise<T> | T, attributes?: HabitNexSpanAttributes) =>
    getTracing().withUserJourney(journeyName, userId, fn, attributes),
    
  withApi: <T>(endpoint: string, method: string, fn: (span: Span) => Promise<T> | T, attributes?: HabitNexSpanAttributes) =>
    getTracing().withApiSpan(endpoint, method, fn, attributes),
    
  withDatabase: <T>(operation: string, collection: string, fn: (span: Span) => Promise<T> | T, documentId?: string, attributes?: HabitNexSpanAttributes) =>
    getTracing().withDatabaseSpan(operation, collection, fn, documentId, attributes),
    
  withAI: <T>(feature: string, fn: (span: Span) => Promise<T> | T, model?: string, attributes?: HabitNexSpanAttributes) =>
    getTracing().withAISpan(feature, fn, model, attributes),
    
  measurePerformance: <T>(name: string, fn: () => Promise<T> | T, attributes?: HabitNexSpanAttributes) =>
    getTracing().measurePerformance(name, fn, attributes),
    
  getCurrentContext: () => getTracing().getCurrentTraceContext(),
};