import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test_user_id, type, page_url, element_selector, description, priority, screenshot_url } = body;

    // Validate required fields
    if (!test_user_id || !type || !page_url || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate type
    if (!['bug', 'improvement', 'general'].includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type. Must be bug, improvement, or general' 
      }, { status: 400 });
    }

    // Validate priority
    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return NextResponse.json({ 
        error: 'Invalid priority. Must be low, medium, high, or critical' 
      }, { status: 400 });
    }

    // Insert the note
    const { data, error } = await supabase
      .from('test_notes')
      .insert({
        test_user_id,
        type,
        page_url,
        element_selector,
        description,
        priority: priority || 'medium',
        status: 'open',
        screenshot_url
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting test note:', error);
      return NextResponse.json({ 
        error: 'Failed to save note' 
      }, { status: 500 });
    }

    // Update the test user's note count
    const { error: updateError } = await supabase
      .from('test_users')
      .update({ 
        total_notes: supabase.rpc('increment', { x: 1 }),
        last_activity: new Date().toISOString()
      })
      .eq('id', test_user_id);

    if (updateError) {
      console.error('Error updating test user:', updateError);
      // Don't fail the request if this update fails
    }

    return NextResponse.json({ 
      success: true, 
      note: data 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test_user_id = searchParams.get('test_user_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabase
      .from('test_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (test_user_id) {
      query = query.eq('test_user_id', test_user_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching test notes:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch notes' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      notes: data 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 