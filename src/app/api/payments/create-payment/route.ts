import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mollie API configuration
const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
const MOLLIE_API_URL = 'https://api.mollie.com/v2';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, billingPeriod, amount, description } = body;

    if (!MOLLIE_API_KEY) {
      return NextResponse.json({ error: 'Mollie API key not configured' }, { status: 500 });
    }

    // Validate required fields
    if (!packageId || !billingPeriod || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create payment in Mollie
    const mollieResponse = await fetch(`${MOLLIE_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: amount.toFixed(2)
        },
        description: description,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?package=${packageId}&period=${billingPeriod}`,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
        metadata: {
          packageId,
          billingPeriod,
          amount,
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (!mollieResponse.ok) {
      const errorData = await mollieResponse.json();
      console.error('Mollie API error:', errorData);
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    const paymentData = await mollieResponse.json();

    // Store payment in database
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        mollie_payment_id: paymentData.id,
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
      paymentId: paymentData.id,
      checkoutUrl: paymentData._links.checkout.href,
      status: paymentData.status
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
