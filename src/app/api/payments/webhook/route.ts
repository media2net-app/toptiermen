import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
const MOLLIE_API_URL = 'https://api.mollie.com/v2';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id: paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID provided' }, { status: 400 });
    }

    // Fetch payment details from Mollie
    const mollieResponse = await fetch(`${MOLLIE_API_URL}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
      },
    });

    if (!mollieResponse.ok) {
      console.error('Failed to fetch payment from Mollie');
      return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
    }

    const payment = await mollieResponse.json();

    // Update payment status in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: payment.status,
        updated_at: new Date().toISOString()
      })
      .eq('mollie_payment_id', paymentId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    // If payment is successful, activate user subscription
    if (payment.status === 'paid') {
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('*')
        .eq('mollie_payment_id', paymentId)
        .single();

      if (paymentRecord) {
        // Activate user subscription
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: paymentRecord.user_id,
            package_id: paymentRecord.package_id,
            billing_period: paymentRecord.billing_period,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + (paymentRecord.billing_period === 'yearly' ? 365 : 180) * 24 * 60 * 60 * 1000).toISOString(),
            payment_id: paymentRecord.id
          });

        if (subscriptionError) {
          console.error('Subscription creation error:', subscriptionError);
        }
      }
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
