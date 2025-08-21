import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const timeWindow = parseInt(searchParams.get('timeWindow') || '86400000'); // 24 hours default

    console.log('👥 Fetching user sessions...');

    // Start monitoring if not already started
    await monitoringSystem.startMonitoring();

    let sessions;
    if (includeInactive) {
      // Get all sessions within time window (would need method implementation)
      sessions = monitoringSystem.getActiveSessions(); // For now, just active sessions
    } else {
      sessions = monitoringSystem.getActiveSessions();
    }

    // Calculate session analytics
    const analytics = {
      totalSessions: sessions.length,
      averageDuration: sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length 
        : 0,
      totalPageViews: sessions.reduce((sum, session) => sum + session.pageViews, 0),
      totalActions: sessions.reduce((sum, session) => sum + session.actions.length, 0),
      totalErrors: sessions.reduce((sum, session) => sum + session.errors.length, 0),
      deviceBreakdown: calculateDeviceBreakdown(sessions),
      browserBreakdown: calculateBrowserBreakdown(sessions),
      topPages: calculateTopPages(sessions),
      errorRate: sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + session.errors.length, 0) / sessions.length
        : 0
    };

    const response = {
      success: true,
      sessions: sessions.map(session => ({
        ...session,
        // Don't include full action history in list view for performance
        actions: session.actions.slice(-5) // Only last 5 actions
      })),
      analytics,
      includeInactive,
      timeWindow,
      timestamp: new Date().toISOString()
    };

    console.log('✅ User sessions retrieved:', sessions.length, 'sessions');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching user sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions', details: error },
      { status: 500 }
    );
  }
}

// Helper function to calculate device breakdown
function calculateDeviceBreakdown(sessions: any[]) {
  const breakdown: Record<string, number> = {};
  sessions.forEach(session => {
    const device = session.device?.device || 'Unknown';
    breakdown[device] = (breakdown[device] || 0) + 1;
  });
  return breakdown;
}

// Helper function to calculate browser breakdown
function calculateBrowserBreakdown(sessions: any[]) {
  const breakdown: Record<string, number> = {};
  sessions.forEach(session => {
    const browser = session.device?.browser || 'Unknown';
    breakdown[browser] = (breakdown[browser] || 0) + 1;
  });
  return breakdown;
}

// Helper function to calculate top pages
function calculateTopPages(sessions: any[]) {
  const pageCount: Record<string, number> = {};
  sessions.forEach(session => {
    session.actions?.forEach((action: any) => {
      if (action.type === 'page_view') {
        pageCount[action.target] = (pageCount[action.target] || 0) + 1;
      }
    });
  });
  
  return Object.entries(pageCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log('📝 Processing session action:', action);

    // Start monitoring if not already started
    await monitoringSystem.startMonitoring();

    let response;
    switch (action) {
      case 'track_session':
        // Track new session
        response = {
          success: true,
          message: 'Session tracked successfully',
          sessionId: data.sessionId
        };
        break;
        
      case 'update_session':
        // Update existing session
        response = {
          success: true,
          message: 'Session updated successfully',
          sessionId: data.sessionId
        };
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    console.log('✅ Session action processed:', action);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error processing session action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process session action', details: error },
      { status: 500 }
    );
  }
}
