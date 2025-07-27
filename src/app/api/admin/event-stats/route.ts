import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    console.log('📊 Fetching event statistics for period:', period);

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get total events
    const { count: totalEvents, error: totalError } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total events:', totalError);
    }

    // Get upcoming events
    const { count: upcomingEvents, error: upcomingError } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('start_date', now.toISOString())
      .eq('status', 'upcoming');

    if (upcomingError) {
      console.error('Error fetching upcoming events:', upcomingError);
    }

    // Get events created in period
    const { count: newEvents, error: newError } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    if (newError) {
      console.error('Error fetching new events:', newError);
    }

    // Get total participants
    const { count: totalParticipants, error: participantsError } = await supabaseAdmin
      .from('event_participants')
      .select('*', { count: 'exact', head: true });

    if (participantsError) {
      console.error('Error fetching total participants:', participantsError);
    }

    // Get events by category
    const { data: eventsByCategory, error: categoryError } = await supabaseAdmin
      .from('events')
      .select(`
        event_categories(name, color),
        count
      `)
      .gte('created_at', startDate.toISOString());

    if (categoryError) {
      console.error('Error fetching events by category:', categoryError);
    }

    // Get most popular events
    const { data: popularEvents, error: popularError } = await supabaseAdmin
      .from('events')
      .select(`
        title,
        current_participants,
        max_participants,
        event_categories(name)
      `)
      .order('current_participants', { ascending: false })
      .limit(5);

    if (popularError) {
      console.error('Error fetching popular events:', popularError);
    }

    // Get events by status
    const { data: eventsByStatus, error: statusError } = await supabaseAdmin
      .from('events')
      .select('status, count')
      .gte('created_at', startDate.toISOString());

    if (statusError) {
      console.error('Error fetching events by status:', statusError);
    }

    const stats = {
      totalEvents: totalEvents || 0,
      upcomingEvents: upcomingEvents || 0,
      newEvents: newEvents || 0,
      totalParticipants: totalParticipants || 0,
      eventsByCategory: eventsByCategory || [],
      popularEvents: popularEvents || [],
      eventsByStatus: eventsByStatus || [],
      period,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Event statistics calculated:', stats);

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Error fetching event statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch event statistics' }, { status: 500 });
  }
} 