/**
 * Performance Monitoring Utility
 * Tracks API performance metrics and provides insights
 */

interface PerformanceMetric {
  timestamp: string;
  endpoint: string;
  queryTime: number;
  dataSize: number;
  cacheHit: boolean;
  userId?: string;
  error?: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(fullMetric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow queries
    if (metric.queryTime > 1000) {
      console.warn(`🐌 Slow query detected: ${metric.endpoint} - ${metric.queryTime}ms`);
    }

    // Log errors
    if (metric.error) {
      console.error(`❌ API Error: ${metric.endpoint} - ${metric.error}`);
    }
  }

  /**
   * Get performance statistics for a time range
   */
  public getStats(timeRangeMs: number = 60 * 60 * 1000): {
    totalRequests: number;
    averageQueryTime: number;
    maxQueryTime: number;
    minQueryTime: number;
    cacheHitRate: number;
    errorRate: number;
    slowQueries: number;
  } {
    const cutoffTime = new Date(Date.now() - timeRangeMs);
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp) >= cutoffTime
    );

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageQueryTime: 0,
        maxQueryTime: 0,
        minQueryTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        slowQueries: 0
      };
    }

    const totalRequests = recentMetrics.length;
    const totalTime = recentMetrics.reduce((sum, m) => sum + m.queryTime, 0);
    const averageQueryTime = totalTime / totalRequests;
    const maxQueryTime = Math.max(...recentMetrics.map(m => m.queryTime));
    const minQueryTime = Math.min(...recentMetrics.map(m => m.queryTime));
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = (cacheHits / totalRequests) * 100;
    const errors = recentMetrics.filter(m => m.error).length;
    const errorRate = (errors / totalRequests) * 100;
    const slowQueries = recentMetrics.filter(m => m.queryTime > 1000).length;

    return {
      totalRequests,
      averageQueryTime,
      maxQueryTime,
      minQueryTime,
      cacheHitRate,
      errorRate,
      slowQueries
    };
  }

  /**
   * Get endpoint-specific statistics
   */
  public getEndpointStats(endpoint: string, timeRangeMs: number = 60 * 60 * 1000): any {
    const cutoffTime = new Date(Date.now() - timeRangeMs);
    const endpointMetrics = this.metrics.filter(
      m => m.endpoint.includes(endpoint) && new Date(m.timestamp) >= cutoffTime
    );

    if (endpointMetrics.length === 0) {
      return null;
    }

    const stats = this.getStats(timeRangeMs);
    const endpointSpecificStats = {
      ...stats,
      endpoint,
      recentQueries: endpointMetrics
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
    };

    return endpointSpecificStats;
  }

  /**
   * Get all metrics (for debugging)
   */
  public getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get performance recommendations
   */
  public getRecommendations(): string[] {
    const stats = this.getStats();
    const recommendations: string[] = [];

    if (stats.averageQueryTime > 500) {
      recommendations.push('Consider optimizing database queries - average response time is high');
    }

    if (stats.cacheHitRate < 70) {
      recommendations.push('Cache hit rate is low - consider implementing more aggressive caching');
    }

    if (stats.errorRate > 5) {
      recommendations.push('Error rate is high - investigate and fix API errors');
    }

    if (stats.slowQueries > 10) {
      recommendations.push('Multiple slow queries detected - review and optimize slow endpoints');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! No immediate optimizations needed.');
    }

    return recommendations;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper function to measure API performance
export async function measureApiPerformance<T>(
  endpoint: string,
  operation: () => Promise<T>,
  options: {
    userId?: string;
    cacheHit?: boolean;
    dataSize?: number;
  } = {}
): Promise<T> {
  const startTime = Date.now();
  let error: string | undefined;

  try {
    const result = await operation();
    const queryTime = Date.now() - startTime;

    performanceMonitor.recordMetric({
      endpoint,
      queryTime,
      dataSize: options.dataSize || 0,
      cacheHit: options.cacheHit || false,
      userId: options.userId
    });

    return result;
  } catch (err: any) {
    error = err.message;
    const queryTime = Date.now() - startTime;

    performanceMonitor.recordMetric({
      endpoint,
      queryTime,
      dataSize: 0,
      cacheHit: false,
      userId: options.userId,
      error
    });

    throw err;
  }
}

// Helper function to create performance middleware
export function createPerformanceMiddleware(endpoint: string) {
  return async function<T>(operation: () => Promise<T>, options: any = {}): Promise<T> {
    return measureApiPerformance(endpoint, operation, options);
  };
}