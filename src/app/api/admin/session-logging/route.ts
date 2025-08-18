import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Session logging disabled to prevent infinite loops
  return NextResponse.json({ success: true, message: 'Session logging disabled' });
}

export async function GET(request: NextRequest) {
  // Session logging disabled to prevent infinite loops
          return NextResponse.json({
            success: true,
            data: {
              sessionLogs: [],
              userActivities: [],
              statistics: {
                totalSessions: 0,
                stuckSessions: 0,
                errorSessions: 0,
                activeUsers: 0,
                totalErrors: 0,
                totalLoops: 0,
                byUserType: {
                  rick: 0,
                  chiel: 0,
                  test: 0,
                  admin: 0
                }
              }
            },
    message: 'Session logging disabled' 
  });
}
