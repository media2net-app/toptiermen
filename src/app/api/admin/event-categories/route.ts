import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('event_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching event categories:', error);
      return NextResponse.json({ error: 'Failed to fetch event categories' }, { status: 500 });
    }

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error in event categories API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, icon } = body;

    const { data: category, error } = await supabaseAdmin
      .from('event_categories')
      .insert({
        name,
        description,
        color,
        icon
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event category:', error);
      return NextResponse.json({ error: 'Failed to create event category' }, { status: 500 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error in event categories API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 