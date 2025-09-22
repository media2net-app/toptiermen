import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface PerformanceMetrics {
  timestamp: string;
  endpoint: string;
  queryTime: number;
  dataSize: number;
  cacheHit: boolean;
  userId?: string;
}

// In-memory performance store (in production, use Redis or database)
const performanceStore: PerformanceMetrics[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const timeRange = searchParams.get('timeRange') || '1h';

    // Calculate time range
    const now = new Date();
    const timeRangeMs = timeRange === '1h' ? 60 * 60 * 1000 : 
                       timeRange === '24h' ? 24 * 60 * 60 * 1000 : 
                       7 * 24 * 60 * 60 * 1000; // 7 days default
    const startTime = new Date(now.getTime() - timeRangeMs);

    // Filter metrics by endpoint and time range
    const filteredMetrics = performanceStore.filter(metric => {
      const metricTime = new Date(metric.timestamp);
      const matchesEndpoint = !endpoint || metric.endpoint.includes(endpoint);
      const matchesTimeRange = metricTime >= startTime;
      return matchesEndpoint && matchesTimeRange;
    });

    // Calculate performance statistics
    const stats = {
      totalRequests: filteredMetrics.length,
      averageQueryTime: filteredMetrics.length > 0 
        ? filteredMetrics.reduce((sum, m) => sum + m.queryTime, 0) / filteredMetrics.length 
        : 0,
      maxQueryTime: filteredMetrics.length > 0 
        ? Math.max(...filteredMetrics.map(m => m.queryTime)) 
        : 0,
      minQueryTime: filteredMetrics.length > 0 
        ? Math.min(...filteredMetrics.map(m => m.queryTime)) 
        : 0,
      cacheHitRate: filteredMetrics.length > 0 
        ? (filteredMetrics.filter(m => m.cacheHit).length / filteredMetrics.length) * 100 
        : 0,
      averageDataSize: filteredMetrics.length > 0 
        ? filteredMetrics.reduce((sum, m) => sum + m.dataSize, 0) / filteredMetrics.length 
        : 0,
      slowQueries: filteredMetrics.filter(m => m.queryTime > 1000).length, // > 1 second
      timeRange,
      endpoint: endpoint || 'all'
    };

    // Get endpoint breakdown
    const endpointBreakdown = filteredMetrics.reduce((acc, metric) => {
      if (!acc[metric.endpoint]) {
        acc[metric.endpoint] = {
          count: 0,
          totalTime: 0,
          avgTime: 0,
          cacheHits: 0
        };
      }
      acc[metric.endpoint].count++;
      acc[metric.endpoint].totalTime += metric.queryTime;
      acc[metric.endpoint].avgTime = acc[metric.endpoint].totalTime / acc[metric.endpoint].count;
      if (metric.cacheHit) acc[metric.endpoint].cacheHits++;
      return acc;
    }, {} as Record<string, any>);

    // Get recent slow queries
    const recentSlowQueries = filteredMetrics
      .filter(m => m.queryTime > 1000)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      stats,
      endpointBreakdown,
      recentSlowQueries,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in performance monitoring API:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const metrics: PerformanceMetrics = await request.json();

    // Validate required fields
    if (!metrics.timestamp || !metrics.endpoint || metrics.queryTime === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: timestamp, endpoint, queryTime' 
      }, { status: 400 });
    }

    // Add to performance store
    performanceStore.push(metrics);

    // Keep only last 1000 entries to prevent memory issues
    if (performanceStore.length > 1000) {
      performanceStore.splice(0, performanceStore.length - 1000);
    }

    console.log(`📊 Performance metric recorded: ${metrics.endpoint} - ${metrics.queryTime}ms`);

    return NextResponse.json({ 
      success: true, 
      message: 'Performance metric recorded' 
    });

  } catch (error: any) {
    console.error('Error recording performance metric:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
