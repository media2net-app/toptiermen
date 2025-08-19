import { NextRequest, NextResponse } from 'next/server';
import { createPayment, getPaymentMethods } from '@/lib/mollie';

export async function GET() {
  try {
    // Test Mollie connection by getting available payment methods
    const methods = await getPaymentMethods();
    
    return NextResponse.json({
      success: true,
      message: 'Mollie connection successful',
      availableMethods: methods.map((method: any) => ({
        id: method.id,
        name: method.description,
        image: method.image?.size1x
      }))
    });

  } catch (error) {
    console.error('Mollie test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Mollie connection failed'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testPayment } = body;

    if (testPayment) {
      // Create a test payment (no webhook for local testing)
      const payment = await createPayment({
        amount: 10.00,
        currency: 'EUR',
        description: 'Test Payment - Top Tier Men',
        redirectUrl: 'http://localhost:3000/test-payment-success',
        metadata: {
          test: true,
          userId: 'test-user-123',
          planId: 'test-plan'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Test payment created successfully',
        paymentId: payment.id,
        checkoutUrl: payment.getCheckoutUrl(),
        status: payment.status
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid test request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Mollie test payment error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Test payment failed'
      },
      { status: 500 }
    );
  }
}
