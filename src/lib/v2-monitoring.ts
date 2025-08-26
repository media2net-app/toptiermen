// V2.0: Comprehensive Monitoring System
import React from 'react';
import { useV2State } from '@/contexts/V2StateContext';

// V2.0: Metric types
export type MetricType = 'performance' | 'error' | 'user' | 'system' | 'business';

// V2.0: Metric interface
export interface V2Metric {
  id: string;
  type: MetricType;
  name: string;
  value: number | string | boolean;
  timestamp: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

// V2.0: Performance metric
export interface V2PerformanceMetric extends V2Metric {
  type: 'performance';
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
}

// V2.0: Error metric
export interface V2ErrorMetric extends V2Metric {
  type: 'error';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stack?: string;
}

// V2.0: User metric
export interface V2UserMetric extends V2Metric {
  type: 'user';
  value: string | number;
  action: string;
  userId?: string;
  sessionId?: string;
}

// V2.0: System metric
export interface V2SystemMetric extends V2Metric {
  type: 'system';
  value: number | boolean;
  component: string;
  status: 'healthy' | 'warning' | 'error' | 'critical';
}

// V2.0: Business metric
export interface V2BusinessMetric extends V2Metric {
  type: 'business';
  value: number;
  category: string;
  revenue?: number;
}

// V2.0: Monitoring configuration
export interface V2MonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of events to track
  batchSize: number; // Number of metrics to batch before sending
  flushInterval: number; // How often to flush metrics (ms)
  endpoint?: string; // Where to send metrics
  apiKey?: string; // API key for external monitoring service
}

// V2.0: Default monitoring configuration
export const DEFAULT_MONITORING_CONFIG: V2MonitoringConfig = {
  enabled: true,
  sampleRate: 1.0, // Track all events
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
};

// V2.0: Monitoring manager
export class V2MonitoringManager {
  private config: V2MonitoringConfig;
  private metrics: V2Metric[] = [];
  private isFlushing = false;
  private flushTimer?: NodeJS.Timeout;
  
  constructor(config: Partial<V2MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
    this.startFlushTimer();
  }
  
  // V2.0: Track performance metric
  trackPerformance(
    name: string,
    value: number,
    unit: V2PerformanceMetric['unit'] = 'ms',
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    if (!this.shouldTrack()) return;
    
    const metric: V2PerformanceMetric = {
      id: `perf_${Date.now()}_${Math.random()}`,
      type: 'performance',
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
      metadata,
    };
    
    this.addMetric(metric);
  }
  
  // V2.0: Track error metric
  trackError(
    name: string,
    error: Error | string,
    severity: V2ErrorMetric['severity'] = 'medium',
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    if (!this.shouldTrack()) return;
    
    const metric: V2ErrorMetric = {
      id: `error_${Date.now()}_${Math.random()}`,
      type: 'error',
      name,
      value: error instanceof Error ? error.message : error,
      severity,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      tags,
      metadata,
    };
    
    this.addMetric(metric);
  }
  
  // V2.0: Track user interaction
  trackUserAction(
    action: string,
    value: string | number,
    userId?: string,
    sessionId?: string,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    if (!this.shouldTrack()) return;
    
    const metric: V2UserMetric = {
      id: `user_${Date.now()}_${Math.random()}`,
      type: 'user',
      name: 'user_action',
      value,
      action,
      userId,
      sessionId,
      timestamp: Date.now(),
      tags,
      metadata,
    };
    
    this.addMetric(metric);
  }
  
  // V2.0: Track system health
  trackSystemHealth(
    component: string,
    status: V2SystemMetric['status'],
    value: number | boolean = 1,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    if (!this.shouldTrack()) return;
    
    const metric: V2SystemMetric = {
      id: `system_${Date.now()}_${Math.random()}`,
      type: 'system',
      name: 'system_health',
      value,
      component,
      status,
      timestamp: Date.now(),
      tags,
      metadata,
    };
    
    this.addMetric(metric);
  }
  
