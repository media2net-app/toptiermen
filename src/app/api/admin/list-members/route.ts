import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Admin-only members listing via service role (server-side), bypassing RLS for read
// Returns combined profile + payment flags used by ledenbeheer page
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5000');

    // Fetch profiles (single source of truth table in this project)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (profilesError) {
      console.error('❌ list-members: profiles error', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Fetch paid prelaunch packages to flag payment
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('prelaunch_packages')
      .select('email, discounted_price, package_name, payment_period, created_at, mollie_payment_id, payment_status')
      .eq('payment_status', 'paid');

    if (paymentsError) {
      console.warn('⚠️ list-members: payments error', paymentsError);
    }

    const paymentsMap = new Map<string, any>();
    (payments || []).forEach((p) => {
      if (!p?.email) return;
      paymentsMap.set(String(p.email).toLowerCase(), p);
    });

    const members = (profiles || []).map((u: any) => {
      const payment = paymentsMap.get(String(u.email || '').toLowerCase());
      return {
        ...u,
        payment_status: payment ? 'paid' : 'unpaid',
        payment_data: payment
          ? {
              amount: payment.discounted_price,
              package_name: payment.package_name,
              payment_period: payment.payment_period,
              payment_date: payment.created_at,
              mollie_payment_id: payment.mollie_payment_id,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, members, total: members.length });
  } catch (e) {
    console.error('❌ list-members error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
