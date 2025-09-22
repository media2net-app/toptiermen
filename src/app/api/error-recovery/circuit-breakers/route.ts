import { NextRequest, NextResponse } from 'next/server';
import { errorRecovery } from '@/lib/error-recovery';

export async function GET(request: NextRequest) {
  try {
    const states = errorRecovery.getCircuitBreakerStates();
    
    return NextResponse.json({
      success: true,
      states,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching circuit breaker states:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
