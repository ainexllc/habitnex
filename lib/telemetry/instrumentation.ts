import { Instrumentation, InstrumentationBase, InstrumentationConfig } from '@opentelemetry/instrumentation';
import { trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { NextVibeSpanAttributes } from './types';
import { getMetrics } from './metrics';

/**
 * NextVibe custom instrumentation configuration
 */
export interface NextVibeInstrumentationConfig extends InstrumentationConfig {
  /** Enable habit tracking instrumentation */
  enableHabitInstrumentation?: boolean;
  /** Enable mood tracking instrumentation */
  enableMoodInstrumentation?: boolean;
  /** Enable AI feature instrumentation */
  enableAIInstrumentation?: boolean;
  /** Enable authentication instrumentation */
  enableAuthInstrumentation?: boolean;
  /** Enable component performance instrumentation */
  enableComponentInstrumentation?: boolean;
  /** Enable business metrics collection */
  enableBusinessMetrics?: boolean;
}

/**
 * Custom instrumentation for NextVibe application
 */
export class NextVibeInstrumentation extends InstrumentationBase<NextVibeInstrumentationConfig> {
  protected override _config!: NextVibeInstrumentationConfig;

  constructor(config: NextVibeInstrumentationConfig = {}) {
    super('nextvibe-instrumentation', '1.0.0', {
      enableHabitInstrumentation: true,
      enableMoodInstrumentation: true,
      enableAIInstrumentation: true,
      enableAuthInstrumentation: true,
      enableComponentInstrumentation: true,
      enableBusinessMetrics: true,
      ...config,
    });
  }

  protected init(): void {
    if (this._config.enableHabitInstrumentation) {
      this.instrumentHabitOperations();
    }
    
    if (this._config.enableMoodInstrumentation) {
      this.instrumentMoodOperations();
    }
    
    if (this._config.enableAIInstrumentation) {
      this.instrumentAIOperations();
    }
    
    if (this._config.enableAuthInstrumentation) {
      this.instrumentAuthOperations();
    }
    
    if (this._config.enableComponentInstrumentation) {
      this.instrumentComponentOperations();
    }
  }

  /**
   * Instrument habit-related operations
   */
  private instrumentHabitOperations(): void {
    // This would typically patch relevant modules/functions
    // For demo purposes, we'll create wrapper functions that can be used
    
    this._wrap('habit-operations', 'createHabit', (original: Function) => {
      return function(this: any, ...args: any[]) {
        const span = trace.getActiveTracer('nextvibe').startSpan('habit.create', {
          kind: SpanKind.INTERNAL,
          attributes: {
            'component.type': 'business_logic',
            'habit.operation': 'create',
          },
        });

        const startTime = Date.now();

        try {
          const result = original.apply(this, args);
          
          // If it's a promise, handle async
          if (result && typeof result.then === 'function') {
            return result
              .then((res: any) => {
                const duration = Date.now() - startTime;
                this.recordHabitSuccess(span, 'create', duration, res);
                return res;
              })
              .catch((error: any) => {
                const duration = Date.now() - startTime;
                this.recordHabitError(span, 'create', duration, error);
                throw error;
              })
              .finally(() => {
                span.end();
              });
          }
          
          // Synchronous result
          const duration = Date.now() - startTime;
          this.recordHabitSuccess(span, 'create', duration, result);
          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          this.recordHabitError(span, 'create', duration, error);
          throw error;
        } finally {
          if (!result || typeof result.then !== 'function') {
            span.end();
          }
        }
      }.bind(this);
    });
  }

  /**
   * Instrument mood-related operations
   */
  private instrumentMoodOperations(): void {
    this._wrap('mood-operations', 'createMoodEntry', (original: Function) => {
      return function(this: any, ...args: any[]) {
        const moodData = args[0];
        const span = trace.getActiveTracer('nextvibe').startSpan('mood.create', {
          kind: SpanKind.INTERNAL,
          attributes: {
            'component.type': 'business_logic',
            'mood.operation': 'create',
            'mood.rating': moodData?.rating,
          },
        });

        const startTime = Date.now();

        try {
          const result = original.apply(this, args);
          
          if (result && typeof result.then === 'function') {
            return result
              .then((res: any) => {
                const duration = Date.now() - startTime;
                this.recordMoodSuccess(span, 'create', duration, res, moodData?.rating);
                return res;
              })
              .catch((error: any) => {
                const duration = Date.now() - startTime;
                this.recordMoodError(span, 'create', duration, error);
                throw error;
              })
              .finally(() => {
                span.end();
              });
          }
          
          const duration = Date.now() - startTime;
          this.recordMoodSuccess(span, 'create', duration, result, moodData?.rating);
          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          this.recordMoodError(span, 'create', duration, error);
          throw error;
        } finally {
          if (!result || typeof result.then !== 'function') {
            span.end();
          }
        }
      }.bind(this);
    });
  }

  /**
   * Instrument AI operations
   */
  private instrumentAIOperations(): void {
    this._wrap('ai-operations', 'callClaudeAPI', (original: Function) => {
      return function(this: any, ...args: any[]) {
        const [feature, prompt] = args;
        const span = trace.getActiveTracer('nextvibe').startSpan('ai.claude_api_call', {
          kind: SpanKind.CLIENT,
          attributes: {
            'component.type': 'ai',
            'ai.feature': feature,
            'ai.model': 'claude',
            'ai.provider': 'anthropic',
          },
        });

        const startTime = Date.now();

        try {
          const result = original.apply(this, args);
          
          if (result && typeof result.then === 'function') {
            return result
              .then((res: any) => {
                const duration = Date.now() - startTime;
                this.recordAISuccess(span, feature, duration, res);
                return res;
              })
              .catch((error: any) => {
                const duration = Date.now() - startTime;
                this.recordAIError(span, feature, duration, error);
                throw error;
              })
              .finally(() => {
                span.end();
              });
          }
          
          const duration = Date.now() - startTime;
          this.recordAISuccess(span, feature, duration, result);
          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          this.recordAIError(span, feature, duration, error);
          throw error;
        } finally {
          if (!result || typeof result.then !== 'function') {
            span.end();
          }
        }
      }.bind(this);
    });
  }

  /**
   * Instrument authentication operations
   */
  private instrumentAuthOperations(): void {
    this._wrap('auth-operations', 'signIn', (original: Function) => {
      return function(this: any, ...args: any[]) {
        const [provider] = args;
        const span = trace.getActiveTracer('nextvibe').startSpan('auth.sign_in', {
          kind: SpanKind.INTERNAL,
          attributes: {
            'component.type': 'auth',
            'auth.operation': 'sign_in',
            'auth.provider': provider,
          },
        });

        const startTime = Date.now();

        try {
          const result = original.apply(this, args);
          
          if (result && typeof result.then === 'function') {
            return result
              .then((res: any) => {
                const duration = Date.now() - startTime;
                this.recordAuthSuccess(span, 'sign_in', duration, res);
                return res;
              })
              .catch((error: any) => {
                const duration = Date.now() - startTime;
                this.recordAuthError(span, 'sign_in', duration, error);
                throw error;
              })
              .finally(() => {
                span.end();
              });
          }
          
          const duration = Date.now() - startTime;
          this.recordAuthSuccess(span, 'sign_in', duration, result);
          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          this.recordAuthError(span, 'sign_in', duration, error);
          throw error;
        } finally {
          if (!result || typeof result.then !== 'function') {
            span.end();
          }
        }
      }.bind(this);
    });
  }

  /**
   * Instrument component operations
   */
  private instrumentComponentOperations(): void {
    // This would typically instrument React components
    // For now, we provide a manual instrumentation helper
    this.instrumentReactComponents();
  }

  /**
   * Helper to manually instrument React components
   */
  private instrumentReactComponents(): void {
    // Create a higher-order component for instrumentation
    if (typeof window !== 'undefined') {
      // Client-side component instrumentation
      (window as any).instrumentComponent = (WrappedComponent: any, componentName: string) => {
        return function InstrumentedComponent(props: any) {
          const span = trace.getActiveTracer('nextvibe').startSpan(`component.${componentName}`, {
            kind: SpanKind.INTERNAL,
            attributes: {
              'component.type': 'page',
              'component.name': componentName,
            },
          });

          const startTime = performance.now();

          try {
            const result = WrappedComponent(props);
            
            // Record render time
            const renderTime = performance.now() - startTime;
            span.setAttributes({
              'component.render_time_ms': renderTime,
            });
            
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
            
          } catch (error) {
            span.recordException(error as Error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: (error as Error).message,
            });
            throw error;
          } finally {
            span.end();
          }
        };
      };
    }
  }

  /**
   * Record successful habit operation
   */
  private recordHabitSuccess(
    span: any,
    operation: string,
    duration: number,
    result: any
  ): void {
    span.setAttributes({
      'habit.operation_duration_ms': duration,
      'habit.success': true,
    });
    
    span.setStatus({ code: SpanStatusCode.OK });
    
    // Record business metrics
    if (this._config.enableBusinessMetrics) {
      const metrics = getMetrics();
      if (metrics && operation === 'create') {
        metrics.recordHabitCompletion({
          'habit.id': result?.id,
          'habit.name': result?.name,
        });
      }
    }
  }

  /**
   * Record habit operation error
   */
  private recordHabitError(
    span: any,
    operation: string,
    duration: number,
    error: any
  ): void {
    span.setAttributes({
      'habit.operation_duration_ms': duration,
      'habit.success': false,
      'error.message': error?.message || 'Unknown error',
    });
    
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error?.message || 'Habit operation failed',
    });
    
    // Record error metrics
    const metrics = getMetrics();
    if (metrics) {
      metrics.recordError('habit_operation_error', operation, {
        'habit.operation': operation,
      });
    }
  }

  /**
   * Record successful mood operation
   */
  private recordMoodSuccess(
    span: any,
    operation: string,
    duration: number,
    result: any,
    rating?: number
  ): void {
    span.setAttributes({
      'mood.operation_duration_ms': duration,
      'mood.success': true,
    });
    
    span.setStatus({ code: SpanStatusCode.OK });
    
    // Record business metrics
    if (this._config.enableBusinessMetrics && operation === 'create' && rating) {
      const metrics = getMetrics();
      if (metrics) {
        metrics.recordMoodEntry(rating, {
          'mood.id': result?.id,
        });
      }
    }
  }

  /**
   * Record mood operation error
   */
  private recordMoodError(
    span: any,
    operation: string,
    duration: number,
    error: any
  ): void {
    span.setAttributes({
      'mood.operation_duration_ms': duration,
      'mood.success': false,
      'error.message': error?.message || 'Unknown error',
    });
    
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error?.message || 'Mood operation failed',
    });
    
    // Record error metrics
    const metrics = getMetrics();
    if (metrics) {
      metrics.recordError('mood_operation_error', operation, {
        'mood.operation': operation,
      });
    }
  }

  /**
   * Record successful AI operation
   */
  private recordAISuccess(
    span: any,
    feature: string,
    duration: number,
    result: any
  ): void {
    const inputTokens = result?.usage?.inputTokens || 0;
    const outputTokens = result?.usage?.outputTokens || 0;
    const cost = result?.cost || 0;

    span.setAttributes({
      'ai.response_time_ms': duration,
      'ai.tokens.input': inputTokens,
      'ai.tokens.output': outputTokens,
      'ai.cost': cost,
      'ai.success': true,
    });
    
    span.setStatus({ code: SpanStatusCode.OK });
    
    // Record business metrics
    if (this._config.enableBusinessMetrics) {
      const metrics = getMetrics();
      if (metrics) {
        metrics.recordAIFeatureUsage(feature, {
          'ai.feature': feature,
          'ai.model': 'claude',
        });
        
        if (inputTokens && outputTokens && cost) {
          metrics.recordClaudeApiUsage(inputTokens, outputTokens, cost, {
            'ai.feature': feature,
          });
        }
      }
    }
  }

  /**
   * Record AI operation error
   */
  private recordAIError(
    span: any,
    feature: string,
    duration: number,
    error: any
  ): void {
    span.setAttributes({
      'ai.response_time_ms': duration,
      'ai.success': false,
      'error.message': error?.message || 'Unknown error',
    });
    
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error?.message || 'AI operation failed',
    });
    
    // Record error metrics
    const metrics = getMetrics();
    if (metrics) {
      metrics.recordError('ai_operation_error', feature, {
        'ai.feature': feature,
      });
    }
  }

  /**
   * Record successful auth operation
   */
  private recordAuthSuccess(
    span: any,
    operation: string,
    duration: number,
    result: any
  ): void {
    span.setAttributes({
      'auth.operation_duration_ms': duration,
      'auth.success': true,
      'user.id': result?.uid || result?.user?.uid,
    });
    
    span.setStatus({ code: SpanStatusCode.OK });
  }

  /**
   * Record auth operation error
   */
  private recordAuthError(
    span: any,
    operation: string,
    duration: number,
    error: any
  ): void {
    span.setAttributes({
      'auth.operation_duration_ms': duration,
      'auth.success': false,
      'error.message': error?.message || 'Unknown error',
    });
    
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error?.message || 'Auth operation failed',
    });
    
    // Record error metrics
    const metrics = getMetrics();
    if (metrics) {
      metrics.recordError('auth_error', operation, {
        'auth.operation': operation,
      });
    }
  }

  /**
   * Manual instrumentation helpers for use in components
   */
  static createInstrumentationHelpers() {
    return {
      /**
       * Instrument a habit operation
       */
      instrumentHabitOperation: async <T>(
        operation: string,
        fn: () => Promise<T> | T,
        attributes: NextVibeSpanAttributes = {}
      ): Promise<T> => {
        const span = trace.getActiveTracer('nextvibe').startSpan(`habit.${operation}`, {
          kind: SpanKind.INTERNAL,
          attributes: {
            'component.type': 'business_logic',
            'habit.operation': operation,
            ...attributes,
          },
        });

        const startTime = Date.now();

        try {
          const result = await fn();
          
          const duration = Date.now() - startTime;
          span.setAttributes({
            'habit.operation_duration_ms': duration,
            'habit.success': true,
          });
          
          span.setStatus({ code: SpanStatusCode.OK });
          
          // Record metrics
          const metrics = getMetrics();
          if (metrics && operation === 'complete') {
            metrics.recordHabitCompletion(attributes);
          }
          
          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          span.setAttributes({
            'habit.operation_duration_ms': duration,
            'habit.success': false,
          });
          
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message,
          });
          
          throw error;
        } finally {
          span.end();
        }
      },

      /**
       * Instrument a mood operation
       */
      instrumentMoodOperation: async <T>(
        operation: string,
        fn: () => Promise<T> | T,
        attributes: NextVibeSpanAttributes = {}
      ): Promise<T> => {
        const span = trace.getActiveTracer('nextvibe').startSpan(`mood.${operation}`, {
          kind: SpanKind.INTERNAL,
          attributes: {
            'component.type': 'business_logic',
            'mood.operation': operation,
            ...attributes,
          },
        });

        const startTime = Date.now();

        try {
          const result = await fn();
          
          const duration = Date.now() - startTime;
          span.setAttributes({
            'mood.operation_duration_ms': duration,
            'mood.success': true,
          });
          
          span.setStatus({ code: SpanStatusCode.OK });
          
          // Record metrics
          const metrics = getMetrics();
          if (metrics && operation === 'create' && attributes['mood.rating']) {
            metrics.recordMoodEntry(attributes['mood.rating'] as number, attributes);
          }
          
          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          span.setAttributes({
            'mood.operation_duration_ms': duration,
            'mood.success': false,
          });
          
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message,
          });
          
          throw error;
        } finally {
          span.end();
        }
      },

      /**
       * Instrument an AI operation
       */
      instrumentAIOperation: async <T>(
        feature: string,
        fn: () => Promise<T> | T,
        attributes: NextVibeSpanAttributes = {}
      ): Promise<T> => {
        const span = trace.getActiveTracer('nextvibe').startSpan(`ai.${feature}`, {
          kind: SpanKind.CLIENT,
          attributes: {
            'component.type': 'ai',
            'ai.feature': feature,
            'ai.model': 'claude',
            ...attributes,
          },
        });

        const startTime = Date.now();

        try {
          const result = await fn();
          
          const duration = Date.now() - startTime;
          span.setAttributes({
            'ai.response_time_ms': duration,
            'ai.success': true,
          });
          
          span.setStatus({ code: SpanStatusCode.OK });
          
          // Record metrics
          const metrics = getMetrics();
          if (metrics) {
            metrics.recordAIFeatureUsage(feature, attributes);
          }
          
          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          span.setAttributes({
            'ai.response_time_ms': duration,
            'ai.success': false,
          });
          
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message,
          });
          
          throw error;
        } finally {
          span.end();
        }
      },
    };
  }
}

/**
 * Export instrumentation helpers for manual use
 */
export const instrumentationHelpers = NextVibeInstrumentation.createInstrumentationHelpers();