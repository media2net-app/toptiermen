import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching onboarding status for user:', userId);

    const { data, error } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.log('❌ Error fetching onboarding status:', error.message);
      return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
    }

    console.log('✅ Onboarding status fetched:', {
      user_id: data.user_id,
      onboarding_completed: data.onboarding_completed,
      current_step: data.current_step
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Error in onboarding GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 Received request body:', body);
    
    const { userId, step, action, mainGoal, selectedMissions, selectedTrainingSchema, selectedNutritionPlan, selectedChallenge, forumIntroduction } = body;
    console.log('🔍 Extracted values:', { userId, step, action, mainGoal, selectedMissions, selectedTrainingSchema, selectedNutritionPlan, selectedChallenge, forumIntroduction });

    if (!userId || step === undefined || !action) {
      console.error('❌ Missing required fields:', { 
        hasUserId: !!userId, 
        hasStep: step !== undefined, 
        hasAction: !!action 
      });
      return NextResponse.json({ 
        error: 'User ID, step, and action are required',
        received: { userId, step, action }
      }, { status: 400 });
    }

    console.log('📝 Updating onboarding status:', { userId, step, action });

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (action === 'complete_step') {
      // Mark specific step as completed
      updateData[`step_${step}_completed`] = true;
      updateData.current_step = Math.max(step + 1, 6);
      
      // Handle step-specific data
      if (step === 1 && mainGoal) {
        // Update user profile with main goal
        await supabase
          .from('profiles')
          .update({ main_goal: mainGoal })
          .eq('id', userId);
        console.log('✅ Main goal saved to profile:', mainGoal);
      }
      
      if (step === 2 && selectedMissions && selectedMissions.length > 0) {
        // Create user missions
        const missionData = selectedMissions.map((missionId: string) => ({
          user_id: userId,
          mission_id: missionId,
          is_active: true,
          created_at: new Date().toISOString()
        }));
        
        const { error: missionError } = await supabase
          .from('user_missions')
          .insert(missionData);
          
        if (missionError) {
          console.log('⚠️ Error creating missions:', missionError.message);
        } else {
          console.log('✅ User missions created:', selectedMissions);
        }
      }
      
      if (step === 3 && selectedTrainingSchema) {
        // Update user training preferences
        await supabase
          .from('user_training_progress')
          .upsert({
            user_id: userId,
            selected_schema_id: selectedTrainingSchema,
            updated_at: new Date().toISOString()
          });
        console.log('✅ Training schema selected:', selectedTrainingSchema);
      }
      
      if (step === 4) {
        // Update nutrition and challenge preferences
        if (selectedNutritionPlan) {
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: userId,
              selected_nutrition_plan: selectedNutritionPlan,
              updated_at: new Date().toISOString()
            });
          console.log('✅ Nutrition plan selected:', selectedNutritionPlan);
        }
        
        if (selectedChallenge) {
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: userId,
              selected_challenge: selectedChallenge,
              updated_at: new Date().toISOString()
            });
          console.log('✅ Challenge selected:', selectedChallenge);
        }
      }
      
      if (step === 5 && forumIntroduction) {
        // Create forum introduction post
        const { error: forumError } = await supabase
          .from('forum_posts')
          .insert({
            author_id: userId,
            title: 'Nieuwe member introductie',
            content: forumIntroduction,
            category: 'introductions',
            created_at: new Date().toISOString()
          });
          
        if (forumError) {
          console.log('⚠️ Error creating forum post:', forumError.message);
        } else {
          console.log('✅ Forum introduction posted');
        }
      }
      
      // Check if all steps are completed
      const { data: currentStatus } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (currentStatus) {
        const allStepsCompleted = 
          currentStatus.step_1_completed &&
          currentStatus.step_2_completed &&
          currentStatus.step_3_completed &&
          currentStatus.step_4_completed &&
          currentStatus.step_5_completed;

        if (allStepsCompleted) {
          updateData.onboarding_completed = true;
          updateData.completed_at = new Date().toISOString();
        }
      }
    } else if (action === 'watch_welcome_video') {
      updateData.welcome_video_watched = true;
      updateData.current_step = 1;
    } else if (action === 'skip_onboarding') {
      updateData.onboarding_completed = true;
      updateData.completed_at = new Date().toISOString();
      updateData.current_step = 6;
    }

    const { data, error } = await supabase
      .from('onboarding_status')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.log('❌ Error updating onboarding status:', error.message);
      return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
    }

    console.log('✅ Onboarding status updated:', {
      user_id: data.user_id,
      onboarding_completed: data.onboarding_completed,
      current_step: data.current_step
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Error in onboarding POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 