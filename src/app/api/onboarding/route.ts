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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching onboarding status for user:', userId);

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // First, get all records for this user
    const { data: allRecords, error: fetchError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) {
      console.log('❌ Error fetching onboarding status:', fetchError.message);
      return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
    }

    // If multiple records exist, keep only the most recent one
    let data;
    if (allRecords && allRecords.length > 1) {
      console.log(`⚠️ Found ${allRecords.length} onboarding records for user ${userId}, keeping most recent`);
      
      // Sort by created_at descending and keep the first (most recent)
      const sortedRecords = allRecords.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      data = sortedRecords[0];
      
      // Delete the older records
      const deleteIds = sortedRecords.slice(1).map(record => record.id);
      for (const id of deleteIds) {
        await supabase
          .from('onboarding_status')
          .delete()
          .eq('id', id);
      }
      
      console.log(`✅ Kept record ${data.id}, deleted ${deleteIds.length} duplicates`);
    } else if (allRecords && allRecords.length === 1) {
      data = allRecords[0];
    } else {
      // No records found, create one
      console.log(`📝 No onboarding record found for user ${userId}, creating one`);
      const { data: newRecord, error: createError } = await supabase
        .from('onboarding_status')
        .insert({
          user_id: userId,
          welcome_video_watched: false,
          step_1_completed: false,
          step_2_completed: false,
          step_3_completed: false,
          step_4_completed: false,
          step_5_completed: false,
          onboarding_completed: false,
          current_step: 1
        })
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Error creating onboarding record:', createError.message);
        return NextResponse.json({ error: 'Failed to create onboarding record' }, { status: 500 });
      }
      
      data = newRecord;
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

    // Initialize Supabase client
    const supabase = getSupabaseClient();

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
      const { data: currentStatusRecords } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', userId);

      const currentStatus = currentStatusRecords && currentStatusRecords.length > 0 
        ? currentStatusRecords[0] 
        : null;

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

    // Get the current record to update
    const { data: currentRecords } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', userId);

    let data;
    if (currentRecords && currentRecords.length > 0) {
      // Update the first (most recent) record
      const { data: updatedRecord, error } = await supabase
        .from('onboarding_status')
        .update(updateData)
        .eq('id', currentRecords[0].id)
        .select()
        .single();

      if (error) {
        console.log('❌ Error updating onboarding status:', error.message);
        return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
      }

      data = updatedRecord;
    } else {
      // Create new record if none exists
      const { data: newRecord, error } = await supabase
        .from('onboarding_status')
        .insert({
          user_id: userId,
          ...updateData
        })
        .select()
        .single();

      if (error) {
        console.log('❌ Error creating onboarding status:', error.message);
        return NextResponse.json({ error: 'Failed to create onboarding status' }, { status: 500 });
      }

      data = newRecord;
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