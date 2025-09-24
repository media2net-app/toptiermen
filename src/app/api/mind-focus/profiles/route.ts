import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('🧘 Fetching mind focus profiles...');

    const { data: profiles, error } = await supabaseAdmin
      .from('mind_focus_profiles')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    return NextResponse.json({ profiles: profiles || [] });

  } catch (error) {
    console.error('❌ Mind focus profiles API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}