import { Page } from '@playwright/test';

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  networkRequests: number;
  jsErrors: number;
}

export class PerformanceMonitor {
  private page: Page;
  private metrics: Partial<PerformanceMetrics> = {};
  private consoleErrors: string[] = [];
  private networkRequests = 0;

  constructor(page: Page) {
    this.page = page;
    this.setupMonitoring();
  }

  private setupMonitoring() {
    // Track console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });

    // Track network requests
    this.page.on('request', () => {
      this.networkRequests++;
    });
  }

  async measurePageLoad(url: string): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    // Navigate to page
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;

    // Get Web Vitals using browser APIs
    const webVitals = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // Performance observer for various metrics
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.entryType === 'navigation') {
                  const nav = entry as PerformanceNavigationTiming;
                  vitals.domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
                }
                
                if (entry.entryType === 'paint') {
                  if (entry.name === 'first-contentful-paint') {
                    vitals.firstContentfulPaint = entry.startTime;
                  }
                }
                
                if (entry.entryType === 'largest-contentful-paint') {
                  vitals.largestContentfulPaint = (entry as any).startTime;
                }
                
                if (entry.entryType === 'layout-shift') {
                  if (!(entry as any).hadRecentInput) {
                    vitals.cumulativeLayoutShift = (vitals.cumulativeLayoutShift || 0) + (entry as any).value;
                  }
                }
                
                if (entry.entryType === 'first-input') {
                  vitals.firstInputDelay = (entry as any).processingStart - entry.startTime;
                }
              }
            });
            
            observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
            
            // Give some time for metrics to be collected
            setTimeout(() => {
              observer.disconnect();
              resolve(vitals);
            }, 3000);
          } catch (e) {
            resolve({});
          }
        } else {
          resolve({});
        }
      });
    });

    return {
      loadTime,
      domContentLoaded: (webVitals as any).domContentLoaded || 0,
      firstContentfulPaint: (webVitals as any).firstContentfulPaint || 0,
      largestContentfulPaint: (webVitals as any).largestContentfulPaint || 0,
      cumulativeLayoutShift: (webVitals as any).cumulativeLayoutShift || 0,
      firstInputDelay: (webVitals as any).firstInputDelay || 0,
      networkRequests: this.networkRequests,
      jsErrors: this.consoleErrors.length
    };
  }

  getConsoleErrors(): string[] {
    return this.consoleErrors;
  }

  reset() {
    this.consoleErrors = [];
    this.networkRequests = 0;
  }
}

export function assessPerformance(metrics: PerformanceMetrics): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Load time assessment
  if (metrics.loadTime > 5000) {
    score -= 20;
    issues.push(`Slow page load time: ${metrics.loadTime}ms`);
    recommendations.push('Optimize bundle size and implement code splitting');
  } else if (metrics.loadTime > 3000) {
    score -= 10;
    issues.push(`Moderate page load time: ${metrics.loadTime}ms`);
  }

  // First Contentful Paint
  if (metrics.firstContentfulPaint > 3000) {
    score -= 15;
    issues.push(`Slow First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
    recommendations.push('Optimize above-the-fold content rendering');
  }

  // Largest Contentful Paint
  if (metrics.largestContentfulPaint > 4000) {
    score -= 15;
    issues.push(`Slow Largest Contentful Paint: ${metrics.largestContentfulPaint}ms`);
    recommendations.push('Optimize largest content element loading');
  }

  // Cumulative Layout Shift
  if (metrics.cumulativeLayoutShift > 0.25) {
    score -= 20;
    issues.push(`High Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}`);
    recommendations.push('Add proper sizing for images and dynamic content');
  } else if (metrics.cumulativeLayoutShift > 0.1) {
    score -= 10;
    issues.push(`Moderate Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}`);
  }

  // First Input Delay
  if (metrics.firstInputDelay > 300) {
    score -= 15;
    issues.push(`High First Input Delay: ${metrics.firstInputDelay}ms`);
    recommendations.push('Optimize JavaScript execution and reduce main thread blocking');
  }

  // JavaScript Errors
  if (metrics.jsErrors > 5) {
    score -= 25;
    issues.push(`High number of JavaScript errors: ${metrics.jsErrors}`);
    recommendations.push('Fix JavaScript console errors');
  } else if (metrics.jsErrors > 0) {
    score -= 10;
    issues.push(`JavaScript errors detected: ${metrics.jsErrors}`);
  }

  // Network requests
  if (metrics.networkRequests > 100) {
    score -= 10;
    issues.push(`High number of network requests: ${metrics.networkRequests}`);
    recommendations.push('Optimize and bundle resources to reduce HTTP requests');
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}