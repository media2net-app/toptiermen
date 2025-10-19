import { NextRequest, NextResponse } from 'next/server';

function getMollieKey() {
  return process.env.MOLLIE_LIVE_KEY || process.env.MOLLIE_TEST_KEY || process.env.MOLLIE_API_KEY || '';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID is required' }, { status: 400 });
    }

    const key = getMollieKey();
    if (!key) {
      return NextResponse.json({ success: false, error: 'Mollie API key not configured' }, { status: 500 });
    }

    console.log('🔍 Checking payment status for:', paymentId);

    // Fetch payment status from Mollie
    const response = await fetch(`https://api.mollie.com/v2/payments/${encodeURIComponent(paymentId)}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Mollie API error:', response.status, response.statusText);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch payment status' 
      }, { status: 500 });
    }

    const payment = await response.json();
    
    console.log('✅ Payment status retrieved:', {
      id: payment.id,
      status: payment.status,
      amount: payment.amount
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        description: payment.description,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        failedAt: payment.failedAt,
        canceledAt: payment.canceledAt,
        expiredAt: payment.expiredAt
      }
    });

  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

