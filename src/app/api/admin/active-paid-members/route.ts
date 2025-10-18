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

// Returns only active paid members using same logic as ledenbeheer:
// - profiles.status === 'active'
// - AND (package_type/subscription_tier indicates Premium/Lifetime OR a paid record exists in prelaunch_packages)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '2000');
    const debug = searchParams.get('debug') === '1';

    // 1) Fetch profiles (minimal fields for emailing)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, package_type, subscription_tier, status')
      .limit(limit);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // 2) Fetch paid prelaunch packages (by email)
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('prelaunch_packages')
      .select('email, payment_status')
      .eq('payment_status', 'paid');

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError);
      // Do not fail entirely; continue without payments map
    }

    const paidEmails = new Set<string>((payments || []).map((p: any) => (p.email || '').toLowerCase()));

    // 3) Filter active + paid
    const isPaidTier = (pkg?: string | null, tier?: string | null) => {
      const s1 = (pkg || '').toLowerCase();
      const s2 = (tier || '').toLowerCase();
      return s1.includes('premium') || s1.includes('lifetime') || s2.includes('premium') || s2.includes('lifetime');
    };

    // Consider users active if status is 'active' or empty/null (some rows may not have status yet)
    const filtered = (profiles || []).filter((u: any) => {
      if (!u?.email) return false;
      const st = (u.status || '').toLowerCase();
      const active = st === 'active' || st === '' || st === 'paid';
      const paidFlag = isPaidTier(u.package_type, u.subscription_tier) || paidEmails.has((u.email || '').toLowerCase());
      return active && paidFlag;
    });

    // 4) Map to minimal response
    const members = filtered.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.full_name || (u.email ? u.email.split('@')[0] : 'Onbekend'),
    }));

    const payload: any = { success: true, members, total: members.length };
    if (debug) {
      payload.debug = {
        profiles_total: (profiles || []).length,
        payments_total: (payments || []).length,
        paid_emails_matched: paidEmails.size,
        matched_by_tier: (profiles || []).filter((u: any) => isPaidTier(u.package_type, u.subscription_tier)).length,
        matched_active_paid: members.length,
        sample_first5: members.slice(0, 5),
      };
    }
    return NextResponse.json(payload);
  } catch (e) {
    console.error('❌ Error in active-paid-members API:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