  // V2.0: Track business metric
  trackBusinessMetric(
    name: string,
    value: number,
    category: string,
    revenue?: number,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    if (!this.shouldTrack()) return;
    
    const metric: V2BusinessMetric = {
      id: `business_${Date.now()}_${Math.random()}`,
      type: 'business',
      name,
      value,
      category,
      revenue,
      timestamp: Date.now(),
      tags,
      metadata,
    };
    
    this.addMetric(metric);
  }
  
  // V2.0: Track page load performance
  trackPageLoad(page: string, loadTime: number): void {
    this.trackPerformance('page_load_time', loadTime, 'ms', { page });
  }
  
  // V2.0: Track API call performance
  trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    this.trackPerformance('api_call_duration', duration, 'ms', {
      endpoint,
      method,
      status: status.toString(),
    });
  }
  
  // V2.0: Track component render performance
  trackComponentRender(component: string, renderTime: number): void {
    this.trackPerformance('component_render_time', renderTime, 'ms', { component });
  }
  
  // V2.0: Track memory usage
  trackMemoryUsage(usage: number): void {
    this.trackPerformance('memory_usage', usage, 'bytes');
  }
  
  // V2.0: Track network performance
  trackNetworkPerformance(url: string, duration: number, size: number): void {
    this.trackPerformance('network_request_duration', duration, 'ms', { url });
    this.trackPerformance('network_request_size', size, 'bytes', { url });
  }
  
  // V2.0: Track user session
  trackSessionStart(userId?: string, sessionId?: string): void {
    this.trackUserAction('session_start', 'started', userId, sessionId);
  }
  
  // V2.0: Track user session end
  trackSessionEnd(userId?: string, sessionId?: string, duration?: number): void {
    this.trackUserAction('session_end', 'ended', userId, sessionId, {
      duration: duration?.toString() || 'unknown',
    });
  }
  
  // V2.0: Track feature usage with strict debouncing
  private featureUsageCache = new Map<string, number>();
  
  trackFeatureUsage(feature: string, userId?: string): void {
    // Disable tracking in development to prevent infinite loops
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    const key = `${feature}-${userId || 'anonymous'}`;
    const now = Date.now();
    const lastTracked = this.featureUsageCache.get(key) || 0;
    
    // Debounce: only track once per 5 seconds per feature-user combination
    if (now - lastTracked < 5000) {
      return;
    }
    
    this.featureUsageCache.set(key, now);
    this.trackUserAction('feature_usage', feature, userId);
  }
  
  // V2.0: Track conversion
  trackConversion(funnel: string, step: string, userId?: string): void {
    this.trackUserAction('conversion', `${funnel}_${step}`, userId);
  }
  
  // V2.0: Track error rate
  trackErrorRate(component: string, errorCount: number, totalCount: number): void {
    const errorRate = (errorCount / totalCount) * 100;
    this.trackPerformance('error_rate', errorRate, 'percentage', { component });
  }
  
  // V2.0: Track cache hit rate
  trackCacheHitRate(cacheType: string, hitCount: number, totalCount: number): void {
    const hitRate = (hitCount / totalCount) * 100;
    this.trackPerformance('cache_hit_rate', hitRate, 'percentage', { cache_type: cacheType });
  }
  
  // V2.0: Private methods
  private shouldTrack(): boolean {
    return this.config.enabled && Math.random() <= this.config.sampleRate;
  }
  
  private addMetric(metric: V2Metric): void {
    this.metrics.push(metric);
    
    // Flush if batch size reached
    if (this.metrics.length >= this.config.batchSize) {
      this.flush();
    }
  }
  
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }
  
  private async flush(): Promise<void> {
    if (this.isFlushing || this.metrics.length === 0) {
      return;
    }
    
    this.isFlushing = true;
    
    try {
      const metricsToSend = [...this.metrics];
      this.metrics = [];
      
      // Send to external service if configured
      if (this.config.endpoint && this.config.apiKey) {
        await this.sendToExternalService(metricsToSend);
      }
      
      // Store locally for debugging
      this.storeLocally(metricsToSend);
      
      console.log(`V2.0: Flushed ${metricsToSend.length} metrics`);
    } catch (error) {
      console.error('V2.0: Error flushing metrics:', error);
      // Restore metrics for retry
      this.metrics.unshift(...this.metrics);
    } finally {
      this.isFlushing = false;
    }
  }
  
  private async sendToExternalService(metrics: V2Metric[]): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) {
      return;
    }
    
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        metrics,
        timestamp: Date.now(),
        version: '2.0',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send metrics: ${response.status}`);
    }
  }
  
  private storeLocally(metrics: V2Metric[]): void {
    try {
      const existing = localStorage.getItem('v2-metrics');
      const stored = existing ? JSON.parse(existing) : [];
      
      // Keep only last 1000 metrics
      const updated = [...stored, ...metrics].slice(-1000);
      localStorage.setItem('v2-metrics', JSON.stringify(updated));
    } catch (error) {
      console.error('V2.0: Error storing metrics locally:', error);
    }
  }
  
  // V2.0: Get metrics
  getMetrics(): V2Metric[] {
    return [...this.metrics];
  }
  
  // V2.0: Get metrics by type
  getMetricsByType(type: MetricType): V2Metric[] {
    return this.metrics.filter(metric => metric.type === type);
  }
  
  // V2.0: Get metrics by time range
  getMetricsByTimeRange(startTime: number, endTime: number): V2Metric[] {
    return this.metrics.filter(
      metric => metric.timestamp >= startTime && metric.timestamp <= endTime
    );
  }
  
  // V2.0: Get metrics statistics
  getMetricsStats(): {
    total: number;
    byType: Record<MetricType, number>;
    byTimeRange: Record<string, number>;
    averageValues: Record<string, number>;
  } {
    const byType: Record<MetricType, number> = {
      performance: 0,
      error: 0,
      user: 0,
      system: 0,
      business: 0,
    };
    
    const byTimeRange: Record<string, number> = {
      'last_hour': 0,
      'last_day': 0,
      'last_week': 0,
    };
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    const oneWeek = 7 * oneDay;
    
    this.metrics.forEach(metric => {
      byType[metric.type]++;
      
      const age = now - metric.timestamp;
      if (age <= oneHour) byTimeRange['last_hour']++;
      if (age <= oneDay) byTimeRange['last_day']++;
      if (age <= oneWeek) byTimeRange['last_week']++;
    });
    
    // Calculate average values for numeric metrics
    const averageValues: Record<string, number> = {};
    const performanceMetrics = this.getMetricsByType('performance') as V2PerformanceMetric[];
    
    const groupedByName = performanceMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);
    
    Object.entries(groupedByName).forEach(([name, values]) => {
      averageValues[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    return {
      total: this.metrics.length,
      byType,
      byTimeRange,
      averageValues,
    };
  }
  
  // V2.0: Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }
  
  // V2.0: Update configuration
  updateConfig(config: Partial<V2MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    this.startFlushTimer();
  }
  
  // V2.0: Destroy monitoring
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// V2.0: Global monitoring instance
export const v2Monitoring = new V2MonitoringManager();

// V2.0: React hook for monitoring
export function useV2Monitoring() {
  const { recordPageLoadTime, recordApiCallTime } = useV2State();
  
  return {
    // V2.0: Track performance
    trackPerformance: (
      name: string,
      value: number,
      unit: V2PerformanceMetric['unit'] = 'ms',
      tags: Record<string, string> = {},
      metadata?: Record<string, any>
    ): void => {
      v2Monitoring.trackPerformance(name, value, unit, tags, metadata);
    },
    
    // V2.0: Track error
    trackError: (
      name: string,
      error: Error | string,
      severity: V2ErrorMetric['severity'] = 'medium',
      tags: Record<string, string> = {},
      metadata?: Record<string, any>
    ): void => {
      v2Monitoring.trackError(name, error, severity, tags, metadata);
    },
    
    // V2.0: Track user action
    trackUserAction: (
      action: string,
      value: string | number,
      userId?: string,
      sessionId?: string,
      tags: Record<string, string> = {},
      metadata?: Record<string, any>
    ): void => {
      v2Monitoring.trackUserAction(action, value, userId, sessionId, tags, metadata);
    },
    
    // V2.0: Track system health
    trackSystemHealth: (
      component: string,
      status: V2SystemMetric['status'],
      value: number | boolean = 1,
      tags: Record<string, string> = {},
      metadata?: Record<string, any>
    ): void => {
      v2Monitoring.trackSystemHealth(component, status, value, tags, metadata);
    },
    
    // V2.0: Track business metric
    trackBusinessMetric: (
      name: string,
      value: number,
      category: string,
      revenue?: number,
      tags: Record<string, string> = {},
      metadata?: Record<string, any>
    ): void => {
      v2Monitoring.trackBusinessMetric(name, value, category, revenue, tags, metadata);
    },
    
    // V2.0: Track page load
    trackPageLoad: (page: string, loadTime: number): void => {
      v2Monitoring.trackPageLoad(page, loadTime);
      recordPageLoadTime(page, loadTime);
    },
    
    // V2.0: Track API call
    trackApiCall: (endpoint: string, method: string, duration: number, status: number): void => {
      v2Monitoring.trackApiCall(endpoint, method, duration, status);
      recordApiCallTime(`${method} ${endpoint}`, duration);
    },
    
    // V2.0: Track component render
    trackComponentRender: (component: string, renderTime: number): void => {
      v2Monitoring.trackComponentRender(component, renderTime);
    },
    
    // V2.0: Track memory usage
    trackMemoryUsage: (usage: number): void => {
      v2Monitoring.trackMemoryUsage(usage);
    },
    
    // V2.0: Track network performance
    trackNetworkPerformance: (url: string, duration: number, size: number): void => {
      v2Monitoring.trackNetworkPerformance(url, duration, size);
    },
    
    // V2.0: Track session
    trackSessionStart: (userId?: string, sessionId?: string): void => {
      v2Monitoring.trackSessionStart(userId, sessionId);
    },
    
    trackSessionEnd: (userId?: string, sessionId?: string, duration?: number): void => {
      v2Monitoring.trackSessionEnd(userId, sessionId, duration);
    },
    
    // V2.0: Track feature usage
    trackFeatureUsage: (feature: string, userId?: string): void => {
      v2Monitoring.trackFeatureUsage(feature, userId);
    },
    
    // V2.0: Track conversion
    trackConversion: (funnel: string, step: string, userId?: string): void => {
      v2Monitoring.trackConversion(funnel, step, userId);
    },
    
    // V2.0: Get metrics statistics
    getMetricsStats: (): ReturnType<typeof v2Monitoring.getMetricsStats> => {
      return v2Monitoring.getMetricsStats();
    },
    
    // V2.0: Clear metrics
    clearMetrics: (): void => {
      v2Monitoring.clearMetrics();
    },
  };
}

// V2.0: Performance monitoring hook with debouncing
export function useV2PerformanceMonitoring() {
  const { trackPerformance, trackPageLoad, trackApiCall, trackComponentRender } = useV2Monitoring();
  
  // V2.0: Track component performance with debouncing
  const trackComponentPerformance = React.useCallback((componentName: string) => {
    const startTime = performance.now();
    const key = `component-${componentName}`;
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Only track if render time is significant (> 10ms)
      if (renderTime > 10) {
        trackComponentRender(componentName, renderTime);
      }
    };
  }, [trackComponentRender]);
  
  // V2.0: Track API call performance
  const trackApiCallPerformance = React.useCallback(async <T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      trackApiCall(endpoint, method, duration, 200);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      trackApiCall(endpoint, method, duration, 500);
      throw error;
    }
  }, [trackApiCall]);
  
  return {
    trackPerformance,
    trackPageLoad,
    trackApiCall,
    trackComponentRender,
    trackComponentPerformance,
    trackApiCallPerformance,
  };
}
