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

    const { promptType, promptLocation, userAction, selectedPlan } = await request.json();

    if (!promptType || !userAction) {
      return NextResponse.json(
        { error: 'Prompt type and user action are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking upgrade prompt: ${promptType} - ${userAction} for user: ${user.id}`);

    // Insert upgrade prompt record
    const { error: insertError } = await supabase
      .from('trial_upgrade_prompts')
      .insert({
        user_id: user.id,
        prompt_type: promptType,
        prompt_location: promptLocation || 'dashboard',
        user_action: userAction,
        action_taken_at: new Date().toISOString(),
        selected_plan: selectedPlan,
        conversion_value: selectedPlan ? getPlanValue(selectedPlan) : null
      });

    if (insertError) {
      console.error('Error inserting upgrade prompt:', insertError);
      return NextResponse.json(
        { error: 'Failed to track upgrade prompt' },
        { status: 500 }
      );
    }

    // Update user subscription record with prompt count
    if (userAction === 'shown') {
      // Get current prompt count and increment it
      const { data: currentSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('upgrade_prompts_shown')
        .eq('user_id', user.id)
        .single();

      if (!fetchError && currentSubscription) {
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            upgrade_prompts_shown: (currentSubscription.upgrade_prompts_shown || 0) + 1,
            last_upgrade_prompt: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating prompt count:', updateError);
        }
      }
    }

    // Track conversion event if user upgraded
    if (userAction === 'upgraded' && selectedPlan) {
      await supabase
        .from('trial_conversion_events')
        .insert({
          user_id: user.id,
          event_type: 'trial_upgraded',
          event_data: {
            selected_plan: selectedPlan,
            prompt_type: promptType,
            prompt_location: promptLocation,
            conversion_value: getPlanValue(selectedPlan)
          }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Upgrade prompt tracked successfully'
    });

  } catch (error) {
    console.error('Error in upgrade prompt API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getPlanValue(plan: string): number {
  switch (plan) {
    case 'starter':
      return 49;
    case 'pro':
      return 99;
    case 'elite':
      return 199;
    default:
      return 0;
  }
} 