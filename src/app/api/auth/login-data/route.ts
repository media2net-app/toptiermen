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

    // ✅ PHASE 1.3: Parallel data fetching for better performance
    const [profileResult, onboardingResult] = await Promise.all([
      // Fetch profile data
      supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      
      // Fetch onboarding status
      supabaseAdmin
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', userId)
        .single()
    ]);

    // Check for errors
    if (profileResult.error) {
      console.error('❌ Profile fetch error:', profileResult.error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (onboardingResult.error) {
      console.error('❌ Onboarding fetch error:', onboardingResult.error);
      return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 });
    }

    // Determine admin status
    const knownAdminEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu', 'admin@toptiermen.com', 'chiel@toptiermen.eu'];
    const isAdmin = profileResult.data.role === 'admin' || knownAdminEmails.includes(profileResult.data.email);

    // Calculate current onboarding step
    const onboarding = onboardingResult.data;
    let currentStep: number | null = null;
    
    if (!onboarding.onboarding_completed) {
      if (!onboarding.welcome_video_shown) currentStep = 0;
      else if (!onboarding.goal_set) currentStep = 1;
      else if (!onboarding.missions_selected) currentStep = 2;
      else if (!onboarding.training_schema_selected) currentStep = 3;
      else if (!onboarding.nutrition_plan_selected) currentStep = 4;
      else if (!onboarding.challenge_started) currentStep = 5;
    }

    const loginData = {
      profile: profileResult.data,
      onboarding: {
        ...onboarding,
        currentStep
      },
      isAdmin,
      hasTrainingAccess: ['Premium Tier', 'Lifetime Access', 'Lifetime Tier'].includes(profileResult.data.package_type) || profileResult.data.subscription_tier === 'lifetime',
      hasNutritionAccess: ['Premium Tier', 'Lifetime Access', 'Lifetime Tier'].includes(profileResult.data.package_type) || profileResult.data.subscription_tier === 'lifetime',
      isBasic: profileResult.data.package_type === 'Basic Tier'
    };

    console.log('✅ Login data fetched successfully:', {
      profile: profileResult.data.email,
      onboarding: onboarding.onboarding_completed,
      currentStep,
      isAdmin
    });

    return NextResponse.json({ success: true, data: loginData });

  } catch (error) {
    console.error('❌ Error in login-data API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
