import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, billingPeriod, amount, description } = body;

    console.log('🧪 Test Payment API called:', { packageId, billingPeriod, amount, description });

    // Validate required fields
    if (!packageId || !billingPeriod || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Simulate Mollie payment creation
    const mockPaymentId = `test_payment_${Date.now()}`;
    const mockCheckoutUrl = `https://www.mollie.com/checkout/test/${mockPaymentId}`;

    console.log('✅ Test payment created:', { paymentId: mockPaymentId, checkoutUrl: mockCheckoutUrl });

    return NextResponse.json({
      paymentId: mockPaymentId,
      checkoutUrl: mockCheckoutUrl,
      status: 'open',
      message: 'Test payment created successfully - this is a mock response'
    });

  } catch (error) {
    console.error('Test payment creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
