import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeWindow = parseInt(searchParams.get('timeWindow') || '300000'); // 5 minutes default
    const category = searchParams.get('category') || 'all';

    console.log('📊 Fetching monitoring metrics...');

    // Start monitoring if not already started
    await monitoringSystem.startMonitoring();

    // Get recent metrics
    const recentMetrics = monitoringSystem.getRecentMetrics(timeWindow);
    
    // Filter by category if specified
    let filteredMetrics = recentMetrics;
    if (category !== 'all') {
      filteredMetrics = {};
      for (const [metricId, metrics] of Object.entries(recentMetrics)) {
        const filteredMetricList = metrics.filter(m => m.category === category);
        if (filteredMetricList.length > 0) {
          filteredMetrics[metricId] = filteredMetricList;
        }
      }
    }

    // Get system stats
    const systemStats = monitoringSystem.getSystemStats();

    const response = {
      success: true,
      metrics: filteredMetrics,
      stats: systemStats,
      timeWindow,
      category,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Monitoring metrics retrieved:', Object.keys(filteredMetrics).length, 'metric types');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching monitoring metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'track_user_action':
        if (data.sessionId && data.action) {
          monitoringSystem.trackUserAction(data.sessionId, data.action);
          return NextResponse.json({ success: true, action: 'user_action_tracked' });
        }
        break;

      case 'track_page_view':
        if (data.sessionId && data.path) {
          monitoringSystem.trackPageView(data.sessionId, data.path);
          return NextResponse.json({ success: true, action: 'page_view_tracked' });
        }
        break;

      case 'track_error':
        if (data.error) {
          monitoringSystem.trackError(data.error);
          return NextResponse.json({ success: true, action: 'error_tracked' });
        }
        break;

      case 'resolve_alert':
        if (data.alertId) {
          const resolved = monitoringSystem.resolveAlert(data.alertId, data.resolvedBy);
          return NextResponse.json({ success: resolved, action: 'alert_resolved' });
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { success: false, error: 'Missing required data' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error in monitoring metrics POST:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed', details: error },
      { status: 500 }
    );
  }
}
