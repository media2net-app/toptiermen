import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching events from database...');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    const { data: events, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching events:', error);
      return NextResponse.json({ error: `Failed to fetch events: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Events fetched successfully:', events?.length || 0, 'events');
    return NextResponse.json({ success: true, events: events || [] });
  } catch (error) {
    console.error('❌ Error in events API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category_id, organizer_id, location, start_date, end_date, max_participants, is_featured, is_public, registration_deadline, cover_image_url } = body;

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert({
        title,
        description,
        category_id,
        organizer_id,
        location,
        start_date,
        end_date,
        max_participants,
        is_featured,
        is_public,
        registration_deadline,
        cover_image_url
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 