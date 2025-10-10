import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching login data for user:', userId);

    // Fetch profile data
    const profileResult = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Check for profile errors
    if (profileResult.error) {
      console.error('❌ Profile fetch error:', profileResult.error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Try to fetch onboarding status from user_onboarding_status table (legacy)
    // If it doesn't exist, we'll use the onboarding V2 API
    let onboardingData: any = null;
    
    const onboardingResult = await supabaseAdmin
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (onboardingResult.error) {
      console.warn('⚠️ user_onboarding_status table not found or error, using onboarding V2 data:', onboardingResult.error.message);
    } else if (onboardingResult.data) {
      onboardingData = onboardingResult.data;
      console.log('✅ Found onboarding data in user_onboarding_status');
    } else {
      console.log('ℹ️ No data in user_onboarding_status, user may be using onboarding V2');
    }

    // If no legacy onboarding data, create a default one
    if (!onboardingData) {
      console.log('🔧 Creating default onboarding data for compatibility');
      onboardingData = {
        user_id: userId,
        onboarding_completed: false,
        welcome_video_shown: false,
        goal_set: false,
        missions_selected: false,
        training_schema_selected: false,
        nutrition_plan_selected: false,
        challenge_started: false
      };
    }

    // Determine admin status
    const knownAdminEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu', 'admin@toptiermen.com', 'chiel@toptiermen.eu'];
    const isAdmin = profileResult.data.role === 'admin' || knownAdminEmails.includes(profileResult.data.email);

    // Calculate current onboarding step
    let currentStep: number | null = null;
    
    if (!onboardingData.onboarding_completed) {
      if (!onboardingData.welcome_video_shown) currentStep = 0;
      else if (!onboardingData.goal_set) currentStep = 1;
      else if (!onboardingData.missions_selected) currentStep = 2;
      else if (!onboardingData.training_schema_selected) currentStep = 3;
      else if (!onboardingData.nutrition_plan_selected) currentStep = 4;
      else if (!onboardingData.challenge_started) currentStep = 5;
    }

    const loginData = {
      profile: profileResult.data,
      onboarding: {
        ...onboardingData,
        currentStep
      },
      isAdmin,
      hasTrainingAccess: ['Premium Tier', 'Lifetime Access', 'Lifetime Tier'].includes(profileResult.data.package_type) || profileResult.data.subscription_tier === 'lifetime',
      hasNutritionAccess: ['Premium Tier', 'Lifetime Access', 'Lifetime Tier'].includes(profileResult.data.package_type) || profileResult.data.subscription_tier === 'lifetime',
      isBasic: profileResult.data.package_type === 'Basic Tier'
    };

    console.log('✅ Login data fetched successfully:', {
      profile: profileResult.data.email,
      onboarding: onboardingData.onboarding_completed,
      currentStep,
      isAdmin
    });

    return NextResponse.json({ success: true, data: loginData });

  } catch (error) {
    console.error('❌ Error in login-data API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
