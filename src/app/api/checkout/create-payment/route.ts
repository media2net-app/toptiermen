import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function getMollieKey() {
  return process.env.MOLLIE_API_KEY || process.env.MOLLIE_TEST_KEY || process.env.MOLLIE_LIVE_KEY || '';
}

function toAmountObject(amountIncl: number) {
  const value = (Math.round(amountIncl * 100) / 100).toFixed(2);
  return { currency: 'EUR', value };
}

export async function POST(req: NextRequest) {
  try {
    const key = getMollieKey();
    if (!key) return NextResponse.json({ error: 'Missing MOLLIE_API_KEY' }, { status: 500 });

    const body = await req.json();
    const amount_incl_vat: number = body.amount_incl_vat;
    const description: string = body.description || 'TopTierMen order';
    const redirectUrl: string = body.redirectUrl || (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    const customerEmail: string | undefined = body.email;
    const customerName: string | undefined = body.name;
    const meta: Record<string, any> = body.metadata || {};

    if (!amount_incl_vat || amount_incl_vat <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Read affiliate cookie directly
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)ttm_ref=([^;]+)/);
    const referrer_code = match ? decodeURIComponent(match[1]) : undefined;

    if (referrer_code) meta.referrer_code = referrer_code;

    // Create Mollie payment
    const res = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: toAmountObject(amount_incl_vat),
        description,
        redirectUrl,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/mollie/webhook`,
        metadata: meta,
        locale: 'nl_NL',
      }),
    });

    const payment = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: payment?.message || 'Mollie error' }, { status: 500 });
    }

    const nowIso = new Date().toISOString();

    // Insert pending order
    await supabaseAdmin.from('orders').upsert({
      mollie_payment_id: payment.id,
      amount_incl_vat,
      currency: 'EUR',
      status: payment.status || 'open',
      customer_email: customerEmail || null,
      customer_name: customerName || null,
      referrer_code: referrer_code || null,
      created_at: nowIso,
      updated_at: nowIso,
    }, { onConflict: 'mollie_payment_id' });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment?._links?.checkout?.href,
      status: payment.status,
    });
  } catch (e: any) {
    console.error('create-payment error', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
