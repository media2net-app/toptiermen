import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('📖 Fetching journal entries...', { userId, date });

    let query = supabase
      .from('mind_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Filter by specific date if provided
    if (date) {
      query = query.eq('date', date);
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error('❌ Error fetching journal entries:', error);
      return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
    }

    console.log('✅ Journal entries fetched:', entries?.length || 0, 'entries');

    return NextResponse.json({ 
      success: true, 
      entries: entries || [] 
    });

  } catch (error) {
    console.error('❌ Journal entries API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      date, 
      gratitude, 
      dailyReview, 
      tomorrowPriorities, 
      mood, 
      stressLevel, 
      energyLevel, 
      sleepQuality, 
      notes 
    } = await request.json();

    if (!userId || !date) {
      return NextResponse.json({ error: 'User ID and date required' }, { status: 400 });
    }

    console.log('📖 Saving journal entry...', { userId, date });

    const { data, error } = await supabase
      .from('mind_journal_entries')
      .upsert({
        user_id: userId,
        date,
        gratitude,
        daily_review: dailyReview,
        tomorrow_priorities: tomorrowPriorities,
        mood,
        stress_level: stressLevel,
        energy_level: energyLevel,
        sleep_quality: sleepQuality,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving journal entry:', error);
      return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 });
    }

    console.log('✅ Journal entry saved:', data.id);

    return NextResponse.json({ 
      success: true, 
      entry: data 
    });

  } catch (error) {
    console.error('❌ Save journal entry API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { 
      entryId, 
      gratitude, 
      dailyReview, 
      tomorrowPriorities, 
      mood, 
      stressLevel, 
      energyLevel, 
      sleepQuality, 
      notes 
    } = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    console.log('📖 Updating journal entry...', { entryId });

    const { data, error } = await supabase
      .from('mind_journal_entries')
      .update({
        gratitude,
        daily_review: dailyReview,
        tomorrow_priorities: tomorrowPriorities,
        mood,
        stress_level: stressLevel,
        energy_level: energyLevel,
        sleep_quality: sleepQuality,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating journal entry:', error);
      return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
    }

    console.log('✅ Journal entry updated:', data.id);

    return NextResponse.json({ 
      success: true, 
      entry: data 
    });

  } catch (error) {
    console.error('❌ Update journal entry API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
