import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const affiliateCode = searchParams.get('code');

    if (!affiliateCode) {
      return NextResponse.json({ success: false, error: 'Affiliate code is required' }, { status: 400 });
    }

    const normalizedCode = affiliateCode.toUpperCase();
    console.log('📊 Fetching affiliate purchases for:', normalizedCode);

    // Get orders with this affiliate code
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('referrer_code', normalizedCode)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ success: false, error: ordersError.message }, { status: 500 });
    }

    // Process the orders to include package information
    const processedPurchases = (orders || []).map(order => {
      // Determine package type and billing period from amount
      let packageType = 'Onbekend';
      let billingPeriod = 'Onbekend';
      let packageName = 'Onbekend';

      // Basic package detection based on amount
      if (order.amount_incl_vat === 49) {
        packageType = 'Basic Tier';
        packageName = 'Basic Tier';
        billingPeriod = 'Maandelijks';
      } else if (order.amount_incl_vat === 79) {
        packageType = 'Premium Tier';
        packageName = 'Premium Tier';
        billingPeriod = 'Maandelijks';
      } else if (order.amount_incl_vat === 44) {
        packageType = 'Basic Tier';
        packageName = 'Basic Tier';
        billingPeriod = 'Jaarlijks (10% korting)';
      } else if (order.amount_incl_vat === 71) {
        packageType = 'Premium Tier';
        packageName = 'Premium Tier';
        billingPeriod = 'Jaarlijks (10% korting)';
      } else if (order.amount_incl_vat === 294) {
        packageType = 'Basic Tier';
        packageName = 'Basic Tier';
        billingPeriod = '6 maanden';
      } else if (order.amount_incl_vat === 474) {
        packageType = 'Premium Tier';
        packageName = 'Premium Tier';
        billingPeriod = '6 maanden';
      } else if (order.amount_incl_vat === 528) {
        packageType = 'Basic Tier';
        packageName = 'Basic Tier';
        billingPeriod = '12 maanden';
      } else if (order.amount_incl_vat === 852) {
        packageType = 'Premium Tier';
        packageName = 'Premium Tier';
        billingPeriod = '12 maanden';
      }

      // Calculate commission
      const amountExclVat = order.amount_incl_vat / 1.21;
      const commission = amountExclVat * 0.20;

      return {
        id: order.id,
        mollie_payment_id: order.mollie_payment_id,
        customer_name: order.customer_name || 'Onbekend',
        customer_email: order.customer_email || 'Onbekend',
        package_name: packageName,
        package_type: packageType,
        billing_period: billingPeriod,
        amount_incl_vat: order.amount_incl_vat,
        amount_excl_vat: Math.round(amountExclVat * 100) / 100,
        commission: parseFloat(commission.toFixed(2)),
        status: order.status,
        created_at: order.created_at,
        paid_at: order.paid_at || order.created_at
      };
    });

    console.log(`✅ Found ${processedPurchases.length} purchases for affiliate ${normalizedCode}`);

    return NextResponse.json({
      success: true,
      purchases: processedPurchases,
      total: processedPurchases.length
    });

  } catch (e: any) {
    console.error('Error in affiliate purchases API:', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
