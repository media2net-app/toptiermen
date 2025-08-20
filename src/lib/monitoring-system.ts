// V1.3: Advanced Monitoring System
// Real-time performance metrics, user session monitoring, and system health tracking

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'performance' | 'user' | 'system' | 'cache' | 'database';
  severity: 'normal' | 'warning' | 'critical';
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  startTime: number;
  lastActivity: number;
  duration: number;
  pageViews: number;
  actions: UserAction[];
  device: DeviceInfo;
  location?: GeolocationInfo;
  errors: SessionError[];
}

export interface UserAction {
  type: 'page_view' | 'click' | 'form_submit' | 'api_call' | 'error';
  target: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  isMobile: boolean;
  screen: {
    width: number;
    height: number;
  };
}

export interface GeolocationInfo {
  country: string;
  city: string;
  timezone: string;
  ip?: string;
}

export interface SessionError {
  errorId: string;
  message: string;
  stack?: string;
  url: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface SystemAlert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'capacity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  actions: AlertAction[];
}

export interface AlertAction {
  name: string;
  description: string;
  action: () => void;
}

export interface MonitoringConfig {
  metrics: {
    collectInterval: number; // in milliseconds
    retentionPeriod: number; // in seconds
    batchSize: number;
  };
  sessions: {
    timeout: number; // in milliseconds
    trackPageViews: boolean;
    trackUserActions: boolean;
    trackErrors: boolean;
  };
  alerts: {
    enabled: boolean;
    channels: ('console' | 'database' | 'email' | 'webhook')[];
    thresholds: {
      responseTime: number;
      errorRate: number;
      memoryUsage: number;
      cpuUsage: number;
    };
  };
  realtime: {
    enabled: boolean;
    updateInterval: number;
    maxDataPoints: number;
  };
}

