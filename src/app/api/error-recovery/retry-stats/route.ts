import { NextRequest, NextResponse } from 'next/server';
import { errorRecovery } from '@/lib/error-recovery';

export async function GET(request: NextRequest) {
  try {
    const stats = errorRecovery.getRetryStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching retry stats:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
