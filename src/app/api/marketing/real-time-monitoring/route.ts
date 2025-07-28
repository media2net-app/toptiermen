import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsEngine } from '@/lib/ai-insights-engine';
import { competitiveCache } from '@/lib/competitive-cache';

interface MonitoringRequest {
  competitors: string[];
  metrics: ('ctr' | 'spend' | 'engagement' | 'reach')[];
  timeRange: '1h' | '24h' | '7d' | '30d';
  alertThresholds?: {
    ctrChange?: number;
    spendChange?: number;
    engagementChange?: number;
    newAds?: number;
  };
}

interface RealTimeMetric {
  competitorId: string;
  competitorName: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  alert: boolean;
  timestamp: string;
}

interface MonitoringResponse {
  success: boolean;
  data: {
    metrics: RealTimeMetric[];
    alerts: any[];
    insights: any[];
    trends: any[];
  };
  lastUpdated: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MonitoringRequest = await request.json();
    const { competitors, metrics, timeRange, alertThresholds } = body;

    // Check cache first
    const cacheKey = `monitoring:${competitors.join(',')}:${metrics.join(',')}:${timeRange}`;
    const cachedData = competitiveCache.get<MonitoringResponse>(cacheKey);
    
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        lastUpdated: new Date().toISOString()
      });
    }

    // Generate real-time metrics
    const realTimeMetrics = await generateRealTimeMetrics(competitors, metrics, timeRange);
    
    // Generate alerts based on thresholds
    const alerts = generateAlerts(realTimeMetrics, alertThresholds);
    
    // Generate insights
    const insights = await generateInsights(realTimeMetrics);
    
    // Analyze trends
    const trends = analyzeTrends(realTimeMetrics);

    const response: MonitoringResponse = {
      success: true,
      data: {
        metrics: realTimeMetrics,
        alerts,
        insights,
        trends
      },
      lastUpdated: new Date().toISOString()
    };

    // Cache for 5 minutes (real-time data)
    competitiveCache.set(cacheKey, response, 5 * 60 * 1000);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Real-time monitoring API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch real-time monitoring data',
        lastUpdated: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitors = searchParams.get('competitors')?.split(',') || [];
    const metrics = searchParams.get('metrics')?.split(',') as any[] || ['ctr', 'spend'];
    const timeRange = searchParams.get('timeRange') || '24h';

    if (competitors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Competitors parameter is required' },
        { status: 400 }
      );
    }

    // Use POST logic with GET parameters
    const body: MonitoringRequest = {
      competitors,
      metrics,
      timeRange: timeRange as any
    };

    // Create a new request with the body
    const newRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body)
    });

    // Convert to NextRequest
    const nextRequest = newRequest as any;
    nextRequest.nextUrl = request.nextUrl;
    nextRequest.cookies = request.cookies;
    nextRequest.geo = request.geo;
    nextRequest.ip = request.ip;

    return POST(nextRequest);

  } catch (error) {
    console.error('Real-time monitoring GET API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch real-time monitoring data',
        lastUpdated: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Generate real-time metrics for competitors
 */
async function generateRealTimeMetrics(
  competitors: string[], 
  metrics: string[], 
  timeRange: string
): Promise<RealTimeMetric[]> {
  const realTimeMetrics: RealTimeMetric[] = [];

  // Mock competitor data
  const competitorData = {
    '1': { name: 'De Nieuwe Lichting', current: { ctr: 0.045, spend: 2500, engagement: 0.08, reach: 85000 }, previous: { ctr: 0.038, spend: 2200, engagement: 0.065, reach: 78000 } },
    '2': { name: 'FitnessPro Nederland', current: { ctr: 0.032, spend: 1800, engagement: 0.055, reach: 62000 }, previous: { ctr: 0.029, spend: 1600, engagement: 0.048, reach: 58000 } },
    '3': { name: 'MindfulLife Coaching', current: { ctr: 0.028, spend: 1200, engagement: 0.042, reach: 45000 }, previous: { ctr: 0.025, spend: 1100, engagement: 0.038, reach: 42000 } }
  };

  for (const competitorId of competitors) {
    const competitor = competitorData[competitorId as keyof typeof competitorData];
    if (!competitor) continue;

    for (const metric of metrics) {
      const currentValue = competitor.current[metric as keyof typeof competitor.current] as number;
      const previousValue = competitor.previous[metric as keyof typeof competitor.previous] as number;
      const change = currentValue - previousValue;
      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

      realTimeMetrics.push({
        competitorId,
        competitorName: competitor.name,
        metric,
        currentValue,
        previousValue,
        change,
        changePercent,
        trend: changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable',
        alert: Math.abs(changePercent) > 20, // Alert if change > 20%
        timestamp: new Date().toISOString()
      });
    }
  }

  return realTimeMetrics;
}

/**
 * Generate alerts based on thresholds
 */
function generateAlerts(metrics: RealTimeMetric[], thresholds?: any): any[] {
  const alerts: any[] = [];

  if (!thresholds) return alerts;

  metrics.forEach(metric => {
    // CTR change alert
    if (thresholds.ctrChange && Math.abs(metric.changePercent) > thresholds.ctrChange) {
      alerts.push({
        id: `alert-${Date.now()}-${metric.competitorId}`,
        type: 'ctr_change',
        severity: Math.abs(metric.changePercent) > 50 ? 'high' : 'medium',
        title: `${metric.competitorName} CTR ${metric.changePercent > 0 ? 'Increased' : 'Decreased'} Significantly`,
        description: `${metric.metric.toUpperCase()} changed by ${Math.abs(metric.changePercent).toFixed(1)}%`,
        competitorId: metric.competitorId,
        metric: metric.metric,
        value: metric.currentValue,
        change: metric.changePercent,
        timestamp: new Date().toISOString()
      });
    }

    // Spend change alert
    if (thresholds.spendChange && Math.abs(metric.changePercent) > thresholds.spendChange) {
      alerts.push({
        id: `alert-${Date.now()}-${metric.competitorId}`,
        type: 'spend_change',
        severity: Math.abs(metric.changePercent) > 50 ? 'high' : 'medium',
        title: `${metric.competitorName} Ad Spend ${metric.changePercent > 0 ? 'Increased' : 'Decreased'}`,
        description: `Spend changed by ${Math.abs(metric.changePercent).toFixed(1)}%`,
        competitorId: metric.competitorId,
        metric: metric.metric,
        value: metric.currentValue,
        change: metric.changePercent,
        timestamp: new Date().toISOString()
      });
    }
  });

  return alerts;
}

/**
 * Generate insights from real-time data
 */
async function generateInsights(metrics: RealTimeMetric[]): Promise<any[]> {
  const insights: any[] = [];

  // Find top performers
  const topPerformers = metrics
    .filter(m => m.metric === 'ctr')
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 3);

  if (topPerformers.length > 0) {
    insights.push({
      id: `insight-${Date.now()}-1`,
      type: 'performance',
      title: 'Top Performing Competitors',
      description: `${topPerformers[0].competitorName} leads with ${(topPerformers[0].currentValue * 100).toFixed(1)}% CTR`,
      competitors: topPerformers.map(p => p.competitorName),
      confidence: 85,
      impact: 'high'
    });
  }

  // Find significant changes
  const significantChanges = metrics.filter(m => Math.abs(m.changePercent) > 30);
  
  significantChanges.forEach(change => {
    insights.push({
      id: `insight-${Date.now()}-${change.competitorId}`,
      type: 'trend',
      title: `${change.competitorName} ${change.metric.toUpperCase()} ${change.changePercent > 0 ? 'Surge' : 'Drop'}`,
      description: `${change.metric.toUpperCase()} ${change.changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(change.changePercent).toFixed(1)}%`,
      competitorId: change.competitorId,
      metric: change.metric,
      change: change.changePercent,
      confidence: 90,
      impact: 'medium'
    });
  });

  return insights;
}

/**
 * Analyze trends from metrics
 */
function analyzeTrends(metrics: RealTimeMetric[]): any[] {
  const trends: any[] = [];

  // Overall market trend
  const avgCTR = metrics.filter(m => m.metric === 'ctr').reduce((sum, m) => sum + m.currentValue, 0) / metrics.filter(m => m.metric === 'ctr').length;
  const avgSpend = metrics.filter(m => m.metric === 'spend').reduce((sum, m) => sum + m.currentValue, 0) / metrics.filter(m => m.metric === 'spend').length;

  trends.push({
    id: `trend-${Date.now()}-1`,
    metric: 'market_ctr',
    value: avgCTR,
    trend: 'increasing',
    description: `Market average CTR: ${(avgCTR * 100).toFixed(2)}%`,
    confidence: 75
  });

  trends.push({
    id: `trend-${Date.now()}-2`,
    metric: 'market_spend',
    value: avgSpend,
    trend: 'increasing',
    description: `Market average spend: €${avgSpend.toLocaleString()}`,
    confidence: 80
  });

  return trends;
} 