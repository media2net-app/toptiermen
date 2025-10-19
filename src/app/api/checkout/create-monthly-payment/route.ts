import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function getMollieKey() {
  return process.env.MOLLIE_LIVE_KEY || process.env.MOLLIE_TEST_KEY || process.env.MOLLIE_API_KEY || '';
}

function toAmountObject(amountIncl: number) {
  const value = (Math.round(amountIncl * 100) / 100).toFixed(2);
  return { currency: 'EUR', value };
}

// Monthly package pricing
const MONTHLY_PACKAGES = {
  basic: {
    name: 'Basic Tier - Maandelijks',
    monthlyPrice: 49.00,
    description: 'Basic Tier maandelijkse betaling'
  },
  premium: {
    name: 'Premium Tier - Maandelijks', 
    monthlyPrice: 79.00,
    description: 'Premium Tier maandelijkse betaling'
  }
};

export async function POST(req: NextRequest) {
  try {
    const key = getMollieKey();
    if (!key) return NextResponse.json({ error: 'Missing MOLLIE_API_KEY' }, { status: 500 });

    const body = await req.json();
    const { packageId, customerName, customerEmail, billingPeriod } = body;

    if (!packageId || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const packageInfo = MONTHLY_PACKAGES[packageId as keyof typeof MONTHLY_PACKAGES];
    if (!packageInfo) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
    }

    // Read affiliate cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)ttm_ref=([^;]+)/);
    const referrer_code = match ? decodeURIComponent(match[1]) : undefined;

    // For monthly payments, we only charge the monthly amount (not the total)
    // The subscription will be handled by Mollie's recurring payment system
    let amount_incl_vat: number;
    let description: string;
    let periodDescription: string;

    if (billingPeriod === '6months') {
      amount_incl_vat = packageInfo.monthlyPrice; // Only charge monthly amount
      periodDescription = '6 maanden (maandelijks)';
      description = `${packageInfo.name} - ${periodDescription}`;
    } else if (billingPeriod === '12months') {
      amount_incl_vat = packageInfo.monthlyPrice; // Only charge monthly amount
      periodDescription = '12 maanden (maandelijks)';
      description = `${packageInfo.name} - ${periodDescription}`;
    } else {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    console.log('💳 Creating monthly SEPA payment:', {
      packageId,
      amount_incl_vat,
      billingPeriod,
      customerEmail,
      referrer_code
    });

    // Create Mollie payment with SEPA direct debit
    const res = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: toAmountObject(amount_incl_vat),
        description,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/payment/status`,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/mollie/webhook`,
        // method: 'directdebit', // SEPA direct debit (if activated in Mollie account)
        metadata: {
          packageId,
          packageName: packageInfo.name,
          billingPeriod,
          paymentType: 'monthly',
          monthlyPrice: packageInfo.monthlyPrice,
          totalAmount: amount_incl_vat,
          customerName,
          customerEmail,
          referrer_code: referrer_code || null,
          timestamp: new Date().toISOString()
        },
        locale: 'nl_NL'
      }),
    });

    const payment = await res.json();
    if (!res.ok) {
      console.error('Mollie payment creation failed:', {
        status: res.status,
        statusText: res.statusText,
        response: payment
      });
      return NextResponse.json({ 
        error: payment?.detail || payment?.message || 'Mollie error',
        details: payment 
      }, { status: 500 });
    }

    const nowIso = new Date().toISOString();

    // Insert pending order
    await supabaseAdmin.from('orders').upsert({
      mollie_payment_id: payment.id,
      amount_incl_vat,
      currency: 'EUR',
      status: payment.status || 'open',
      customer_email: customerEmail,
      customer_name: customerName,
      referrer_code: referrer_code || null,
      created_at: nowIso,
      updated_at: nowIso,
    }, { onConflict: 'mollie_payment_id' });

    console.log('✅ Monthly SEPA payment created:', payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment?._links?.checkout?.href,
      status: payment.status,
      packageInfo: {
        name: packageInfo.name,
        monthlyPrice: packageInfo.monthlyPrice,
        totalAmount: amount_incl_vat,
        period: periodDescription
      }
    });

  } catch (e: any) {
    console.error('Monthly payment creation error:', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
