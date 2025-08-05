import { NextResponse } from 'next/server';
import { getCDNPerformance } from '@/lib/cdn-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json({
        success: false,
        error: 'Video URL is required'
      });
    }

    console.log('📊 Testing CDN performance for:', videoUrl);

    // Test CDN performance
    const performance = await getCDNPerformance(videoUrl);

    // Additional performance metrics
    const metrics = {
      ...performance,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      region: request.headers.get('x-vercel-ip-country') || 'unknown',
      isVercel: request.headers.get('x-vercel-deployment-url') ? true : false
    };

    console.log('📈 CDN Performance metrics:', metrics);

    return NextResponse.json({
      success: true,
      metrics,
      recommendations: getPerformanceRecommendations(performance)
    });

  } catch (error: any) {
    console.error('❌ CDN performance test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      metrics: {
        provider: 'unknown',
        responseTime: -1,
        cacheHit: false,
        timestamp: new Date().toISOString()
      }
    });
  }
}

function getPerformanceRecommendations(performance: any) {
  const recommendations = [];

  if (performance.responseTime > 1000) {
    recommendations.push('Consider using a CDN closer to your users');
  }

  if (!performance.cacheHit) {
    recommendations.push('Enable CDN caching for better performance');
  }

  if (performance.responseTime < 100) {
    recommendations.push('Excellent performance! CDN is working optimally');
  }

  return recommendations;
} 