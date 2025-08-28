import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const versionInfo = {
      version: '2.0.1',
      platform: 'Top Tier Men',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      features: {
        cacheBusting: true,
        autoRefresh: true,
        userMigration: true,
        onboarding: true,
        forum: true,
        academy: true,
        brotherhood: true,
        marketing: true,
        admin: true
      },
      database: {
        primaryTable: 'profiles',
        migrationCompleted: true,
        usersTableRemoved: false // Will be true after manual cleanup
      },
      cache: {
        version: '2.0.1',
        localStorageKey: 'ttm-app-version',
        cacheBustKey: 'ttm-cache-bust'
      }
    };

    return NextResponse.json(versionInfo, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-TTM-Version': '2.0.1'
      }
    });
  } catch (error) {
    console.error('Error in system version API:', error);
    return NextResponse.json(
      { error: 'Failed to get system version' },
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
