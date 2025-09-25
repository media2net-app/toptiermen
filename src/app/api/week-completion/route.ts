import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST - Save week completion
export async function POST(request: NextRequest) {
  try {
    console.log('📅 Saving week completion...');
    
    const body = await request.json();
    const { userId, schemaId, weekNumber, completedAt, completedDays } = body;

    console.log('📅 Week completion data:', { 
      userId, 
      schemaId, 
      weekNumber, 
      completedAt, 
      completedDaysCount: completedDays?.length 
    });

    if (!userId || !schemaId || !weekNumber || !completedAt || !completedDays) {
      console.error('❌ Missing required fields:', { 
        userId: !!userId, 
        schemaId: !!schemaId, 
        weekNumber: !!weekNumber, 
        completedAt: !!completedAt, 
        completedDays: !!completedDays 
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if week completion already exists
    const { data: existingCompletion, error: checkError } = await supabaseAdmin
      .from('user_week_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('schema_id', schemaId)
      .eq('week_number', weekNumber)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing completion:', checkError);
      return NextResponse.json({ error: 'Failed to check existing completion' }, { status: 500 });
    }

    if (existingCompletion) {
      console.log('📅 Week completion already exists, updating...');
      
      // Update existing completion
      const { data, error } = await supabaseAdmin
        .from('user_week_completions')
        .update({
          completed_at: completedAt,
          completed_days: completedDays,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCompletion.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating week completion:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('✅ Week completion updated successfully:', data.id);
      return NextResponse.json({ success: true, data, isUpdate: true });
    } else {
      console.log('📅 Creating new week completion...');
      
      // Create new completion
      const { data, error } = await supabaseAdmin
        .from('user_week_completions')
        .insert({
          user_id: userId,
          schema_id: schemaId,
          week_number: weekNumber,
          completed_at: completedAt,
          completed_days: completedDays
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating week completion:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('✅ Week completion created successfully:', data.id);
      return NextResponse.json({ success: true, data, isUpdate: false });
    }

  } catch (error) {
    console.error('❌ Unexpected error saving week completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch week completions for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const schemaId = searchParams.get('schemaId');

    if (!userId || !schemaId) {
      return NextResponse.json({ error: 'Missing userId or schemaId' }, { status: 400 });
    }

    console.log('📅 Fetching week completions for:', { userId, schemaId });

    const { data, error } = await supabaseAdmin
      .from('user_week_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('schema_id', schemaId)
      .order('week_number', { ascending: true });

    if (error) {
      console.error('❌ Error fetching week completions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Fetched week completions:', data?.length || 0);
    return NextResponse.json({ success: true, completions: data || [] });

  } catch (error) {
    console.error('❌ Unexpected error fetching week completions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
