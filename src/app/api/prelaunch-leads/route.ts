import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching prelaunch leads...');

    // Get leads with UTM tracking data
    const { data: leads, error } = await supabaseAdmin
      .from('prelaunch_emails')
      .select(`
        id,
        email,
        source,
        status,
        package,
        notes,
        subscribed_at,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term
      `)
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching leads:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch leads' 
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${leads?.length || 0} leads`);

    return NextResponse.json({
      success: true,
      leads: leads || []
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
