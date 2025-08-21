/**
 * Client-side telemetry utilities for NextVibe
 * Handles browser-specific telemetry, RUM data, and Web Vitals
 */

import { NextVibeSpanAttributes, RUMData, MetricEvent } from './types';

/**
 * Client-side telemetry manager
 */
export class ClientTelemetry {
  private sessionId: string;
  private userId?: string;
  private performanceObserver?: PerformanceObserver;
  private vitalsData: Partial<RUMData['vitals']> = {};
  private interactions: RUMData['interactions'] = [];
  private errors: RUMData['errors'] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeClientTelemetry();
  }

  /**
   * Initialize client-side telemetry
   */
  private initializeClientTelemetry(): void {
    if (typeof window === 'undefined') return;

    // Set up error tracking
    this.setupErrorTracking();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
    
    // Set up Web Vitals tracking
    this.setupWebVitalsTracking();
    
    // Set up interaction tracking
    this.setupInteractionTracking();
    
    // Set up page visibility tracking
    this.setupVisibilityTracking();
    
    // Set up beforeunload handler
    this.setupBeforeUnloadTracking();

    console.log('[Client Telemetry] Initialized with session:', this.sessionId);
  }

  /**
   * Set user context
   */
  setUser(userId: string, userAttributes: Record<string, any> = {}): void {
    this.userId = userId;
    
    // Send user context to server if needed
    this.sendEvent('user.identified', {
      userId,
      sessionId: this.sessionId,
      ...userAttributes,
    });
  }

  /**
   * Track page view
   */
  trackPageView(page: string, attributes: NextVibeSpanAttributes = {}): void {
    const pageViewData = {
      page,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      ...attributes,
    };

    this.sendEvent('page.view', pageViewData);
    
    // Reset interaction tracking for new page
    this.interactions = [];
    this.vitalsData = {};
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, attributes: NextVibeSpanAttributes = {}): void {
    const eventData = {
      event: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      ...attributes,
    };

    this.sendEvent('custom.event', eventData);
  }

  /**
   * Track habit operation
   */
  trackHabitOperation(
    operation: 'create' | 'complete' | 'edit' | 'delete',
    habitId: string,
    attributes: NextVibeSpanAttributes = {}
  ): void {
    this.trackEvent('habit.operation', {
      'habit.operation': operation,
      'habit.id': habitId,
      ...attributes,
    });
  }

  /**
   * Track mood entry
   */
  trackMoodEntry(rating: number, attributes: NextVibeSpanAttributes = {}): void {
    this.trackEvent('mood.entry', {
      'mood.rating': rating,
      ...attributes,
    });
  }

  /**
   * Track AI feature usage
   */
  trackAIFeature(feature: string, attributes: NextVibeSpanAttributes = {}): void {
    this.trackEvent('ai.feature', {
      'ai.feature': feature,
      ...attributes,
    });
  }

  /**
   * Track component performance
   */
  trackComponentPerformance(
    componentName: string,
    operation: 'mount' | 'update' | 'unmount',
    duration?: number,
    attributes: NextVibeSpanAttributes = {}
  ): void {
    this.trackEvent('component.performance', {
      'component.name': componentName,
      'component.operation': operation,
      'component.duration_ms': duration,
      ...attributes,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(
    type: 'click' | 'scroll' | 'input' | 'focus' | 'keypress',
    target: string,
    attributes: NextVibeSpanAttributes = {}
  ): void {
    const interaction = {
      type,
      target,
      timestamp: new Date(),
      duration: 0,
    };
    
    this.interactions.push(interaction);
    
    this.trackEvent('user.interaction', {
      'interaction.type': type,
      'interaction.target': target,
      ...attributes,
    });
  }

  /**
   * Set up error tracking
   */
  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      const error = {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack || 'No stack trace',
        timestamp: new Date(),
      };
      
      this.errors.push(error);
      
      this.sendEvent('error.javascript', {
        'error.message': error.message,
        'error.source': error.source,
        'error.line': error.lineno,
        'error.column': error.colno,
        'error.stack': error.error,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = {
        message: event.reason?.message || 'Unhandled promise rejection',
        source: window.location.href,
        lineno: 0,
        colno: 0,
        error: event.reason?.stack || 'No stack trace',
        timestamp: new Date(),
      };
      
      this.errors.push(error);
      
      this.sendEvent('error.promise', {
        'error.message': error.message,
        'error.type': 'unhandled_promise_rejection',
        'error.stack': error.error,
      });
    });
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    // Navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          this.sendEvent('performance.navigation', {
            'performance.dns_time': navEntry.domainLookupEnd - navEntry.domainLookupStart,
            'performance.connect_time': navEntry.connectEnd - navEntry.connectStart,
            'performance.request_time': navEntry.responseStart - navEntry.requestStart,
            'performance.response_time': navEntry.responseEnd - navEntry.responseStart,
            'performance.dom_load_time': navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            'performance.window_load_time': navEntry.loadEventEnd - navEntry.loadEventStart,
            'performance.total_time': navEntry.loadEventEnd - navEntry.fetchStart,
          });
        }
      });
    });
    
    navigationObserver.observe({ entryTypes: ['navigation'] });

    // Resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Only track significant resources
          if (resourceEntry.duration > 100) {
            this.sendEvent('performance.resource', {
              'resource.name': resourceEntry.name,
              'resource.type': resourceEntry.initiatorType,
              'resource.size': resourceEntry.transferSize || 0,
              'resource.duration': resourceEntry.duration,
              'resource.cache_hit': resourceEntry.transferSize === 0,
            });
          }
        }
      });
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  /**
   * Set up Web Vitals tracking
   */
  private setupWebVitalsTracking(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.vitalsData.lcp = lastEntry.startTime;
        
        this.sendEvent('web_vitals.lcp', {
          'vitals.lcp': lastEntry.startTime,
          'vitals.element': (lastEntry as any).element?.tagName || 'unknown',
        });
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.vitalsData.fid = (entry as any).processingStart - entry.startTime;
          
          this.sendEvent('web_vitals.fid', {
            'vitals.fid': this.vitalsData.fid,
            'vitals.event_type': (entry as any).name,
          });
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        
        this.vitalsData.cls = clsValue;
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
      // Send CLS on page unload
      window.addEventListener('beforeunload', () => {
        if (clsValue > 0) {
          this.sendEvent('web_vitals.cls', {
            'vitals.cls': clsValue,
          });
        }
      });
    }
  }

  /**
   * Set up interaction tracking
   */
  private setupInteractionTracking(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const targetInfo = this.getElementInfo(target);
      
      this.trackInteraction('click', targetInfo, {
        'interaction.x': event.clientX,
        'interaction.y': event.clientY,
      });
    });

    // Input tracking
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      const targetInfo = this.getElementInfo(target);
      
      this.trackInteraction('input', targetInfo, {
        'interaction.input_type': target.type || 'unknown',
      });
    });

    // Scroll tracking (throttled)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackInteraction('scroll', 'document', {
          'interaction.scroll_y': window.scrollY,
          'interaction.scroll_x': window.scrollX,
        });
      }, 100);
    });
  }

  /**
   * Set up page visibility tracking
   */
  private setupVisibilityTracking(): void {
    let visibilityStart = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const duration = Date.now() - visibilityStart;
        
        this.sendEvent('page.hidden', {
          'page.visible_duration_ms': duration,
        });
      } else {
        visibilityStart = Date.now();
        
        this.sendEvent('page.visible', {
          'page.return_timestamp': visibilityStart,
        });
      }
    });
  }

  /**
   * Set up beforeunload tracking
   */
  private setupBeforeUnloadTracking(): void {
    window.addEventListener('beforeunload', () => {
      // Send session summary
      const sessionData: RUMData = {
        sessionId: this.sessionId,
        userId: this.userId,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        performance: {
          navigationTiming: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
          paintTiming: performance.getEntriesByType('paint') as PerformancePaintTiming[],
          resourceTiming: performance.getEntriesByType('resource') as PerformanceResourceTiming[],
        },
        vitals: this.vitalsData,
        errors: this.errors,
        interactions: this.interactions,
      };
      
      // Use sendBeacon for reliable delivery
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/telemetry/rum', JSON.stringify({
          event: 'session.end',
          data: sessionData,
        }));
      }
    });
  }

  /**
   * Send event to server
   */
  private sendEvent(eventType: string, data: any): void {
    // In production, you might want to batch events or use a more sophisticated queuing system
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Client Telemetry] ${eventType}:`, data);
    }
    
    // Send to server (could be batched for efficiency)
    fetch('/api/telemetry/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        data,
        timestamp: Date.now(),
      }),
    }).catch((error) => {
      console.warn('[Client Telemetry] Failed to send event:', error);
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get element information for tracking
   */
  private getElementInfo(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const text = element.textContent?.slice(0, 50) || '';
    
    return `${tag}${id}${className}${text ? ` "${text}"` : ''}`.trim();
  }
}

/**
 * Global client telemetry instance
 */
let clientTelemetry: ClientTelemetry | null = null;

/**
 * Get or create client telemetry instance
 */
export function getClientTelemetry(): ClientTelemetry {
  if (!clientTelemetry && typeof window !== 'undefined') {
    clientTelemetry = new ClientTelemetry();
  }
  
  return clientTelemetry!;
}

/**
 * React hook for component telemetry
 */
export function useComponentTelemetry(componentName: string) {
  const telemetry = typeof window !== 'undefined' ? getClientTelemetry() : null;
  
  const trackMount = (attributes?: NextVibeSpanAttributes) => {
    telemetry?.trackComponentPerformance(componentName, 'mount', undefined, attributes);
  };
  
  const trackUpdate = (duration?: number, attributes?: NextVibeSpanAttributes) => {
    telemetry?.trackComponentPerformance(componentName, 'update', duration, attributes);
  };
  
  const trackUnmount = (attributes?: NextVibeSpanAttributes) => {
    telemetry?.trackComponentPerformance(componentName, 'unmount', undefined, attributes);
  };
  
  const trackEvent = (eventName: string, attributes?: NextVibeSpanAttributes) => {
    telemetry?.trackEvent(eventName, { 'component.name': componentName, ...attributes });
  };
  
  return {
    trackMount,
    trackUpdate,
    trackUnmount,
    trackEvent,
  };
}

/**
 * Higher-order component for automatic telemetry
 */
export function withTelemetry<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const TelemetryComponent = (props: P) => {
    const { trackMount, trackUnmount } = useComponentTelemetry(displayName);
    
    React.useEffect(() => {
      trackMount();
      return () => trackUnmount();
    }, [trackMount, trackUnmount]);
    
    return React.createElement(WrappedComponent, props);
  };
  
  TelemetryComponent.displayName = `withTelemetry(${displayName})`;
  
  return TelemetryComponent;
}

/**
 * Export convenience functions
 */
export const clientTelemetry = {
  setUser: (userId: string, attributes?: Record<string, any>) => 
    getClientTelemetry().setUser(userId, attributes),
    
  trackPageView: (page: string, attributes?: NextVibeSpanAttributes) =>
    getClientTelemetry().trackPageView(page, attributes),
    
  trackEvent: (eventName: string, attributes?: NextVibeSpanAttributes) =>
    getClientTelemetry().trackEvent(eventName, attributes),
    
  trackHabit: (operation: 'create' | 'complete' | 'edit' | 'delete', habitId: string, attributes?: NextVibeSpanAttributes) =>
    getClientTelemetry().trackHabitOperation(operation, habitId, attributes),
    
  trackMood: (rating: number, attributes?: NextVibeSpanAttributes) =>
    getClientTelemetry().trackMoodEntry(rating, attributes),
    
  trackAI: (feature: string, attributes?: NextVibeSpanAttributes) =>
    getClientTelemetry().trackAIFeature(feature, attributes),
};