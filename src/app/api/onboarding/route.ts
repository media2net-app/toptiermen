import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔍 Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
  console.log('🔍 Supabase Key:', supabaseKey ? 'Present' : 'Missing');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
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
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Check if userId is an email (contains @) or UUID
    let actualUserId = userId;
    if (userId.includes('@')) {
      console.log('🔍 User ID is email, looking up UUID...');
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        if (userError || !userData.users || userData.users.length === 0) {
          console.log('❌ User not found for email:', userId);
          // Return mock data for unknown users
          return NextResponse.json({
            user_id: actualUserId,
            welcome_video_watched: false,
            step_1_completed: false,
            step_2_completed: false,
            step_3_completed: false,
            step_4_completed: false,
            step_5_completed: false,
            onboarding_completed: false,
            current_step: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        actualUserId = userData.users[0].id;
        console.log('✅ Found UUID for email:', actualUserId);
      } catch (error) {
        console.log('❌ Error looking up user by email:', error);
        // Return mock data on error
        return NextResponse.json({
          user_id: actualUserId,
          welcome_video_watched: false,
          step_1_completed: false,
          step_2_completed: false,
          step_3_completed: false,
          step_4_completed: false,
          step_5_completed: false,
          onboarding_completed: false,
          current_step: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // First, get all records for this user
    console.log('🔍 Querying user_onboarding_status table for user:', actualUserId);
    const { data: allRecords, error: fetchError } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', actualUserId);

    console.log('🔍 Query result:', { data: allRecords, error: fetchError });

    if (fetchError) {
      console.log('❌ Error fetching onboarding status:', fetchError.message);
      // Return mock data instead of error to prevent dashboard crashes
      return NextResponse.json({
        user_id: actualUserId,
        welcome_video_watched: false,
        step_1_completed: false,
        step_2_completed: false,
        step_3_completed: false,
        step_4_completed: false,
        step_5_completed: false,
        onboarding_completed: false,
        current_step: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
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
          .from('user_onboarding_status')
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
        .from('user_onboarding_status')
        .insert({
          user_id: actualUserId,
          welcome_video_shown: false,
          goal_set: false,
          missions_selected: false,
          training_schema_selected: false,
          nutrition_plan_selected: false,
          challenge_started: false,
          onboarding_completed: false
        })
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Error creating onboarding record:', createError.message);
        return NextResponse.json({ error: 'Failed to create onboarding record' }, { status: 500 });
      }
      
      data = newRecord;
    }



    // Map the new database structure to the expected frontend format
    const mappedData = {
      user_id: data.user_id,
      welcome_video_watched: data.welcome_video_shown,
      step_1_completed: data.goal_set,
      step_2_completed: data.missions_selected,
      step_3_completed: data.training_schema_selected,
      step_4_completed: data.nutrition_plan_selected,
      step_5_completed: data.challenge_started,
      onboarding_completed: data.onboarding_completed,
      current_step: data.onboarding_completed ? 5 : (data.challenge_started ? 5 : (data.nutrition_plan_selected ? 4 : (data.training_schema_selected ? 3 : (data.missions_selected ? 2 : (data.goal_set ? 1 : 0))))),
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    console.log('✅ Onboarding status fetched:', {
      user_id: mappedData.user_id,
      onboarding_completed: mappedData.onboarding_completed,
      current_step: mappedData.current_step
    });

    return NextResponse.json(mappedData);

  } catch (error) {
    console.error('❌ Error in onboarding GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 Received request body:', body);
    
    const { userId, step, action, mainGoal, selectedMissions, selectedTrainingSchema, selectedNutritionPlan, forumIntroduction, test_video_watched } = body;
    console.log('🔍 Extracted values:', { userId, step, action, mainGoal, selectedMissions, selectedTrainingSchema, selectedNutritionPlan, forumIntroduction });

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

    // Check if userId is an email (contains @) or UUID
    let actualUserId = userId;
    if (userId.includes('@')) {
      console.log('🔍 User ID is email, looking up UUID...');
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        if (userError || !userData.users || userData.users.length === 0) {
          console.log('❌ User not found for email:', userId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const user = userData.users.find(u => u.email === userId);
        if (!user) {
          console.log('❌ User not found for email:', userId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        actualUserId = user.id;
        console.log('✅ Found UUID for email:', actualUserId);
      } catch (error) {
        console.log('❌ Error looking up user by email:', error);
        return NextResponse.json({ error: 'Failed to find user' }, { status: 500 });
      }
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (action === 'complete_step') {
      // Get user's subscription tier to determine access
      const { data: profile } = await supabase
        .from('profiles')
        .select('package_type')
        .eq('id', actualUserId)
        .single();
      
      const packageType = profile?.package_type || 'Basic Tier';
      const isBasic = packageType === 'Basic Tier';
      const hasTrainingAccess = packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';
      const hasNutritionAccess = packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';
      
      console.log('🎯 User access:', { packageType, isBasic, hasTrainingAccess, hasNutritionAccess });
      
      // Mark specific step as completed using the new database structure
      if (step === 0) {
        updateData.welcome_video_shown = true;
      } else if (step === 1) {
        updateData.goal_set = true;
      } else if (step === 2) {
        updateData.missions_selected = true;
      } else if (step === 3) {
        updateData.training_schema_selected = true;
      } else if (step === 4) {
        updateData.nutrition_plan_selected = true;
      } else if (step === 5) {
        updateData.challenge_started = true;
      }
      
      // Calculate next step based on completion status and subscription tier
      let nextStep = step + 1;
      
          // For Basic tier users, skip training (step 3) and nutrition (step 4) steps
          if (isBasic) {
            if (step === 2) {
              // After missions (step 2), skip to forum (step 5)
              nextStep = 5;
              // Mark training and nutrition steps as completed for Basic tier
              updateData.training_schema_selected = true;
              updateData.nutrition_plan_selected = true;
              console.log('🚀 Basic tier user - skipping training and nutrition steps, going to forum');
            } else if (step === 3 || step === 4) {
              // If somehow a Basic tier user reaches these steps, skip to forum
              nextStep = 5;
              updateData.training_schema_selected = true;
              updateData.nutrition_plan_selected = true;
              console.log('🚀 Basic tier user - skipping training/nutrition step, going to forum');
            }
          }
      
      // Check if all steps are completed
      const stepCompletionCheck = await supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', actualUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (stepCompletionCheck.data) {
        // For step 5 (forum post), complete onboarding immediately
        if (step === 5) {
          updateData.onboarding_completed = true;
          updateData.completed_at = new Date().toISOString();
          nextStep = 5; // Completed
        } else {
          // For other steps, check if all required steps are completed based on subscription tier
          let allStepsCompleted;
          
          if (isBasic) {
            // Basic tier users only need steps 1, 2, and 5 (missions and forum)
            allStepsCompleted = 
              stepCompletionCheck.data.goal_set &&
              stepCompletionCheck.data.missions_selected &&
              stepCompletionCheck.data.challenge_started;
          } else {
            // Premium/Lifetime users need all steps
            allStepsCompleted = 
              stepCompletionCheck.data.goal_set &&
              stepCompletionCheck.data.missions_selected &&
              stepCompletionCheck.data.training_schema_selected &&
              stepCompletionCheck.data.nutrition_plan_selected &&
              stepCompletionCheck.data.challenge_started;
          }

          if (allStepsCompleted && step === 5) {
            updateData.onboarding_completed = true;
            updateData.completed_at = new Date().toISOString();
            nextStep = 5; // Completed
          }
        }
      }
      
      // Don't set current_step in updateData - it will be calculated in the response mapping
      
      // Handle step-specific data
      if (step === 1 && mainGoal) {
        // Update user profile with main goal
        await supabase
          .from('profiles')
          .update({ main_goal: mainGoal })
          .eq('id', actualUserId);
        console.log('✅ Main goal saved to profile:', mainGoal);
      }
      
      if (step === 2 && selectedMissions && selectedMissions.length > 0) {
        // Create user challenges (missions)
        const challengeData = selectedMissions.map((challengeId: string) => ({
          user_id: actualUserId,
          mission_id: challengeId,
          is_active: true,
          created_at: new Date().toISOString()
        }));
        
        const { error: challengeError } = await supabase
          .from('user_missions')
          .insert(challengeData);
          
        if (challengeError) {
          console.log('⚠️ Error creating challenges:', challengeError.message);
        } else {
          console.log('✅ User challenges created:', selectedMissions);
        }
      }
      
      if (step === 3 && selectedTrainingSchema) {
        // Update user training preferences
        await supabase
          .from('user_training_progress')
          .upsert({
            user_id: actualUserId,
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
              user_id: actualUserId,
              selected_nutrition_plan: selectedNutritionPlan,
              updated_at: new Date().toISOString()
            });
          console.log('✅ Nutrition plan selected:', selectedNutritionPlan);
        }
        
      }
      
      if (step === 5 && forumIntroduction) {
        // Create forum introduction post
        const { error: forumError } = await supabase
          .from('forum_posts')
          .insert({
            author_id: actualUserId,
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
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', actualUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      const currentStatus = currentStatusRecords && currentStatusRecords.length > 0 
        ? currentStatusRecords[0] 
        : null;

      if (currentStatus) {
        // Check completion based on subscription tier
        let allStepsCompleted;
        
        if (isBasic) {
          // Basic tier users only need steps 1, 2, and 5 (missions and forum)
          allStepsCompleted = 
            currentStatus.goal_set &&
            currentStatus.missions_selected &&
            currentStatus.challenge_started;
        } else {
          // Premium/Lifetime users need all steps
          allStepsCompleted = 
            currentStatus.goal_set &&
            currentStatus.missions_selected &&
            currentStatus.training_schema_selected &&
            currentStatus.nutrition_plan_selected &&
            currentStatus.challenge_started;
        }

        if (allStepsCompleted) {
          updateData.onboarding_completed = true;
        }
      }
    } else if (action === 'watch_welcome_video') {
      updateData.welcome_video_shown = true;
    } else if (action === 'skip_onboarding') {
      updateData.onboarding_completed = true;
    } else if (action === 'update_test_video_watched') {
      updateData.welcome_video_shown = test_video_watched;
    }

    // Get the current record to update
    const { data: currentRecords } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', actualUserId)
      .order('created_at', { ascending: false });

    let data;
    if (currentRecords && currentRecords.length > 0) {
      // Update the first (most recent) record
      const { data: updatedRecord, error } = await supabase
        .from('user_onboarding_status')
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
        .from('user_onboarding_status')
        .insert({
          user_id: actualUserId,
          welcome_video_shown: false,
          goal_set: false,
          missions_selected: false,
          training_schema_selected: false,
          nutrition_plan_selected: false,
          challenge_started: false,
          onboarding_completed: false,
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



    // Map the new database structure to the frontend format
    const mappedData = {
      user_id: data.user_id,
      welcome_video_watched: data.welcome_video_shown,
      step_1_completed: data.goal_set,
      step_2_completed: data.missions_selected,
      step_3_completed: data.training_schema_selected,
      step_4_completed: data.nutrition_plan_selected,
      step_5_completed: data.challenge_started,
      onboarding_completed: data.onboarding_completed,
      current_step: data.onboarding_completed ? 5 : (data.challenge_started ? 5 : (data.nutrition_plan_selected ? 4 : (data.training_schema_selected ? 3 : (data.missions_selected ? 2 : (data.goal_set ? 1 : 0))))),
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    console.log('✅ Onboarding status updated:', {
      user_id: mappedData.user_id,
      onboarding_completed: mappedData.onboarding_completed,
      current_step: mappedData.current_step
    });

    return NextResponse.json(mappedData);

  } catch (error) {
    console.error('❌ Error in onboarding POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 