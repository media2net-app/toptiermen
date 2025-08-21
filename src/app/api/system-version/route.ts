import { NextRequest, NextResponse } from 'next/server';
import { 
  getCurrentVersion, 
  getVersion, 
  getPerformanceSummary,
  isSystemReady,
  VERSION_HISTORY 
} from '@/lib/version-config';

export async function GET(request: NextRequest) {
  try {
    const currentVersion = getCurrentVersion();
    const performanceSummary = getPerformanceSummary();
    const systemReady = isSystemReady();

    return NextResponse.json({
      success: true,
      system: {
        currentVersion: currentVersion.version,
        name: currentVersion.name,
        status: currentVersion.status,
        releaseDate: currentVersion.releaseDate,
        ready: systemReady,
        score: systemReady ? 100 : 0,
      },
      features: currentVersion.features,
      performance: {
        current: currentVersion.performance,
        improvements: performanceSummary,
      },
      tests: currentVersion.tests,
      readiness: {
        ready: systemReady,
        score: systemReady ? 100 : 0,
      },
      changelog: currentVersion.changelog,
      history: VERSION_HISTORY.map(v => ({
        version: v.version,
        name: v.name,
        status: v.status,
        releaseDate: v.releaseDate,
      })),
    });
  } catch (error) {
    console.error('❌ System version API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get system version information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, version } = body;

    switch (action) {
      case 'get-version':
        if (!version) {
          return NextResponse.json(
            { success: false, error: 'Version parameter required' },
            { status: 400 }
          );
        }
        
        const versionInfo = getVersion(version);
        if (!versionInfo) {
          return NextResponse.json(
            { success: false, error: `Version ${version} not found` },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          version: versionInfo,
        });

      case 'performance-comparison':
        const v1_0 = getVersion('1.0.0');
        const v1_1 = getVersion('1.1.0');
        
        if (!v1_0 || !v1_1) {
          return NextResponse.json(
            { success: false, error: 'Version information not available' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          comparison: {
            authTimeout: {
              v1_0: v1_0.performance.authTimeout,
              v1_1: v1_1.performance.authTimeout,
              improvement: `${((v1_0.performance.authTimeout - v1_1.performance.authTimeout) / v1_0.performance.authTimeout * 100).toFixed(0)}% sneller`,
            },
            sessionChecks: {
              v1_0: v1_0.performance.sessionCheckInterval / 60000, // Convert to minutes
              v1_1: v1_1.performance.sessionCheckInterval / 60000,
              improvement: `${((v1_1.performance.sessionCheckInterval - v1_0.performance.sessionCheckInterval) / v1_0.performance.sessionCheckInterval * 100).toFixed(0)}% minder frequent`,
            },
            connections: {
              v1_0: v1_0.performance.maxConnections,
              v1_1: v1_1.performance.maxConnections,
              improvement: `${v1_1.performance.maxConnections}x meer gelijktijdige gebruikers`,
            },
            retries: {
              v1_0: v1_0.performance.maxRetries,
              v1_1: v1_1.performance.maxRetries,
              improvement: v1_1.performance.maxRetries > 0 ? 'Automatische error recovery' : 'Geen error recovery',
            },
          },
        });

      case 'system-status':
        const systemReady = isSystemReady();
        const performanceSummary = getPerformanceSummary();
        return NextResponse.json({
          success: true,
          status: {
            currentVersion: getCurrentVersion().version,
            ready: systemReady,
            score: systemReady ? 100 : 0,
            issues: systemReady ? [] : ['System not ready for production'],
            recommendations: systemReady ? ['System is ready for production'] : ['Complete system setup required'],
            performance: performanceSummary,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ System version action failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'System version action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
