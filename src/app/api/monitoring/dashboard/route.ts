import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring-system';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching complete monitoring dashboard data...');

    // Start monitoring if not already started
    await monitoringSystem.startMonitoring();

    // Get comprehensive dashboard data
    const [
      systemStats,
      recentMetrics,
      activeSessions,
      unresolvedAlerts
    ] = await Promise.all([
      monitoringSystem.getSystemStats(),
      monitoringSystem.getRecentMetrics(5 * 60 * 1000), // 5 minutes
      monitoringSystem.getActiveSessions(),
      monitoringSystem.getUnresolvedAlerts()
    ]);

    // Calculate derived metrics
    const dashboardData = {
      overview: {
        systemHealth: calculateSystemHealth(systemStats, unresolvedAlerts),
        totalSessions: activeSessions.length,
        totalErrors: systemStats.errors,
        totalAlerts: unresolvedAlerts.length,
        uptime: systemStats.uptime,
        timestamp: new Date().toISOString()
      },
      
      performance: {
        responseTime: getLatestMetricValue(recentMetrics, 'page_load_time'),
        memoryUsage: getLatestMetricValue(recentMetrics, 'js_heap_used'),
        cacheHitRate: getLatestMetricValue(recentMetrics, 'cache_hit_rate'),
        errorRate: calculateErrorRate(activeSessions),
        trends: calculateTrends(recentMetrics)
      },

      sessions: {
        active: activeSessions.length,
        averageDuration: activeSessions.length > 0 
          ? activeSessions.reduce((sum, s) => sum + s.duration, 0) / activeSessions.length 
          : 0,
        totalPageViews: activeSessions.reduce((sum, s) => sum + s.pageViews, 0),
        deviceBreakdown: calculateDeviceBreakdown(activeSessions),
        browserBreakdown: calculateBrowserBreakdown(activeSessions)
      },

      alerts: {
        total: unresolvedAlerts.length,
        critical: unresolvedAlerts.filter(a => a.severity === 'critical').length,
        warning: unresolvedAlerts.filter(a => a.severity === 'warning').length,
        recent: unresolvedAlerts
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5) // Only latest 5 alerts
      },

      realTimeMetrics: {
        metrics: Object.entries(recentMetrics).reduce((acc, [key, values]) => {
          acc[key] = values.slice(-20); // Last 20 data points for charts
          return acc;
        }, {} as Record<string, any[]>),
        lastUpdate: Date.now()
      }
    };

    console.log('✅ Complete monitoring dashboard data retrieved');
    return NextResponse.json({
      success: true,
      dashboard: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching monitoring dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data', details: error },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateSystemHealth(stats: any, alerts: any[]): {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
} {
  let score = 100;
  const issues: string[] = [];

  // Check alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

  if (criticalAlerts > 0) {
    score -= criticalAlerts * 20;
    issues.push(`${criticalAlerts} critical alert(s)`);
  }

  if (warningAlerts > 0) {
    score -= warningAlerts * 10;
    issues.push(`${warningAlerts} warning alert(s)`);
  }

  // Check error rate
  if (stats.errors > 10) {
    score -= 15;
    issues.push('High error rate detected');
  }

  // Check performance metrics
  if (stats.metrics.page_load_time > 3000) {
    score -= 10;
    issues.push('Slow page load times');
  }

  if (stats.metrics.js_heap_used > 100) {
    score -= 10;
    issues.push('High memory usage');
  }

  // Determine status
  let status: 'healthy' | 'warning' | 'critical';
  if (score >= 80) {
    status = 'healthy';
  } else if (score >= 60) {
    status = 'warning';
  } else {
    status = 'critical';
  }

  return {
    status,
    score: Math.max(0, score),
    issues
  };
}

function getLatestMetricValue(metrics: Record<string, any[]>, metricId: string): number | null {
  const metricData = metrics[metricId];
  if (!metricData || metricData.length === 0) return null;
  return metricData[metricData.length - 1].value;
}

function calculateErrorRate(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  const totalErrors = sessions.reduce((sum, session) => sum + (session.errors?.length || 0), 0);
  return totalErrors / sessions.length;
}

function calculateTrends(metrics: Record<string, any[]>): Record<string, 'up' | 'down' | 'stable'> {
  const trends: Record<string, 'up' | 'down' | 'stable'> = {};

  for (const [metricId, data] of Object.entries(metrics)) {
    if (data.length < 2) {
      trends[metricId] = 'stable';
      continue;
    }

    const recent = data.slice(-5); // Last 5 data points
    const first = recent[0].value;
    const last = recent[recent.length - 1].value;
    const change = ((last - first) / first) * 100;

    if (change > 5) {
      trends[metricId] = 'up';
    } else if (change < -5) {
      trends[metricId] = 'down';
    } else {
      trends[metricId] = 'stable';
    }
  }

  return trends;
}

function calculateDeviceBreakdown(sessions: any[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  sessions.forEach(session => {
    const device = session.device?.device || 'Unknown';
    breakdown[device] = (breakdown[device] || 0) + 1;
  });
  return breakdown;
}

function calculateBrowserBreakdown(sessions: any[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  sessions.forEach(session => {
    const browser = session.device?.browser || 'Unknown';
    breakdown[browser] = (breakdown[browser] || 0) + 1;
  });
  return breakdown;
}
