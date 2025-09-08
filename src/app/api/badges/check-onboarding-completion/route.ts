import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🏅 Checking onboarding completion badge for user:', userId);

    // Check if user has completed onboarding
    const { data: onboardingStatus, error: onboardingError } = await supabaseAdmin
      .from('onboarding_status')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    if (onboardingError || !onboardingStatus?.onboarding_completed) {
      return NextResponse.json({ unlocked: false, reason: 'Onboarding not completed' });
    }

    // Check if user already has the "First of 100 members" badge
    const { data: existingBadge, error: badgeError } = await supabaseAdmin
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', 1) // Assuming badge ID 1 is "First 100 - Leden van het Eerste Uur"
      .single();

    if (badgeError && badgeError.code !== 'PGRST116') {
      console.error('Error checking existing badge:', badgeError);
      return NextResponse.json({ error: 'Failed to check existing badge' }, { status: 500 });
    }

    if (existingBadge) {
      return NextResponse.json({ unlocked: false, reason: 'Badge already unlocked' });
    }

    // Unlock the "First of 100 members" badge
    const { error: unlockError } = await supabaseAdmin
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: 1, // "First 100 - Leden van het Eerste Uur" badge
        status: 'unlocked',
        unlocked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (unlockError) {
      console.error('Error unlocking badge:', unlockError);
      return NextResponse.json({ error: 'Failed to unlock badge' }, { status: 500 });
    }

    console.log('✅ Onboarding completion badge unlocked for user:', userId);

    return NextResponse.json({ 
      unlocked: true, 
      message: 'First of 100 members badge unlocked!' 
    });

  } catch (error) {
    console.error('❌ Error in check onboarding completion badge:', error);
    return NextResponse.json({ error: 'Failed to check onboarding completion badge' }, { status: 500 });
  }
}
