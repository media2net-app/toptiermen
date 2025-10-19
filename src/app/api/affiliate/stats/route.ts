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
    console.log('📊 Fetching comprehensive affiliate stats for:', normalizedCode);

    // Get click statistics
    const { count: totalClicks, error: clicksError } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('code', normalizedCode);

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError);
    }

    // Get clicks in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: clicksLast30Days, error: clicks30Error } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('code', normalizedCode)
      .gte('clicked_at', thirtyDaysAgo.toISOString());

    if (clicks30Error) {
      console.error('Error fetching 30-day clicks:', clicks30Error);
    }

    // Get orders with this affiliate code
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('referrer_code', normalizedCode);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Calculate referral statistics
    const totalReferrals = orders?.length || 0;
    const paidOrders = orders?.filter(order => order.status === 'paid' || order.status === 'authorized') || [];
    const activeReferrals = paidOrders.length;

    // Calculate earnings (20% commission on amount excl. VAT)
    const totalEarned = paidOrders.reduce((sum, order) => {
      // Calculate amount excl. VAT (amount_incl_vat / 1.21)
      const amountExclVat = order.amount_incl_vat / 1.21;
      // 20% commission
      const commission = amountExclVat * 0.20;
      return sum + commission;
    }, 0);

    // Calculate monthly earnings (last 30 days)
    const monthlyOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.paid_at || order.created_at);
      return orderDate >= thirtyDaysAgo;
    });

    const monthlyEarnings = monthlyOrders.reduce((sum, order) => {
      const amountExclVat = order.amount_incl_vat / 1.21;
      const commission = amountExclVat * 0.20;
      return sum + commission;
    }, 0);

    // Get last referral date
    const lastReferral = paidOrders.length > 0 
      ? paidOrders.sort((a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime())[0]
      : null;

    const stats = {
      totalClicks: totalClicks || 0,
      clicksLast30Days: clicksLast30Days || 0,
      totalReferrals,
      activeReferrals,
      totalEarned: Math.round(totalEarned * 100) / 100, // Round to 2 decimals
      monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
      lastReferral: lastReferral ? {
        date: lastReferral.paid_at || lastReferral.created_at,
        amount: lastReferral.amount_incl_vat,
        customer: lastReferral.customer_name
      } : null
    };

    console.log('✅ Affiliate stats calculated:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (e: any) {
    console.error('Error in affiliate stats API:', e);
    return NextResponse.json({ 
      success: false, 
      error: e.message || 'Internal server error' 
    }, { status: 500 });
  }
}
