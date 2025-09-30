import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching schema progress for user:', userId);

    // Get user's training profile to determine which schemas they should have access to
    const { data: profile, error: profileError } = await supabase
      .from('user_training_profiles')
      .select('training_goal, training_frequency, equipment_type')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.log('⚠️ No training profile found for user');
      return NextResponse.json({
        unlockedSchemas: { 1: true, 2: false, 3: false },
        message: 'No training profile found'
      });
    }

    // Get user's schema progress for the current training goal
    const { data: progressData, error: progressError } = await supabase
      .from('user_training_schema_progress')
      .select(`
        schema_id,
        completed_days,
        current_day,
        started_at,
        completed_at,
        training_schemas!inner(
          id,
          name,
          schema_nummer,
          training_goal,
          equipment_type
        )
      `)
      .eq('user_id', userId)
      .eq('training_schemas.training_goal', profile.training_goal)
      .eq('training_schemas.equipment_type', profile.equipment_type);

    if (progressError) {
      console.log('⚠️ Error fetching progress:', progressError);
      return NextResponse.json({
        unlockedSchemas: { 1: true, 2: false, 3: false },
        message: 'Error fetching progress'
      });
    }

    // Calculate which schemas should be unlocked
    const unlockedSchemas = { 1: true, 2: false, 3: false };
    
    if (progressData && progressData.length > 0) {
      // Find Schema 1 progress
      const schema1Progress = progressData.find((p: any) => p.training_schemas.schema_nummer === 1);
      
      if (schema1Progress) {
        // Compute weeks from completed_days (DB column) or from completed_at fallback
        const totalDays1 = (schema1Progress.completed_days ?? 0) as number;
        // If completed_at is set, treat as 8 weeks completed
        const weeksCompleted = schema1Progress.completed_at ? 8 : Math.floor(totalDays1 / 7);
        
        if (weeksCompleted >= 8) {
          unlockedSchemas[2] = true;
          
          // Check if user has completed 8 weeks of Schema 2
          const schema2Progress = progressData.find((p: any) => p.training_schemas.schema_nummer === 2);
          if (schema2Progress) {
            const totalDays2 = (schema2Progress.completed_days ?? 0) as number;
            const schema2WeeksCompleted = schema2Progress.completed_at ? 8 : Math.floor(totalDays2 / 7);
            if (schema2WeeksCompleted >= 8) {
              unlockedSchemas[3] = true;
            }
          }
        }
      }
    }

    console.log('✅ Schema progress calculated:', {
      userId,
      trainingGoal: profile.training_goal,
      equipmentType: profile.equipment_type,
      unlockedSchemas,
      progressData: progressData?.length || 0
    });

    return NextResponse.json({
      unlockedSchemas,
      trainingProfile: profile,
      progressData: progressData || [],
      message: 'Schema progress fetched successfully'
    });

  } catch (error) {
    console.error('❌ Error in schema progress GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      unlockedSchemas: { 1: true, 2: false, 3: false }
    }, { status: 500 });
  }
}
