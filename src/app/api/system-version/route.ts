import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const versionInfo = {
      version: '2.0.3',
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
        admin: true,
        timeoutProtection: true,
        errorBoundary: true
      },
      database: {
        primaryTable: 'profiles',
        migrationCompleted: true,
        usersTableRemoved: false // Will be true after manual cleanup
      },
      cache: {
        version: '2.0.3',
        localStorageKey: 'ttm-app-version',
        cacheBustKey: 'ttm-cache-bust'
      }
    };

    return NextResponse.json(versionInfo, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-TTM-Version': '2.0.3'
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
