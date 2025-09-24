import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📅 Fetching brotherhood events...');

    const { data: events, error } = await supabaseAdmin
      .from('brotherhood_events')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });

  } catch (error) {
    console.error('❌ Brotherhood events API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}