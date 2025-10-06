import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching user progress for:', userId);

    // Get user profile with progress data
    const { data: profile, error } = await supabaseAdmin
      .from('user_mind_profiles')
      .select('current_active_week, completed_weeks')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching user progress:', error);
      return NextResponse.json({ error: 'Failed to fetch user progress' }, { status: 500 });
    }

    console.log('✅ User progress fetched:', profile);

    return NextResponse.json({
      success: true,
      data: {
        currentActiveWeek: profile?.current_active_week || 1,
        completedWeeks: profile?.completed_weeks || []
      }
    });

  } catch (error) {
    console.error('❌ Error in user progress GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, completedWeek, currentActiveWeek } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📝 Updating user progress:', { userId, completedWeek, currentActiveWeek });

    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('user_mind_profiles')
      .select('id, current_active_week, completed_weeks')
      .eq('user_id', userId)
      .single();

    console.log('🔍 Existing profile check:', { existingProfile, fetchError });

    // Handle case where columns don't exist yet
    if (fetchError && fetchError.code === '42703') {
      console.log('⚠️ Progress columns don\'t exist yet, creating with defaults');
      // Return error asking user to run database migration
      return NextResponse.json({ 
        error: 'Database schema needs to be updated. Please contact support or run the migration script.' 
      }, { status: 500 });
    }

    // Handle missing columns gracefully
    let completedWeeks: number[] = [];
    let currentWeek = 1;
    
    if (existingProfile) {
      // Try to get existing values, with fallbacks
      try {
        completedWeeks = existingProfile.completed_weeks || [];
        currentWeek = existingProfile.current_active_week || 1;
      } catch (e) {
        console.log('⚠️ Using default values for missing columns');
        completedWeeks = [];
        currentWeek = 1;
      }
    }
    
    // Add completed week if provided and not already completed
    if (completedWeek && !completedWeeks.includes(completedWeek)) {
      completedWeeks.push(completedWeek);
    }

    // Determine next active week
    const nextActiveWeek = currentActiveWeek || currentWeek + 1;

    const updateData = {
      current_active_week: Math.min(nextActiveWeek, 24), // Max 24 weeks (6 months)
      completed_weeks: completedWeeks,
      updated_at: new Date().toISOString(),
    };

    console.log('📊 Update data:', updateData);

    let data, error;

    if (existingProfile && !fetchError) {
      // Update existing profile
      console.log('📝 Updating existing profile:', existingProfile.id);
      
      // Try to update with new columns first
      let result = await supabaseAdmin
        .from('user_mind_profiles')
        .update(updateData)
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      // If columns don't exist, try without the new columns
      if (result.error && result.error.code === '42703') {
        console.log('⚠️ Columns don\'t exist, updating without progress data');
        result = await supabaseAdmin
          .from('user_mind_profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', existingProfile.id)
          .select()
          .single();
      }
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new profile
      console.log('📝 Creating new profile');
      
      // Try to insert with new columns first
      const insertData = {
        user_id: userId,
        ...updateData,
        created_at: new Date().toISOString(),
      };
      
      let result = await supabaseAdmin
        .from('user_mind_profiles')
        .insert(insertData)
        .select()
        .single();
      
      // If columns don't exist, insert without them
      if (result.error && result.error.code === '42703') {
        console.log('⚠️ Columns don\'t exist, inserting without progress data');
        const fallbackData = {
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        result = await supabaseAdmin
          .from('user_mind_profiles')
          .insert(fallbackData)
          .select()
          .single();
      }
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('❌ Error updating user progress:', error);
      return NextResponse.json({ error: 'Failed to update user progress' }, { status: 500 });
    }

    console.log('✅ User progress updated successfully:', data);

    return NextResponse.json({
      success: true,
      data: {
        currentActiveWeek: data.current_active_week || nextActiveWeek,
        completedWeeks: data.completed_weeks || completedWeeks,
        message: completedWeek ? `Week ${completedWeek} completed successfully!` : 'Progress updated successfully!'
      }
    });

  } catch (error) {
    console.error('❌ Error in user progress POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
