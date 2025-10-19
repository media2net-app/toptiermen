import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const affiliateCode = searchParams.get('code');

    if (!affiliateCode) {
      return NextResponse.json({ success: false, error: 'Affiliate code is required' }, { status: 400 });
    }

    console.log('📊 Fetching click stats for affiliate code:', affiliateCode);

    // Get total clicks
    const { data: totalClicks, error: totalError } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('id')
      .eq('code', affiliateCode.toUpperCase());

    if (totalError) {
      console.error('❌ Error fetching total clicks:', totalError);
      return NextResponse.json({ success: false, error: totalError.message }, { status: 500 });
    }

    // Get clicks from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentClicks, error: recentError } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('id')
      .eq('code', affiliateCode.toUpperCase())
      .gte('clicked_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      console.error('❌ Error fetching recent clicks:', recentError);
      return NextResponse.json({ success: false, error: recentError.message }, { status: 500 });
    }

    // Get clicks from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: weeklyClicks, error: weeklyError } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('id')
      .eq('code', affiliateCode.toUpperCase())
      .gte('clicked_at', sevenDaysAgo.toISOString());

    if (weeklyError) {
      console.error('❌ Error fetching weekly clicks:', weeklyError);
      return NextResponse.json({ success: false, error: weeklyError.message }, { status: 500 });
    }

    const stats = {
      totalClicks: totalClicks?.length || 0,
      clicksLast30Days: recentClicks?.length || 0,
      clicksLast7Days: weeklyClicks?.length || 0,
    };

    console.log('✅ Click stats fetched:', stats);
    return NextResponse.json({ success: true, stats });

  } catch (e: any) {
    console.error('❌ Error in affiliate clicks API:', e);
    return NextResponse.json({ success: false, error: e.message || 'Internal server error' }, { status: 500 });
  }
}

