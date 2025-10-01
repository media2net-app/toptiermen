import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching active training schema for user:', userId);

    try {
      // Get user's selected schema
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('selected_schema_id')
        .eq('id', userId)
        .single();

      if (userError) {
        console.log('⚠️  User data not available');
        return NextResponse.json({ 
          hasActiveSchema: false,
          message: 'No active training schema found'
        });
      }

      if (!userData.selected_schema_id) {
        console.log('ℹ️  No active schema selected');
        return NextResponse.json({ 
          hasActiveSchema: false,
          message: 'No training schema selected'
        });
      }

      // Get the selected schema details
      const { data: schemaData, error: schemaError } = await supabase
        .from('training_schemas')
        .select('*')
        .eq('id', userData.selected_schema_id)
        .single();

      if (schemaError) {
        console.log('⚠️  Schema not found');
        return NextResponse.json({ 
          hasActiveSchema: false,
          message: 'Selected schema not found'
        });
      }

      // Get schema days first
      const { data: daysData, error: daysError } = await supabase
        .from('training_schema_days')
        .select('*')
        .eq('schema_id', userData.selected_schema_id)
        .order('day_number');

      // Then get exercises for each day
      let daysWithExercises: any[] = [];
      if (daysData && !daysError) {
        for (const day of daysData) {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('training_schema_exercises')
            .select('*')
            .eq('schema_day_id', day.id)
            .order('order_index');
          
          daysWithExercises.push({
            ...day,
            training_schema_exercises: exercisesData || []
          });
        }
      }

      if (daysError) {
        console.log('⚠️  Schema days not available:', daysError);
      } else {
        console.log('✅ Schema days loaded:', daysWithExercises?.length || 0);
        if (daysWithExercises) {
          daysWithExercises.forEach((day, index) => {
            const exerciseCount = day.training_schema_exercises?.length || 0;
            console.log(`   Day ${day.day_number} (${day.name}): ${exerciseCount} exercises`);
          });
        }
      }

      // Get user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_training_schema_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('schema_id', userData.selected_schema_id)
        .single();

      if (progressError) {
        console.log('⚠️  User progress not available');
      }

      // Get day-specific completion status
      const { data: dayProgressData, error: dayProgressError } = await supabase
        .from('user_training_day_progress')
        .select('schema_day_id, completed, completed_at')
        .eq('user_id', userId)
        .in('schema_day_id', daysWithExercises.map(day => day.id));

      if (dayProgressError) {
        console.log('⚠️  Day progress not available:', dayProgressError);
      }

      // Add completion status to each day
      const daysWithCompletion = daysWithExercises.map(day => {
        const dayProgress = dayProgressData?.find(dp => dp.schema_day_id === day.id);
        return {
          ...day,
          isCompleted: dayProgress?.completed || false,
          completedAt: dayProgress?.completed_at || null
        };
      });

      // Get training frequency to compute total_days as freq*8 for display
      let displayProgress = progressData || null as any;
      try {
        const { data: tp } = await supabase
          .from('user_training_profiles')
          .select('training_frequency')
          .eq('user_id', userId)
          .maybeSingle();
        // Fallback: use number of schema days as weekly frequency if profile missing
        const daysPerWeekFallback = Math.max(1, (daysWithExercises?.length || 0));
        const freq = Math.max(1, tp?.training_frequency ?? daysPerWeekFallback ?? 7);
        if (displayProgress) {
          const completedDays = displayProgress.completed_days ?? 0;
          displayProgress = {
            ...displayProgress,
            total_days: freq * 8,
            completed_days: completedDays,
          };
        }
      } catch {}

      console.log('✅ Active training schema fetched successfully');
      return NextResponse.json({
        hasActiveSchema: true,
        schema: schemaData,
        days: daysWithCompletion || [],
        progress: displayProgress || null
      }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });

    } catch (error) {
      console.log('⚠️  Database not available, using fallback');
      return NextResponse.json({ 
        hasActiveSchema: false,
        message: 'Database not available'
      }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

  } catch (error) {
    console.error('❌ Error in user training schema GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
} 