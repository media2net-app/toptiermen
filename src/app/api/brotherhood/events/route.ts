import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch brotherhood events
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('brotherhood_events')
      .select(`
        *,
        brotherhood_groups (
          name,
          category
        )
      `)
      .eq('is_public', true)
      .order('date', { ascending: true });

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching brotherhood events:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch events' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      events 
    });

  } catch (error) {
    console.error('Error in brotherhood events GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - Create new brotherhood event
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      type,
      date,
      time,
      location,
      description,
      host,
      max_attendees = 20,
      group_id,
      is_public = true,
      agenda = [],
      doelgroep,
      leerdoelen = []
    } = body;

    // Validate required fields
    if (!title || !type || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, type, date' 
      }, { status: 400 });
    }

    const { data: event, error } = await supabase
      .from('brotherhood_events')
      .insert({
        title,
        type,
        date,
        time,
        location,
        description,
        host,
        host_id: user.id,
        max_attendees,
        group_id,
        is_public,
        agenda,
        doelgroep,
        leerdoelen
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brotherhood event:', error);
      return NextResponse.json({ 
        error: 'Failed to create event' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      event 
    });

  } catch (error) {
    console.error('Error in brotherhood events POST:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
