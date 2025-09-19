import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Onboarding V2 Steps Definition
const ONBOARDING_STEPS = {
  WELCOME_VIDEO: { id: 0, title: 'Welkomstvideo bekijken', requiresAccess: null },
  SET_GOAL: { id: 1, title: 'Hoofddoel bepalen', requiresAccess: null },
  SELECT_CHALLENGES: { id: 2, title: 'Uitdagingen selecteren', requiresAccess: null },
  SELECT_TRAINING: { id: 3, title: 'Trainingsschema kiezen', requiresAccess: 'training' },
  SELECT_NUTRITION: { id: 4, title: 'Voedingsplan kiezen', requiresAccess: 'nutrition' },
  FORUM_INTRO: { id: 5, title: 'Forum introductie', requiresAccess: null }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    console.log('🔍 Onboarding V2 - Getting status for:', email);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, package_type, role')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get onboarding status
    const { data: onboardingRecords, error: onboardingError } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    const onboardingStatus = onboardingRecords && onboardingRecords.length > 0 ? onboardingRecords[0] : null;

    // Determine access control
    const packageType = profile.package_type || 'Basic Tier';
    const isAdmin = profile.role === 'admin';
    const hasTrainingAccess = isAdmin || packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';
    const hasNutritionAccess = isAdmin || packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';

    // Calculate current step
    let currentStep: number | null = null;
    let isCompleted = false;

    if (onboardingStatus) {
      if (onboardingStatus.onboarding_completed) {
        isCompleted = true;
        currentStep = null;
      } else {
        // Determine current step based on completed flags
        if (!onboardingStatus.welcome_video_shown) {
          currentStep = ONBOARDING_STEPS.WELCOME_VIDEO.id;
        } else if (!onboardingStatus.goal_set) {
          currentStep = ONBOARDING_STEPS.SET_GOAL.id;
        } else if (!onboardingStatus.missions_selected) {
          currentStep = ONBOARDING_STEPS.SELECT_CHALLENGES.id;
        } else if (hasTrainingAccess && !onboardingStatus.training_schema_selected) {
          currentStep = ONBOARDING_STEPS.SELECT_TRAINING.id;
        } else if (hasNutritionAccess && !onboardingStatus.nutrition_plan_selected) {
          currentStep = ONBOARDING_STEPS.SELECT_NUTRITION.id;
        } else if (!onboardingStatus.challenge_started) {
          currentStep = ONBOARDING_STEPS.FORUM_INTRO.id;
        } else {
          // All steps completed, mark as completed
          currentStep = null;
          isCompleted = true;
        }
        
        // For Basic tier users, complete onboarding after forum intro (step 5)
        if (!hasTrainingAccess && !hasNutritionAccess && onboardingStatus.missions_selected && onboardingStatus.challenge_started) {
          currentStep = null;
          isCompleted = true;
          
          // Update the database to mark onboarding as completed
          const { error: updateError } = await supabase
            .from('user_onboarding_status')
            .update({ 
              onboarding_completed: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', profile.id);
          
          if (updateError) {
            console.error('❌ Error updating onboarding completion:', updateError);
          } else {
            console.log('✅ Onboarding marked as completed for Basic tier user');
          }
        }
      }
    } else {
      // No onboarding data, start at step 0
      currentStep = ONBOARDING_STEPS.WELCOME_VIDEO.id;
    }

    // Get available steps based on access
    const availableSteps = Object.values(ONBOARDING_STEPS).filter(step => {
      if (step.requiresAccess === 'training') return hasTrainingAccess;
      if (step.requiresAccess === 'nutrition') return hasNutritionAccess;
      return true;
    });

    // Create step mapping for available steps
    const stepMapping = {};
    availableSteps.forEach((step, index) => {
      stepMapping[step.id] = index;
    });

    const response = {
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        package_type: packageType,
        role: profile.role
      },
      onboarding: {
        isCompleted,
        currentStep,
        status: onboardingStatus,
        availableSteps,
        stepMapping
      },
      access: {
        hasTrainingAccess,
        hasNutritionAccess,
        isAdmin,
        isBasic: packageType === 'Basic Tier'
      }
    };

    console.log('✅ Onboarding V2 status:', {
      email,
      currentStep,
      isCompleted,
      hasTrainingAccess,
      hasNutritionAccess
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Onboarding V2 GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, step, action, data } = body;

    if (!email || step === undefined || !action) {
      return NextResponse.json({ 
        error: 'Email, step, and action are required' 
      }, { status: 400 });
    }

    console.log('📝 Onboarding V2 - Updating step:', { email, step, action });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, package_type, role')
      .eq('email', email)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Determine user access levels
    const packageType = profile.package_type || 'Basic Tier';
    const isAdmin = profile.role === 'admin';
    const hasTrainingAccess = isAdmin || packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';
    const hasNutritionAccess = isAdmin || packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';

    // Get current onboarding status
    const { data: onboardingRecords, error: onboardingError } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    let onboardingStatus = onboardingRecords && onboardingRecords.length > 0 ? onboardingRecords[0] : null;

    // Prepare update data
    let updateData: any = {};

    // Handle different actions
    switch (action) {
      case 'complete_step':
        switch (step) {
          case ONBOARDING_STEPS.WELCOME_VIDEO.id:
            updateData.welcome_video_shown = true;
            break;
          case ONBOARDING_STEPS.SET_GOAL.id:
            updateData.goal_set = true;
            break;
          case ONBOARDING_STEPS.SELECT_CHALLENGES.id:
            updateData.missions_selected = true;
            
            // Create user missions if challenges are provided
            if (data && data.challenges && Array.isArray(data.challenges)) {
              const challengeData = data.challenges.map((challengeId: string) => ({
                user_id: profile.id,
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
                console.log('✅ User challenges created:', data.challenges);
              }
            }
            
            // For Basic tier users, only complete onboarding if explicitly requested
            // This allows them to see the "Ga verder" button first
            // Only auto-complete for basic tier if explicitly requested via data.completeOnboarding
            if (!hasTrainingAccess && !hasNutritionAccess && data?.completeOnboarding) {
              updateData.onboarding_completed = true;
            }
            break;
          case ONBOARDING_STEPS.SELECT_TRAINING.id:
            updateData.training_schema_selected = true;
            break;
          case ONBOARDING_STEPS.SELECT_NUTRITION.id:
            updateData.nutrition_plan_selected = true;
            break;
          case ONBOARDING_STEPS.FORUM_INTRO.id:
            updateData.challenge_started = true;
            updateData.onboarding_completed = true;
            break;
        }
        break;
      
      case 'skip_step':
        // Skip current step and mark as completed
        switch (step) {
          case ONBOARDING_STEPS.SELECT_TRAINING.id:
            updateData.training_schema_selected = true;
            break;
          case ONBOARDING_STEPS.SELECT_NUTRITION.id:
            updateData.nutrition_plan_selected = true;
            // For basic tier users, complete onboarding after skipping nutrition step
            if (!hasTrainingAccess && !hasNutritionAccess) {
              updateData.onboarding_completed = true;
            }
            break;
        }
        break;
    }

    // Update or create onboarding status
    if (onboardingStatus) {
      // Update existing record
      const { data: updatedStatus, error: updateError } = await supabase
        .from('user_onboarding_status')
        .update(updateData)
        .eq('id', onboardingStatus.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating onboarding status:', updateError);
        return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
      }

      onboardingStatus = updatedStatus;
    } else {
      // Create new record
      const { data: newStatus, error: createError } = await supabase
        .from('user_onboarding_status')
        .insert({
          user_id: profile.id,
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

      if (createError) {
        console.error('❌ Error creating onboarding status:', createError);
        return NextResponse.json({ error: 'Failed to create onboarding status' }, { status: 500 });
      }

      onboardingStatus = newStatus;
    }

    console.log('✅ Onboarding V2 step completed:', { email, step, action });

    return NextResponse.json({
      success: true,
      message: 'Step completed successfully',
      onboarding: onboardingStatus
    });

  } catch (error) {
    console.error('❌ Onboarding V2 POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
