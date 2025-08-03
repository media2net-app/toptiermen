import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`📊 Fetching trial status for user: ${user.id}`);

    // Get user subscription data
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no subscription record exists, create one
    if (!subscription && !subscriptionError) {
      console.log('🆕 Creating trial subscription for new user');
      
      const { data: newSubscription, error: createError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_tier: 'trial',
          subscription_status: 'active',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          conversion_source: 'trial'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating trial subscription:', createError);
        return NextResponse.json(
          { error: 'Failed to create trial subscription' },
          { status: 500 }
        );
      }

      // Track trial started event
      await supabase
        .from('trial_conversion_events')
        .insert({
          user_id: user.id,
          event_type: 'trial_started',
          event_data: {
            trial_start_date: newSubscription.trial_start_date,
            trial_end_date: newSubscription.trial_end_date
          }
        });

      return NextResponse.json({
        success: true,
        trial: {
          isInTrial: true,
          daysRemaining: 7,
          trialStartDate: newSubscription.trial_start_date,
          trialEndDate: newSubscription.trial_end_date,
          subscriptionTier: 'trial',
          subscriptionStatus: 'active',
          features: {
            academyModules: 1,
            trainingSchemas: 1,
            nutritionPlans: 1,
            communityAccess: false,
            coachingSessions: false
          }
        }
      });
    }

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription data' },
        { status: 500 }
      );
    }

    // Calculate trial status
    const now = new Date();
    const trialEndDate = new Date(subscription.trial_end_date);
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isInTrial = subscription.subscription_tier === 'trial' && 
                     subscription.subscription_status === 'active' && 
                     trialEndDate > now && 
                     !subscription.trial_used;

    // Get feature access
    const { data: featureAccess, error: featureError } = await supabase
      .from('trial_feature_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('access_granted', true);

    if (featureError) {
      console.error('Error fetching feature access:', featureError);
    }

    // Count features by type
    const academyModules = featureAccess?.filter(f => f.feature_type === 'academy_module').length || 0;
    const trainingSchemas = featureAccess?.filter(f => f.feature_type === 'training_schema').length || 0;
    const nutritionPlans = featureAccess?.filter(f => f.feature_type === 'nutrition_plan').length || 0;

    return NextResponse.json({
      success: true,
      trial: {
        isInTrial,
        daysRemaining,
        trialStartDate: subscription.trial_start_date,
        trialEndDate: subscription.trial_end_date,
        subscriptionTier: subscription.subscription_tier,
        subscriptionStatus: subscription.subscription_status,
        trialUsed: subscription.trial_used,
        upgradePromptsShown: subscription.upgrade_prompts_shown,
        lastUpgradePrompt: subscription.last_upgrade_prompt,
        features: {
          academyModules: Math.min(academyModules, isInTrial ? 1 : 999),
          trainingSchemas: Math.min(trainingSchemas, isInTrial ? 1 : 999),
          nutritionPlans: Math.min(nutritionPlans, isInTrial ? 1 : 999),
          communityAccess: !isInTrial,
          coachingSessions: !isInTrial
        },
        limits: {
          maxAcademyModules: isInTrial ? 1 : 999,
          maxTrainingSchemas: isInTrial ? 1 : 999,
          maxNutritionPlans: isInTrial ? 1 : 999
        }
      }
    });

  } catch (error) {
    console.error('Error in trial status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 