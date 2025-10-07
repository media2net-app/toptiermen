import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  const { email, userId } = await request.json();
  
  if (!email && !userId) {
    return new Response('Email or userId is required', { status: 400 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const sendLog = (message: string) => {
        const data = `data: ${JSON.stringify({ message, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        sendLog('🔄 Starting onboarding reset...');
        
        const supabase = getSupabaseClient();
        let finalUserId = userId;
        let finalEmail = email;

        // If we have userId but no email, get email from user
        if (userId && !email) {
          sendLog('🔍 Looking up user email...');
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
          if (userError || !userData.users) {
            sendLog('❌ Failed to fetch users');
            throw new Error('Failed to fetch users');
          }

          const user = userData.users.find(u => u.id === userId);
          if (!user) {
            sendLog('❌ User not found');
            throw new Error('User not found');
          }

          finalEmail = user.email;
          sendLog(`✅ Found user email: ${finalEmail}`);
        }
        // If we have email but no userId, get userId from email
        else if (email && !userId) {
          sendLog('🔍 Looking up user ID...');
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
          if (userError || !userData.users) {
            sendLog('❌ Failed to fetch users');
            throw new Error('Failed to fetch users');
          }

          const user = userData.users.find(u => u.email === email);
          if (!user) {
            sendLog('❌ User not found');
            throw new Error('User not found');
          }

          finalUserId = user.id;
          sendLog(`✅ Found user ID: ${finalUserId}`);
        }

        sendLog(`🎯 Resetting onboarding for: ${finalEmail}`);

        // Delete onboarding status records
        sendLog('🗑️ Deleting onboarding status...');
        const { error: onboardingError } = await supabase
          .from('user_onboarding_status')
          .delete()
          .eq('user_id', finalUserId);

        if (onboardingError) {
          sendLog(`⚠️ Error deleting onboarding status: ${onboardingError.message}`);
        } else {
          sendLog('✅ Onboarding status deleted');
        }

        // Delete user missions
        sendLog('🗑️ Deleting user missions...');
        const { error: missionsError } = await supabase
          .from('user_missions')
          .delete()
          .eq('user_id', finalUserId);

        if (missionsError) {
          sendLog(`⚠️ Error deleting user missions: ${missionsError.message}`);
        } else {
          sendLog('✅ User missions deleted');
        }

        // Delete user training progress
        sendLog('🗑️ Deleting training progress...');
        const { error: trainingError } = await supabase
          .from('user_training_progress')
          .delete()
          .eq('user_id', finalUserId);

        if (trainingError) {
          sendLog(`⚠️ Error deleting training progress: ${trainingError.message}`);
        } else {
          sendLog('✅ Training progress deleted');
        }

        // Delete user preferences
        sendLog('🗑️ Deleting user preferences...');
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', finalUserId);

        if (preferencesError) {
          sendLog(`⚠️ Error deleting user preferences: ${preferencesError.message}`);
        } else {
          sendLog('✅ User preferences deleted');
        }

        // Reset main goal in profile
        sendLog('🔄 Resetting profile main goal...');
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ main_goal: null })
          .eq('id', finalUserId);

        if (profileError) {
          sendLog(`⚠️ Error resetting profile: ${profileError.message}`);
        } else {
          sendLog('✅ Profile reset');
        }

        // Academy progress tables
        sendLog('🗑️ Deleting academy lesson progress...');
        const { error: lessonProgressDel } = await supabase
          .from('user_lesson_progress')
          .delete()
          .eq('user_id', finalUserId);
        if (lessonProgressDel) sendLog(`⚠️ Error deleting user_lesson_progress: ${lessonProgressDel.message}`); else sendLog('✅ user_lesson_progress deleted');

        sendLog('🗑️ Deleting academy completions (lessons/modules)...');
        const { error: academyLessonCompDel } = await supabase
          .from('academy_lesson_completions')
          .delete()
          .eq('user_id', finalUserId);
        if (academyLessonCompDel) sendLog(`⚠️ Error deleting academy_lesson_completions: ${academyLessonCompDel.message}`); else sendLog('✅ academy_lesson_completions deleted');

        const { error: academyModuleCompDel } = await supabase
          .from('academy_module_completions')
          .delete()
          .eq('user_id', finalUserId);
        if (academyModuleCompDel) sendLog(`⚠️ Error deleting academy_module_completions: ${academyModuleCompDel.message}`); else sendLog('✅ academy_module_completions deleted');

        const { error: moduleUnlocksDel } = await supabase
          .from('user_module_unlocks')
          .delete()
          .eq('user_id', finalUserId);
        if (moduleUnlocksDel) sendLog(`⚠️ Error deleting user_module_unlocks: ${moduleUnlocksDel.message}`); else sendLog('✅ user_module_unlocks deleted');

        // Badges / XP
        sendLog('🗑️ Deleting user badges & XP...');
        const { error: userBadgesDel } = await supabase
          .from('user_badges')
          .delete()
          .eq('user_id', finalUserId);
        if (userBadgesDel) sendLog(`⚠️ Error deleting user_badges: ${userBadgesDel.message}`); else sendLog('✅ user_badges deleted');

        const { error: userXpDel } = await supabase
          .from('user_xp')
          .delete()
          .eq('user_id', finalUserId);
        if (userXpDel) sendLog(`⚠️ Error deleting user_xp: ${userXpDel.message}`); else sendLog('✅ user_xp deleted');

        // Training schemas and sessions
        sendLog('🗑️ Deleting training schemas & related...');
        const { error: userTrainingSchemasDel } = await supabase
          .from('user_training_schemas')
          .delete()
          .eq('user_id', finalUserId);
        if (userTrainingSchemasDel) sendLog(`⚠️ Error deleting user_training_schemas: ${userTrainingSchemasDel.message}`); else sendLog('✅ user_training_schemas deleted');

        // Optional: workout sessions table if present
        try {
          const { error: workoutSessionsDel } = await (supabase as any)
            .from('user_workout_sessions')
            .delete()
            .eq('user_id', finalUserId);
          if (workoutSessionsDel) sendLog(`⚠️ Error deleting user_workout_sessions: ${workoutSessionsDel.message}`); else sendLog('✅ user_workout_sessions deleted');
        } catch {}

        // Nutrition plans
        sendLog('🗑️ Deleting nutrition selections...');
        const { error: userNutritionPlansDel } = await supabase
          .from('user_nutrition_plans')
          .delete()
          .eq('user_id', finalUserId);
        if (userNutritionPlansDel) sendLog(`⚠️ Error deleting user_nutrition_plans: ${userNutritionPlansDel.message}`); else sendLog('✅ user_nutrition_plans deleted');

        // Mind & Focus profiles/progress (table names may vary)
        sendLog('🗑️ Deleting mind-focus profiles/progress...');
        try {
          const { error: mindProfilesDel } = await (supabase as any)
            .from('mind_profiles')
            .delete()
            .eq('user_id', finalUserId);
          if (mindProfilesDel) sendLog(`⚠️ Error deleting mind_profiles: ${mindProfilesDel.message}`); else sendLog('✅ mind_profiles deleted');
        } catch {}
        try {
          const { error: mindProgressDel } = await (supabase as any)
            .from('mind_user_progress')
            .delete()
            .eq('user_id', finalUserId);
          if (mindProgressDel) sendLog(`⚠️ Error deleting mind_user_progress: ${mindProgressDel.message}`); else sendLog('✅ mind_user_progress deleted');
        } catch {}

        // Forum content
        sendLog('🗑️ Deleting forum content...');
        const { error: forumLikesDel } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', finalUserId);
        if (forumLikesDel) sendLog(`⚠️ Error deleting forum_likes: ${forumLikesDel.message}`); else sendLog('✅ forum_likes deleted');

        const { error: forumViewsDel } = await supabase
          .from('forum_views')
          .delete()
          .eq('user_id', finalUserId);
        if (forumViewsDel) sendLog(`⚠️ Error deleting forum_views: ${forumViewsDel.message}`); else sendLog('✅ forum_views deleted');

        const { error: forumPostsDel } = await supabase
          .from('forum_posts')
          .delete()
          .eq('author_id', finalUserId);
        if (forumPostsDel) sendLog(`⚠️ Error deleting forum_posts: ${forumPostsDel.message}`); else sendLog('✅ forum_posts deleted');

        const { error: forumTopicsDel } = await supabase
          .from('forum_topics')
          .delete()
          .eq('author_id', finalUserId);
        if (forumTopicsDel) sendLog(`⚠️ Error deleting forum_topics: ${forumTopicsDel.message}`); else sendLog('✅ forum_topics deleted');

        // Activity log, push subscriptions and misc
        sendLog('🗑️ Deleting activity logs & push subscriptions...');
        const { error: activityLogDel } = await supabase
          .from('activity_log')
          .delete()
          .eq('user_id', finalUserId);
        if (activityLogDel) sendLog(`⚠️ Error deleting activity_log: ${activityLogDel.message}`); else sendLog('✅ activity_log deleted');

        const { error: pushSubsDel } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', finalUserId);
        if (pushSubsDel) sendLog(`⚠️ Error deleting push_subscriptions: ${pushSubsDel.message}`); else sendLog('✅ push_subscriptions deleted');

        // Optional schema-prog tables
        try {
          const { error: schemaProgDel } = await (supabase as any)
            .from('user_schema_progress')
            .delete()
            .eq('user_id', finalUserId);
          if (schemaProgDel) sendLog(`⚠️ Error deleting user_schema_progress: ${schemaProgDel.message}`); else sendLog('✅ user_schema_progress deleted');
        } catch {}

        sendLog('🎉 Onboarding reset completed successfully!');
        sendLog(`✅ User ${finalEmail} can now start onboarding from step 0`);
        
        // Send completion signal
        const completionData = `data: ${JSON.stringify({ 
          completed: true, 
          message: 'Reset completed successfully',
          userId: finalUserId,
          email: finalEmail,
          timestamp: new Date().toISOString()
        })}\n\n`;
        controller.enqueue(encoder.encode(completionData));

      } catch (error) {
        sendLog(`❌ Error during reset: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        const errorData = `data: ${JSON.stringify({ 
          error: true, 
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
