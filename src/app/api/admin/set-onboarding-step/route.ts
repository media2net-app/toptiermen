import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, step } = await request.json();
    
    if (!email || step === undefined) {
      return NextResponse.json({ error: 'Email and step are required' }, { status: 400 });
    }

    console.log(`🔄 Setting user ${email} to step ${step}`);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Define step configurations
    const stepConfigs = {
      0: {
        welcome_video_shown: false,
        onboarding_completed: false,
        goal_set: false,
        missions_selected: false,
        training_schema_selected: false,
        nutrition_plan_selected: false,
        challenge_started: false,
        completed_steps: []
      },
      1: {
        welcome_video_shown: true,
        onboarding_completed: false,
        goal_set: false,
        missions_selected: false,
        training_schema_selected: false,
        nutrition_plan_selected: false,
        challenge_started: false,
        completed_steps: [0]
      },
      2: {
        welcome_video_shown: true,
        onboarding_completed: false,
        goal_set: true,
        missions_selected: false,
        training_schema_selected: false,
        nutrition_plan_selected: false,
        challenge_started: false,
        completed_steps: [0, 1]
      },
      3: {
        welcome_video_shown: true,
        onboarding_completed: false,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: false,
        nutrition_plan_selected: false,
        challenge_started: false,
        completed_steps: [0, 1, 2]
      },
      4: {
        welcome_video_shown: true,
        onboarding_completed: false,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: false,
        challenge_started: false,
        completed_steps: [0, 1, 2, 3]
      },
      5: {
        welcome_video_shown: true,
        onboarding_completed: false,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: true,
        challenge_started: false,
        completed_steps: [0, 1, 2, 3, 4]
      }
    };

    const config = stepConfigs[step as keyof typeof stepConfigs];
    if (!config) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    // First, delete any existing onboarding status
    await supabase
      .from('user_onboarding_status')
      .delete()
      .eq('user_id', profile.id);

    // Insert new onboarding status
    const { data, error } = await supabase
      .from('user_onboarding_status')
      .insert({
        user_id: profile.id,
        ...config
      })
      .select();

    if (error) {
      console.error('❌ Error updating onboarding status:', error);
      return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
    }

    console.log(`✅ User ${email} set to step ${step}:`, data[0]);

    return NextResponse.json({ 
      success: true,
      message: `User set to step ${step}`,
      onboarding: data[0]
    });

  } catch (error) {
    console.error('❌ Error setting onboarding step:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
