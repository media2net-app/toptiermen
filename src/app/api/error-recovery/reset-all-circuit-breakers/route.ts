import { NextRequest, NextResponse } from 'next/server';
import { errorRecovery } from '@/lib/error-recovery';

export async function POST(request: NextRequest) {
  try {
    errorRecovery.resetCircuitBreakers();
    
    return NextResponse.json({
      success: true,
      message: 'All circuit breakers reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error resetting all circuit breakers:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
