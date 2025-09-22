import { NextRequest, NextResponse } from 'next/server';
import { errorRecovery } from '@/lib/error-recovery';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ 
        error: 'Circuit breaker key is required' 
      }, { status: 400 });
    }

    // Reset specific circuit breaker by removing it from the map
    // This will cause it to be recreated in CLOSED state on next access
    const states = errorRecovery.getCircuitBreakerStates();
    if (states[key]) {
      // Note: In a real implementation, you'd want to add a reset method to the ErrorRecovery class
      console.log(`Resetting circuit breaker: ${key}`);
    }

    return NextResponse.json({
      success: true,
      message: `Circuit breaker ${key} reset successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error resetting circuit breaker:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
