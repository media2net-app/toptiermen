import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isPremium = searchParams.get('isPremium');

    console.log('🧘 Fetching meditation library...', { type, isPremium });

    let query = supabase
      .from('mind_meditation_library')
      .select('*')
      .order('created_at', { ascending: true });

    // Apply filters if provided
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (isPremium !== null) {
      query = query.eq('is_premium', isPremium === 'true');
    }

    const { data: meditations, error } = await query;

    if (error) {
      console.error('❌ Error fetching meditation library:', error);
      return NextResponse.json({ error: 'Failed to fetch meditation library' }, { status: 500 });
    }

    console.log('✅ Meditation library fetched:', meditations?.length || 0, 'items');

    return NextResponse.json({ 
      success: true, 
      meditations: meditations || [] 
    });

  } catch (error) {
    console.error('❌ Meditation library API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      type, 
      duration, 
      description, 
      instructions, 
      audioUrl, 
      isPremium = false 
    } = await request.json();

    console.log('🧘 Creating new meditation...', { title, type, duration });

    const { data, error } = await supabase
      .from('mind_meditation_library')
      .insert({
        title,
        type,
        duration,
        description,
        instructions,
        audio_url: audioUrl,
        is_premium: isPremium
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating meditation:', error);
      return NextResponse.json({ error: 'Failed to create meditation' }, { status: 500 });
    }

    console.log('✅ Meditation created:', data.id);

    return NextResponse.json({ 
      success: true, 
      meditation: data 
    });

  } catch (error) {
    console.error('❌ Create meditation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
