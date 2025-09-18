import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  try {
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, package_type')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ error: 'Profile not found', details: profileError }, { status: 404 });
    }

    // Get onboarding status (get the most recent record)
    const { data: onboardingRecords, error: onboardingError } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    const onboardingStatus = onboardingRecords && onboardingRecords.length > 0 ? onboardingRecords[0] : null;


    // Map package_type to access control
    const packageType = profile.package_type || 'Basic Tier';
    const hasTrainingAccess = packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';
    const hasNutritionAccess = packageType === 'Premium Tier' || packageType === 'Lifetime Tier' || packageType === 'Lifetime Access';

    // Define all onboarding steps
    const allSteps = [
      { id: 0, title: 'Welkomstvideo bekijken', requiresAccess: null },
      { id: 1, title: 'Hoofddoel bepalen', requiresAccess: null },
      { id: 2, title: 'Uitdagingen selecteren', requiresAccess: null },
      { id: 3, title: 'Trainingsschema kiezen', requiresAccess: 'training' },
      { id: 4, title: 'Voedingsplan kiezen', requiresAccess: 'nutrition' },
      { id: 5, title: 'Challenge selecteren', requiresAccess: null },
      { id: 6, title: 'Forum introductie', requiresAccess: null }
    ];

    // Filter steps based on access
    const availableSteps = allSteps.filter(step => {
      if (step.requiresAccess === 'training') return hasTrainingAccess;
      if (step.requiresAccess === 'nutrition') return hasNutritionAccess;
      return true;
    });

    // Map step IDs to new sequence
    const stepMapping = {};
    availableSteps.forEach((step, index) => {
      stepMapping[step.id] = index;
    });

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        package_type: packageType
      },
      onboarding_status: onboardingStatus,
      onboarding_error: onboardingError?.message || null,
      access_control: {
        hasTrainingAccess,
        hasNutritionAccess,
        isBasic: packageType === 'Basic Tier'
      },
      step_analysis: {
        all_steps: allSteps,
        available_steps: availableSteps,
        step_mapping: stepMapping,
        current_step_in_sequence: onboardingStatus ? (() => {
          if (onboardingStatus.onboarding_completed) return null;
          
          // Determine the NEXT step the user should go to (not the current step)
          if (onboardingStatus.challenge_started) {
            return stepMapping[6] || 4; // Forum Introductie (final step)
          } else if (onboardingStatus.nutrition_plan_selected) {
            return stepMapping[6] || 4; // Next: Forum Introductie
          } else if (onboardingStatus.training_schema_selected) {
            return stepMapping[4] || 3; // Next: Voedingsplan
          } else if (onboardingStatus.missions_selected) {
            return stepMapping[3] || 2; // Next: Trainingsschema
          } else if (onboardingStatus.goal_set) {
            return stepMapping[2] || 1; // Next: Missies Selecteren
          } else if (onboardingStatus.welcome_video_shown) {
            return stepMapping[1] || 0; // Next: Doel Omschrijven
          } else {
            return stepMapping[0] || 0; // Next: Welkom Video
          }
        })() : null,
        should_skip_training: !hasTrainingAccess,
        should_skip_nutrition: !hasNutritionAccess
      }
    });
  } catch (error) {
    console.error('Debug onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
