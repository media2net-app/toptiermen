/**
 * Performance monitoring utility for the application
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();

  startTimer(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
    
    console.log(`⏱️ Started timer: ${name}`);
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ Timer "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    console.log(`✅ Timer "${name}" completed in ${metric.duration.toFixed(2)}ms`);

    // Notify observers
    this.observers.forEach(observer => observer(metric));

    return metric.duration;
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  getSlowOperations(threshold: number = 1000): PerformanceMetric[] {
    return this.getAllMetrics().filter(metric => 
      metric.duration && metric.duration > threshold
    );
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  addObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.add(observer);
  }

  removeObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.delete(observer);
  }

  // System performance checks
  checkSystemPerformance(): {
    memoryUsage: number;
    loadTime: number;
    slowOperations: PerformanceMetric[];
    recommendations: string[];
  } {
    const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0;
    const loadTime = (performance as any).timing ? (performance as any).timing.loadEventEnd - (performance as any).timing.navigationStart : 0;
    const slowOperations = this.getSlowOperations(1000);

    const recommendations: string[] = [];

    if (memoryUsage > 100) {
      recommendations.push('High memory usage detected. Consider optimizing component rendering.');
    }

    if (loadTime > 3000) {
      recommendations.push('Slow page load detected. Consider code splitting and lazy loading.');
    }

    if (slowOperations.length > 0) {
      recommendations.push(`Found ${slowOperations.length} slow operations. Review performance bottlenecks.`);
    }

    return {
      memoryUsage,
      loadTime,
      slowOperations,
      recommendations
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const startTimer = (operationName: string, metadata?: Record<string, any>) => {
    performanceMonitor.startTimer(`${componentName}-${operationName}`, metadata);
  };

  const endTimer = (operationName: string) => {
    return performanceMonitor.endTimer(`${componentName}-${operationName}`);
  };

  return { startTimer, endTimer };
};

// Performance decorator for functions
export const withPerformanceTracking = <T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T => {
  return ((...args: Parameters<T>) => {
    performanceMonitor.startTimer(operationName);
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.finally(() => performanceMonitor.endTimer(operationName));
      } else {
        performanceMonitor.endTimer(operationName);
        return result;
      }
    } catch (error) {
      performanceMonitor.endTimer(operationName);
      throw error;
    }
  }) as T;
};

// Auth performance tracking
export const trackAuthPerformance = {
  signIn: () => performanceMonitor.startTimer('auth-signin'),
  signInComplete: () => performanceMonitor.endTimer('auth-signin'),
  signOut: () => performanceMonitor.startTimer('auth-signout'),
  signOutComplete: () => performanceMonitor.endTimer('auth-signout'),
  sessionRefresh: () => performanceMonitor.startTimer('auth-session-refresh'),
  sessionRefreshComplete: () => performanceMonitor.endTimer('auth-session-refresh'),
};

// Page load performance tracking
export const trackPagePerformance = {
  pageLoad: (pageName: string) => performanceMonitor.startTimer(`page-load-${pageName}`),
  pageLoadComplete: (pageName: string) => performanceMonitor.endTimer(`page-load-${pageName}`),
  dataFetch: (endpoint: string) => performanceMonitor.startTimer(`data-fetch-${endpoint}`),
  dataFetchComplete: (endpoint: string) => performanceMonitor.endTimer(`data-fetch-${endpoint}`),
}; 