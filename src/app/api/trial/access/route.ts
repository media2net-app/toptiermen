import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    const { featureType, featureId, action } = await request.json();

    if (!featureType || !featureId) {
      return NextResponse.json(
        { error: 'Feature type and feature ID are required' },
        { status: 400 }
      );
    }

    console.log(`🔐 Checking feature access: ${featureType} - ${featureId} for user: ${user.id}`);

    // Get user subscription data
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription data' },
        { status: 500 }
      );
    }

    // Check if user is in trial
    const now = new Date();
    const trialEndDate = new Date(subscription.trial_end_date);
    const isInTrial = subscription.subscription_tier === 'trial' && 
                     subscription.subscription_status === 'active' && 
                     trialEndDate > now && 
                     !subscription.trial_used;

    // If not in trial, grant full access
    if (!isInTrial) {
      console.log('✅ User not in trial - granting full access');
      
      // Track usage
      await supabase
        .from('trial_usage_tracking')
        .insert({
          user_id: user.id,
          feature_type: featureType,
          feature_id: featureId,
          action_type: action || 'access'
        });

      return NextResponse.json({
        success: true,
        access: true,
        reason: 'paid_subscription',
        message: 'Full access granted'
      });
    }

    // Check current feature access
    const { data: existingAccess, error: accessError } = await supabase
      .from('trial_feature_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('feature_type', featureType)
      .eq('feature_id', featureId)
      .single();

    if (accessError && accessError.code !== 'PGRST116') {
      console.error('Error checking feature access:', accessError);
      return NextResponse.json(
        { error: 'Failed to check feature access' },
        { status: 500 }
      );
    }

    // If already has access, grant it
    if (existingAccess && existingAccess.access_granted) {
      console.log('✅ User already has access to this feature');
      
      // Track usage
      await supabase
        .from('trial_usage_tracking')
        .insert({
          user_id: user.id,
          feature_type: featureType,
          feature_id: featureId,
          action_type: action || 'access'
        });

      return NextResponse.json({
        success: true,
        access: true,
        reason: 'already_granted',
        message: 'Access already granted'
      });
    }

    // Check trial limits
    const { data: currentFeatures, error: featuresError } = await supabase
      .from('trial_feature_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('feature_type', featureType)
      .eq('access_granted', true);

    if (featuresError) {
      console.error('Error checking current features:', featuresError);
      return NextResponse.json(
        { error: 'Failed to check current features' },
        { status: 500 }
      );
    }

    const currentCount = currentFeatures?.length || 0;
    const maxAllowed = getMaxAllowedForFeatureType(featureType);

    if (currentCount >= maxAllowed) {
      console.log(`❌ Trial limit reached for ${featureType}: ${currentCount}/${maxAllowed}`);
      
      // Track upgrade prompt
      await supabase
        .from('trial_upgrade_prompts')
        .insert({
          user_id: user.id,
          prompt_type: 'usage_limit',
          prompt_location: featureType,
          user_action: 'blocked'
        });

      return NextResponse.json({
        success: true,
        access: false,
        reason: 'trial_limit_reached',
        message: `Trial limit reached for ${featureType}`,
        currentCount,
        maxAllowed,
        upgradeRequired: true
      });
    }

    // Grant access
    console.log(`✅ Granting trial access to ${featureType}: ${featureId}`);
    
    const { error: grantError } = await supabase
      .from('trial_feature_access')
      .insert({
        user_id: user.id,
        feature_type: featureType,
        feature_id: featureId,
        access_granted: true,
        access_granted_at: new Date().toISOString()
      });

    if (grantError) {
      console.error('Error granting feature access:', grantError);
      return NextResponse.json(
        { error: 'Failed to grant feature access' },
        { status: 500 }
      );
    }

    // Track usage
    await supabase
      .from('trial_usage_tracking')
      .insert({
        user_id: user.id,
        feature_type: featureType,
        feature_id: featureId,
        action_type: action || 'access'
      });

    return NextResponse.json({
      success: true,
      access: true,
      reason: 'trial_access_granted',
      message: 'Trial access granted',
      currentCount: currentCount + 1,
      maxAllowed
    });

  } catch (error) {
    console.error('Error in trial access API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getMaxAllowedForFeatureType(featureType: string): number {
  switch (featureType) {
    case 'academy_module':
      return 1;
    case 'training_schema':
      return 1;
    case 'nutrition_plan':
      return 1;
    case 'community_access':
      return 0;
    case 'coaching_session':
      return 0;
    default:
      return 0;
  }
} 