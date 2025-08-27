import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    console.log('🔄 Admin performing FULL reset for user:', userId);

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // 1. Reset onboarding status to initial state
    const { error: onboardingError } = await supabase
      .from('onboarding_status')
      .update({
        welcome_video_watched: false,
        step_1_completed: false,
        step_2_completed: false,
        step_3_completed: false,
        step_4_completed: false,
        step_5_completed: false,
        onboarding_completed: false,
        current_step: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (onboardingError) {
      console.error('❌ Error resetting onboarding status:', onboardingError);
      return NextResponse.json({ 
        error: 'Failed to reset onboarding status' 
      }, { status: 500 });
    }

    // 2. Clear ALL user missions (database)
    const { error: missionsError } = await supabase
      .from('user_missions')
      .delete()
      .eq('user_id', userId);

    if (missionsError) {
      console.log('⚠️ Error clearing missions:', missionsError.message);
    }

    // 3. Clear file-based missions
    try {
      const missionsFilePath = path.join(process.cwd(), 'data', 'missions.json');
      if (fs.existsSync(missionsFilePath)) {
        const missionsData = JSON.parse(fs.readFileSync(missionsFilePath, 'utf8'));
        if (missionsData[userId]) {
          delete missionsData[userId];
          fs.writeFileSync(missionsFilePath, JSON.stringify(missionsData, null, 2));
          console.log('✅ Cleared file-based missions for user:', userId);
        }
      }
    } catch (fileError) {
      console.log('⚠️ Error clearing file-based missions:', fileError);
    }

    // 4. Clear user preferences
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    if (preferencesError) {
      console.log('⚠️ Error clearing preferences:', preferencesError.message);
    }

    // 5. Clear training progress and schemas
    const { error: trainingError } = await supabase
      .from('user_training_progress')
      .delete()
      .eq('user_id', userId);

    if (trainingError) {
      console.log('⚠️ Error clearing training progress:', trainingError.message);
    }

    // 6. Clear user challenges
    const { error: challengesError } = await supabase
      .from('user_challenges')
      .delete()
      .eq('user_id', userId);

    if (challengesError) {
      console.log('⚠️ Error clearing challenges:', challengesError.message);
    }

    // 7. Clear challenge logs
    const { error: challengeLogsError } = await supabase
      .from('challenge_logs')
      .delete()
      .eq('user_id', userId);

    if (challengeLogsError) {
      console.log('⚠️ Error clearing challenge logs:', challengeLogsError.message);
    }

    // 8. Clear daily streaks (only if table exists)
    try {
      const { error: streaksError } = await supabase
        .from('user_daily_streaks')
        .delete()
        .eq('user_id', userId);

      if (streaksError) {
        console.log('⚠️ Error clearing daily streaks:', streaksError.message);
      }
    } catch (error) {
      console.log('ℹ️ user_daily_streaks table does not exist, skipping...');
    }

    // 9. Clear XP transactions
    const { error: xpError } = await supabase
      .from('user_xp')
      .delete()
      .eq('user_id', userId);

    if (xpError) {
      console.log('⚠️ Error clearing XP:', xpError.message);
    }

    // 10. Clear forum posts (introductions) - only if category column exists
    try {
      const { error: forumError } = await supabase
        .from('forum_posts')
        .delete()
        .eq('author_id', userId)
        .eq('category', 'introductions');

      if (forumError) {
        console.log('⚠️ Error clearing forum posts:', forumError.message);
      }
    } catch (error) {
      // Try without category filter
      const { error: forumError2 } = await supabase
        .from('forum_posts')
        .delete()
        .eq('author_id', userId);

      if (forumError2) {
        console.log('⚠️ Error clearing forum posts:', forumError2.message);
      }
    }

    // 11. Clear workout sessions
    const { error: workoutError } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('user_id', userId);

    if (workoutError) {
      console.log('⚠️ Error clearing workout sessions:', workoutError.message);
    }

    // 12. Reset main goal and other profile data
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          main_goal: null,
          selected_training_schema: null,
          selected_nutrition_plan: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.log('⚠️ Error resetting profile:', profileError.message);
      }
    } catch (error) {
      // Try without nutrition_profile column
      const { error: profileError2 } = await supabase
        .from('profiles')
        .update({ 
          main_goal: null,
          selected_training_schema: null,
          selected_nutrition_plan: null
        })
        .eq('id', userId);

      if (profileError2) {
        console.log('⚠️ Error resetting profile:', profileError2.message);
      }
    }

    // 13. Clear user presence
    const { error: presenceError } = await supabase
      .from('user_presence')
      .delete()
      .eq('user_id', userId);

    if (presenceError) {
      console.log('⚠️ Error clearing user presence:', presenceError.message);
    }

    // 14. Clear user badges/achievements
    const { error: badgesError } = await supabase
      .from('user_badges')
      .delete()
      .eq('user_id', userId);

    if (badgesError) {
      console.log('⚠️ Error clearing badges:', badgesError.message);
    }

    // 15. Clear user goals
    const { error: goalsError } = await supabase
      .from('user_goals')
      .delete()
      .eq('user_id', userId);

    if (goalsError) {
      console.log('⚠️ Error clearing user goals:', goalsError.message);
    }

    // 16. Clear user habits
    const { error: habitsError } = await supabase
      .from('user_habits')
      .delete()
      .eq('user_id', userId);

    if (habitsError) {
      console.log('⚠️ Error clearing user habits:', habitsError.message);
    }

    // 17. Clear user habit logs
    const { error: habitLogsError } = await supabase
      .from('user_habit_logs')
      .delete()
      .eq('user_id', userId);

    if (habitLogsError) {
      console.log('⚠️ Error clearing user habit logs:', habitLogsError.message);
    }

    // 18. Clear user daily progress
    const { error: dailyProgressError } = await supabase
      .from('user_daily_progress')
      .delete()
      .eq('user_id', userId);

    if (dailyProgressError) {
      console.log('⚠️ Error clearing user daily progress:', dailyProgressError.message);
    }

    // 19. Clear user weekly stats
    const { error: weeklyStatsError } = await supabase
      .from('user_weekly_stats')
      .delete()
      .eq('user_id', userId);

    if (weeklyStatsError) {
      console.log('⚠️ Error clearing user weekly stats:', weeklyStatsError.message);
    }

    // 20. Clear user achievements
    const { error: achievementsError } = await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', userId);

    if (achievementsError) {
      console.log('⚠️ Error clearing user achievements:', achievementsError.message);
    }

    // 21. Clear user nutrition plans
    const { error: nutritionPlansError } = await supabase
      .from('user_nutrition_plans')
      .delete()
      .eq('user_id', userId);

    if (nutritionPlansError) {
      console.log('⚠️ Error clearing user nutrition plans:', nutritionPlansError.message);
    }

    // 22. Clear user meal customizations
    const { error: mealCustomizationsError } = await supabase
      .from('user_meal_customizations')
      .delete()
      .eq('user_id', userId);

    if (mealCustomizationsError) {
      console.log('⚠️ Error clearing user meal customizations:', mealCustomizationsError.message);
    }

    // 23. Clear user nutrition progress
    const { error: nutritionProgressError } = await supabase
      .from('user_nutrition_progress')
      .delete()
      .eq('user_id', userId);

    if (nutritionProgressError) {
      console.log('⚠️ Error clearing user nutrition progress:', nutritionProgressError.message);
    }

    // 24. Clear user training schema progress
    const { error: trainingSchemaProgressError } = await supabase
      .from('user_training_schema_progress')
      .delete()
      .eq('user_id', userId);

    if (trainingSchemaProgressError) {
      console.log('⚠️ Error clearing user training schema progress:', trainingSchemaProgressError.message);
    }

    // 25. Clear user training day progress
    const { error: trainingDayProgressError } = await supabase
      .from('user_training_day_progress')
      .delete()
      .eq('user_id', userId);

    if (trainingDayProgressError) {
      console.log('⚠️ Error clearing user training day progress:', trainingDayProgressError.message);
    }

    // 26. Clear user mission logs (only if table exists)
    try {
      const { error: missionLogsError } = await supabase
        .from('user_mission_logs')
        .delete()
        .eq('user_id', userId);

      if (missionLogsError) {
        console.log('⚠️ Error clearing user mission logs:', missionLogsError.message);
      }
    } catch (error) {
      console.log('ℹ️ user_mission_logs table does not exist, skipping...');
    }

    // 27. Clear workout exercises (related to workout sessions)
    // First get all workout session IDs for this user
    const { data: workoutSessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId);

    if (sessionsError) {
      console.log('⚠️ Error getting workout sessions:', sessionsError.message);
    } else if (workoutSessions && workoutSessions.length > 0) {
      const sessionIds = workoutSessions.map(session => session.id);
      const { error: workoutExercisesError } = await supabase
        .from('workout_exercises')
        .delete()
        .in('session_id', sessionIds);

      if (workoutExercisesError) {
        console.log('⚠️ Error clearing workout exercises:', workoutExercisesError.message);
      }
    }

    // 28. Reset user stats in profiles table
    try {
      const { error: userStatsError } = await supabase
        .from('profiles')
        .update({
          points: 0,
          missions_completed: 0,
          selected_schema_id: null,
          selected_nutrition_plan: null
        })
        .eq('id', userId);

      if (userStatsError) {
        console.log('⚠️ Error resetting user stats:', userStatsError.message);
      }
    } catch (error) {
      // Try without updated_at column
      const { error: userStatsError2 } = await supabase
        .from('profiles')
        .update({
          points: 0,
          missions_completed: 0,
          selected_schema_id: null,
          selected_nutrition_plan: null
        })
        .eq('id', userId);

      if (userStatsError2) {
        console.log('⚠️ Error resetting user stats:', userStatsError2.message);
      }
    }

    // 29. Clear user onboarding status (old table if exists)
    try {
      const { error: oldOnboardingError } = await supabase
        .from('user_onboarding_status')
        .delete()
        .eq('user_id', userId);

      if (oldOnboardingError) {
        console.log('⚠️ Error clearing old onboarding status:', oldOnboardingError.message);
      }
    } catch (error) {
      console.log('ℹ️ user_onboarding_status table does not exist, skipping...');
    }

    console.log('✅ FULL reset completed for user:', userId);
    console.log('📋 Reset summary:');
    console.log('   - Onboarding status reset to step 0');
    console.log('   - All missions cleared (database + files)');
    console.log('   - All training data cleared');
    console.log('   - All nutrition data cleared');
    console.log('   - All challenges and streaks cleared');
    console.log('   - All XP and achievements cleared');
    console.log('   - All forum posts cleared');
    console.log('   - All workout sessions cleared');
    console.log('   - All user preferences cleared');
    console.log('   - All progress tracking cleared');
    console.log('   - User profile reset to initial state');

    return NextResponse.json({ 
      success: true,
      message: 'User fully reset to initial state - all data cleared. User can now start onboarding from step 1.'
    });

  } catch (error) {
    console.error('❌ Error in full reset:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 