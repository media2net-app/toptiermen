import { NextRequest, NextResponse } from 'next/server';
import { createPayment, getPayment, cancelPayment, refundPayment } from '@/lib/mollie';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-payment':
        const { planId, userId, email } = data;
        
        // Get plan details
        const plans = {
          monthly: { price: 29.99, name: 'Maandelijkse Membership' },
          yearly: { price: 299.99, name: 'Jaarlijkse Membership' },
          lifetime: { price: 999.99, name: 'Lifetime Membership' }
        };
        
        const plan = plans[planId as keyof typeof plans];
        if (!plan) {
          return NextResponse.json(
            { success: false, error: 'Invalid plan' },
            { status: 400 }
          );
        }

        const payment = await createPayment({
          amount: plan.price,
          currency: 'EUR',
          description: `${plan.name} - Top Tier Men`,
          redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/payment-success`,
          webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/mollie/webhook`,
          metadata: {
            planId,
            userId,
            email,
            planName: plan.name
          }
        });

        return NextResponse.json({
          success: true,
          paymentId: payment.id,
          checkoutUrl: payment.getCheckoutUrl()
        });

      case 'get-payment':
        const { paymentId } = data;
        const paymentData = await getPayment(paymentId);
        
        return NextResponse.json({
          success: true,
          payment: paymentData
        });

      case 'cancel-payment':
        const { paymentId: cancelPaymentId } = data;
        const canceledPayment = await cancelPayment(cancelPaymentId);
        
        return NextResponse.json({
          success: true,
          payment: canceledPayment
        });

      case 'refund-payment':
        const { paymentId: refundPaymentId, amount } = data;
        const refundedPayment = await refundPayment(refundPaymentId, amount);
        
        return NextResponse.json({
          success: true,
          refund: refundedPayment
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Mollie payment API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const payment = await getPayment(paymentId);
    
    return NextResponse.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Mollie payment GET error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment'
      },
      { status: 500 }
    );
  }
}
