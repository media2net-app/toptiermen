import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPayment } from '@/lib/mollie';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, billingPeriod, amount, description } = body;

    // Validate required fields
    if (!packageId || !billingPeriod || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('💳 Creating Mollie payment:', { packageId, billingPeriod, amount, description });

    // Create payment using Mollie library
    const payment = await createPayment({
      amount: amount,
      currency: 'EUR',
      description: description,
      redirectUrl: `https://platform.toptiermen.eu/payment/success?package=${packageId}&period=${billingPeriod}`,
      webhookUrl: `https://platform.toptiermen.eu/api/payments/webhook`,
      metadata: {
        packageId,
        billingPeriod,
        amount,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Mollie payment created:', payment.id);

    // Store payment in database
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        mollie_payment_id: payment.id,
        package_id: packageId,
        billing_period: billingPeriod,
        amount: amount,
        status: 'pending',
        description: description,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if database insert fails
    }

    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(),
      status: payment.status
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
