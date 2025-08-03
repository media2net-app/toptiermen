import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST - Track A/B test events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      variant, 
      event, 
      page, 
      element, 
      userId, 
      sessionId, 
      timestamp = new Date().toISOString() 
    } = body;

    console.log(`🎯 A/B Test Event: ${event} - Variant ${variant} - Page ${page}`);

    // Store A/B test event in database
    const { error } = await supabaseAdmin
      .from('ab_test_events')
      .insert({
        variant,
        event,
        page,
        element,
        user_id: userId,
        session_id: sessionId,
        timestamp,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing A/B test event:', error);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'A/B test event tracked successfully'
    });

  } catch (error) {
    console.error('Error in A/B testing POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Get A/B test analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const event = searchParams.get('event');
    const days = searchParams.get('days') || '7';

    console.log(`📊 Fetching A/B test analytics for page: ${page}, event: ${event}, days: ${days}`);

    let query = supabaseAdmin
      .from('ab_test_events')
      .select('*');

    if (page) {
      query = query.eq('page', page);
    }

    if (event) {
      query = query.eq('event', event);
    }

    // Filter by date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    query = query.gte('created_at', startDate.toISOString());

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching A/B test events:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Calculate analytics
    const analytics = calculateABTestAnalytics(events || []);

    return NextResponse.json({
      success: true,
      analytics,
      totalEvents: events?.length || 0
    });

  } catch (error) {
    console.error('Error in A/B testing GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function calculateABTestAnalytics(events: any[]) {
  const variantStats: { [key: string]: any } = {};
  const eventStats: { [key: string]: any } = {};

  events.forEach(event => {
    // Initialize variant stats
    if (!variantStats[event.variant]) {
      variantStats[event.variant] = {
        totalEvents: 0,
        uniqueUsers: new Set(),
        events: {}
      };
    }

    // Initialize event stats
    if (!eventStats[event.event]) {
      eventStats[event.event] = {
        total: 0,
        variants: {}
      };
    }

    // Count events
    variantStats[event.variant].totalEvents++;
    variantStats[event.variant].uniqueUsers.add(event.user_id || event.session_id);
    
    if (!variantStats[event.variant].events[event.event]) {
      variantStats[event.variant].events[event.event] = 0;
    }
    variantStats[event.variant].events[event.event]++;

    eventStats[event.event].total++;
    if (!eventStats[event.event].variants[event.variant]) {
      eventStats[event.event].variants[event.variant] = 0;
    }
    eventStats[event.event].variants[event.variant]++;
  });

  // Convert to final format
  const result = {
    variants: Object.keys(variantStats).map(variant => ({
      variant,
      totalEvents: variantStats[variant].totalEvents,
      uniqueUsers: variantStats[variant].uniqueUsers.size,
      events: Object.keys(variantStats[variant].events).map(event => ({
        event,
        count: variantStats[variant].events[event]
      }))
    })),
    events: Object.keys(eventStats).map(event => ({
      event,
      total: eventStats[event].total,
      variants: Object.keys(eventStats[event].variants).map(variant => ({
        variant,
        count: eventStats[event].variants[variant],
        percentage: (eventStats[event].variants[variant] / eventStats[event].total * 100).toFixed(1)
      }))
    }))
  };

  return result;
} 