class AdvancedMonitoringSystem {
  private config: MonitoringConfig;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private alerts: SystemAlert[] = [];
  private isCollecting: boolean = false;
  private collectInterval: NodeJS.Timeout | null = null;
  private realtimeSubscribers: ((data: any) => void)[] = [];

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      metrics: {
        collectInterval: 5000, // 5 seconds
        retentionPeriod: 24 * 60 * 60, // 24 hours
        batchSize: 100,
      },
      sessions: {
        timeout: 30 * 60 * 1000, // 30 minutes
        trackPageViews: true,
        trackUserActions: true,
        trackErrors: true,
      },
      alerts: {
        enabled: true,
        channels: ['console', 'database'],
        thresholds: {
          responseTime: 2000, // 2 seconds
          errorRate: 0.05, // 5%
          memoryUsage: 80, // 80%
          cpuUsage: 80, // 80%
        },
      },
      realtime: {
        enabled: true,
        updateInterval: 1000, // 1 second
        maxDataPoints: 100,
      },
      ...config,
    };
  }

  // Start monitoring system
  async startMonitoring(): Promise<void> {
    if (this.isCollecting) return;

    console.log('🔍 Starting Advanced Monitoring System V1.3...');
    
    this.isCollecting = true;
    this.collectInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metrics.collectInterval);

    // Initialize session tracking
    this.initializeSessionTracking();
    
    // Initialize error tracking
    this.initializeErrorTracking();

    // Start real-time updates
    if (this.config.realtime.enabled) {
      this.startRealtimeUpdates();
    }

    console.log('✅ Advanced Monitoring System started');
  }

  // Stop monitoring system
  stopMonitoring(): void {
    if (!this.isCollecting) return;

    console.log('🛑 Stopping Advanced Monitoring System...');
    
    this.isCollecting = false;
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
    }

    console.log('✅ Advanced Monitoring System stopped');
  }

  // Collect performance metrics
  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = Date.now();

      // Browser performance metrics
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const memory = (performance as any).memory;

        // Response time metrics
        if (navigation) {
          this.addMetric({
            id: 'page_load_time',
            name: 'Page Load Time',
            value: navigation.loadEventEnd - navigation.navigationStart,
            unit: 'ms',
            timestamp,
            category: 'performance',
            severity: 'normal',
            threshold: { warning: 3000, critical: 5000 }
          });

          this.addMetric({
            id: 'dom_content_loaded',
            name: 'DOM Content Loaded',
            value: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            unit: 'ms',
            timestamp,
            category: 'performance',
            severity: 'normal',
            threshold: { warning: 2000, critical: 4000 }
          });
        }

        // Memory metrics (Chrome only)
        if (memory) {
          this.addMetric({
            id: 'js_heap_used',
            name: 'JS Heap Used',
            value: memory.usedJSHeapSize / 1024 / 1024, // MB
            unit: 'MB',
            timestamp,
            category: 'system',
            severity: 'normal',
            threshold: { warning: 50, critical: 100 }
          });

          this.addMetric({
            id: 'js_heap_total',
            name: 'JS Heap Total',
            value: memory.totalJSHeapSize / 1024 / 1024, // MB
            unit: 'MB',
            timestamp,
            category: 'system',
            severity: 'normal'
          });
        }
      }

      // Cache metrics (if unified cache is available)
      try {
        const { unifiedCache } = await import('./unified-cache-strategy');
        const cacheStats = unifiedCache.getStats();
        const cacheInfo = unifiedCache.getInfo();

        this.addMetric({
          id: 'cache_hit_rate',
          name: 'Cache Hit Rate',
          value: cacheStats.hitRate / (cacheStats.hitRate + cacheStats.missRate) * 100 || 0,
          unit: '%',
          timestamp,
          category: 'cache',
          severity: 'normal',
          threshold: { warning: 70, critical: 50 }
        });

        this.addMetric({
          id: 'cache_size',
          name: 'Cache Size',
          value: cacheStats.totalSize / 1024 / 1024, // MB
          unit: 'MB',
          timestamp,
          category: 'cache',
          severity: 'normal',
          threshold: { warning: 8, critical: 10 }
        });

        this.addMetric({
          id: 'cache_entries',
          name: 'Cache Entries',
          value: cacheStats.totalEntries,
          unit: 'count',
          timestamp,
          category: 'cache',
          severity: 'normal'
        });
      } catch (error) {
        console.warn('Could not collect cache metrics:', error);
      }

      // User metrics
      this.addMetric({
        id: 'active_sessions',
        name: 'Active Sessions',
        value: this.getActiveSessions().length,
        unit: 'count',
        timestamp,
        category: 'user',
        severity: 'normal'
      });

      // System health check
      this.checkSystemHealth();

    } catch (error) {
      console.error('Error collecting metrics:', error);
      this.addAlert({
        id: `metric_collection_error_${Date.now()}`,
        type: 'error',
        severity: 'warning',
        title: 'Metric Collection Error',
        description: `Failed to collect metrics: ${error}`,
        timestamp: Date.now(),
        resolved: false,
        actions: []
      });
    }
  }

  // Add performance metric
  private addMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.id)) {
      this.metrics.set(metric.id, []);
    }

    const metricHistory = this.metrics.get(metric.id)!;
    metricHistory.push(metric);

    // Keep only recent metrics based on retention period
    const cutoffTime = Date.now() - (this.config.metrics.retentionPeriod * 1000);
    const filteredHistory = metricHistory.filter(m => m.timestamp > cutoffTime);
    this.metrics.set(metric.id, filteredHistory);

    // Check thresholds and create alerts
    this.checkMetricThresholds(metric);

    // Notify real-time subscribers
    this.notifyRealtimeSubscribers({
      type: 'metric_update',
      metric,
      timestamp: Date.now()
    });
  }

  // Check metric thresholds
  private checkMetricThresholds(metric: PerformanceMetric): void {
    if (!metric.threshold) return;

    let severity: 'info' | 'warning' | 'critical' | null = null;
    
    if (metric.value >= metric.threshold.critical) {
      severity = 'critical';
    } else if (metric.value >= metric.threshold.warning) {
      severity = 'warning';
    }

    if (severity) {
      this.addAlert({
        id: `threshold_${metric.id}_${Date.now()}`,
        type: 'performance',
        severity,
        title: `${metric.name} Threshold Exceeded`,
        description: `${metric.name} is ${metric.value}${metric.unit}, which exceeds the ${severity} threshold of ${severity === 'critical' ? metric.threshold.critical : metric.threshold.warning}${metric.unit}`,
        timestamp: Date.now(),
        resolved: false,
        actions: []
      });
    }
  }

  // Initialize session tracking
  private initializeSessionTracking(): void {
    if (typeof window === 'undefined') return;

    // Create or get current session
    const sessionId = this.getCurrentSessionId();
    const session = this.getOrCreateSession(sessionId);

    // Track page views
    if (this.config.sessions.trackPageViews) {
      this.trackPageView(sessionId, window.location.pathname);
    }

    // Track user actions
    if (this.config.sessions.trackUserActions) {
      this.setupActionTracking(sessionId);
    }

    // Update session activity
    this.updateSessionActivity(sessionId);
  }

  // Get current session ID
  private getCurrentSessionId(): string {
    if (typeof window === 'undefined') return `session_${Date.now()}`;
    
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }

  // Get or create session
  private getOrCreateSession(sessionId: string): UserSession {
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    const session: UserSession = {
      sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      duration: 0,
      pageViews: 0,
      actions: [],
      device: this.getDeviceInfo(),
      errors: []
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Get device info
  private getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'Unknown',
        browser: 'Unknown',
        browserVersion: 'Unknown',
        os: 'Unknown',
        osVersion: 'Unknown',
        device: 'Unknown',
        isMobile: false,
        screen: { width: 0, height: 0 }
      };
    }

    const userAgent = navigator.userAgent;
    
    return {
      userAgent,
      browser: this.getBrowserName(userAgent),
      browserVersion: this.getBrowserVersion(userAgent),
      os: this.getOSName(userAgent),
      osVersion: this.getOSVersion(userAgent),
      device: this.getDeviceName(userAgent),
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    };
  }

  // Browser detection helpers
  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(userAgent: string): string {
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  private getOSName(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  private getOSVersion(userAgent: string): string {
    // Simplified OS version detection
    const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
    if (windowsMatch) return windowsMatch[1];
    
    const macMatch = userAgent.match(/Mac OS X (\d+_\d+)/);
    if (macMatch) return macMatch[1].replace('_', '.');
    
    return 'Unknown';
  }

  private getDeviceName(userAgent: string): string {
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Mobile')) return 'Mobile';
    return 'Desktop';
  }

  // Track page view
  trackPageView(sessionId: string, path: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.pageViews++;
    session.lastActivity = Date.now();
    session.duration = Date.now() - session.startTime;
    session.actions.push({
      type: 'page_view',
      target: path,
      timestamp: Date.now()
    });

    this.notifyRealtimeSubscribers({
      type: 'page_view',
      sessionId,
      path,
      timestamp: Date.now()
    });
  }

  // Setup action tracking
  private setupActionTracking(sessionId: string): void {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackUserAction(sessionId, {
        type: 'click',
        target: this.getElementIdentifier(target),
        timestamp: Date.now(),
        metadata: {
          tagName: target.tagName,
          className: target.className,
          id: target.id
        }
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement;
      this.trackUserAction(sessionId, {
        type: 'form_submit',
        target: this.getElementIdentifier(target),
        timestamp: Date.now(),
        metadata: {
          action: target.action,
          method: target.method
        }
      });
    });
  }

  // Get element identifier
  private getElementIdentifier(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  // Track user action
  trackUserAction(sessionId: string, action: UserAction): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.actions.push(action);
    session.lastActivity = Date.now();
    session.duration = Date.now() - session.startTime;

    this.notifyRealtimeSubscribers({
      type: 'user_action',
      sessionId,
      action,
      timestamp: Date.now()
    });
  }

  // Update session activity
  updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastActivity = Date.now();
    session.duration = Date.now() - session.startTime;
  }

  // Get active sessions
  getActiveSessions(): UserSession[] {
    const cutoffTime = Date.now() - this.config.sessions.timeout;
    return Array.from(this.sessions.values()).filter(
      session => session.lastActivity > cutoffTime
    );
  }

  // Initialize error tracking
  private initializeErrorTracking(): void {
    if (typeof window === 'undefined') return;

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        timestamp: Date.now(),
        severity: 'high',
        resolved: false
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        errorId: `rejection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        severity: 'medium',
        resolved: false
      });
    });
  }

  // Track error
  trackError(error: SessionError): void {
    const sessionId = this.getCurrentSessionId();
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.errors.push(error);
    }

    // Create alert for error
    this.addAlert({
      id: `error_alert_${error.errorId}`,
      type: 'error',
      severity: error.severity === 'critical' ? 'critical' : 'warning',
      title: 'Application Error Detected',
      description: error.message,
      timestamp: error.timestamp,
      resolved: false,
      actions: []
    });

    this.notifyRealtimeSubscribers({
      type: 'error_tracked',
      error,
      sessionId,
      timestamp: Date.now()
    });
  }

  // Add system alert
  addAlert(alert: SystemAlert): void {
    this.alerts.push(alert);

    // Log to console if enabled
    if (this.config.alerts.channels.includes('console')) {
      const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.warn(`${emoji} System Alert [${alert.severity.toUpperCase()}]: ${alert.title} - ${alert.description}`);
    }

    this.notifyRealtimeSubscribers({
      type: 'alert_created',
      alert,
      timestamp: Date.now()
    });
  }

  // Check system health
  private checkSystemHealth(): void {
    // Check if there are too many errors
    const recentErrors = this.getRecentErrors(5 * 60 * 1000); // 5 minutes
    const errorRate = recentErrors.length / this.getActiveSessions().length;
    
    if (errorRate > this.config.alerts.thresholds.errorRate) {
      this.addAlert({
        id: `high_error_rate_${Date.now()}`,
        type: 'error',
        severity: 'critical',
        title: 'High Error Rate Detected',
        description: `Error rate is ${(errorRate * 100).toFixed(2)}%, which exceeds the threshold of ${(this.config.alerts.thresholds.errorRate * 100).toFixed(2)}%`,
        timestamp: Date.now(),
        resolved: false,
        actions: []
      });
    }
  }

  // Get recent errors
  private getRecentErrors(timeWindow: number): SessionError[] {
    const cutoffTime = Date.now() - timeWindow;
    const errors: SessionError[] = [];
    
    for (const session of this.sessions.values()) {
      errors.push(...session.errors.filter(error => error.timestamp > cutoffTime));
    }
    
    return errors;
  }

  // Start real-time updates
  private startRealtimeUpdates(): void {
    setInterval(() => {
      this.notifyRealtimeSubscribers({
        type: 'realtime_update',
        metrics: this.getRecentMetrics(),
        sessions: this.getActiveSessions(),
        alerts: this.getUnresolvedAlerts(),
        timestamp: Date.now()
      });
    }, this.config.realtime.updateInterval);
  }

  // Subscribe to real-time updates
  subscribeToRealtimeUpdates(callback: (data: any) => void): () => void {
    this.realtimeSubscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.realtimeSubscribers.indexOf(callback);
      if (index > -1) {
        this.realtimeSubscribers.splice(index, 1);
      }
    };
  }

  // Notify real-time subscribers
  private notifyRealtimeSubscribers(data: any): void {
    this.realtimeSubscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in real-time subscriber:', error);
      }
    });
  }

  // Get recent metrics
  getRecentMetrics(timeWindow: number = 5 * 60 * 1000): Record<string, PerformanceMetric[]> {
    const cutoffTime = Date.now() - timeWindow;
    const recentMetrics: Record<string, PerformanceMetric[]> = {};
    
    for (const [metricId, metrics] of this.metrics.entries()) {
      recentMetrics[metricId] = metrics.filter(metric => metric.timestamp > cutoffTime);
    }
    
    return recentMetrics;
  }

  // Get unresolved alerts
  getUnresolvedAlerts(): SystemAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Get system stats
  getSystemStats(): {
    metrics: Record<string, number>;
    sessions: number;
    errors: number;
    alerts: number;
    uptime: number;
  } {
    const activeSessions = this.getActiveSessions();
    const recentErrors = this.getRecentErrors(60 * 60 * 1000); // 1 hour
    const unresolvedAlerts = this.getUnresolvedAlerts();
    
    // Get latest metric values
    const latestMetrics: Record<string, number> = {};
    for (const [metricId, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        latestMetrics[metricId] = metrics[metrics.length - 1].value;
      }
    }
    
    return {
      metrics: latestMetrics,
      sessions: activeSessions.length,
      errors: recentErrors.length,
      alerts: unresolvedAlerts.length,
      uptime: Date.now() - (this.collectInterval ? Date.now() - this.config.metrics.collectInterval : Date.now())
    };
  }

  // Resolve alert
  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.resolved = true;
    alert.resolvedAt = Date.now();
    alert.resolvedBy = resolvedBy;
    
    this.notifyRealtimeSubscribers({
      type: 'alert_resolved',
      alert,
      timestamp: Date.now()
    });
    
    return true;
  }
}

// Export singleton instance
export const monitoringSystem = new AdvancedMonitoringSystem();

// Export types and class for advanced usage
export { AdvancedMonitoringSystem, type MonitoringConfig };
