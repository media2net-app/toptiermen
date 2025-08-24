import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, badgeIds } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Adding test badges to user:', userId);

    // If no specific badge IDs provided, get the first 5 badges
    let badgesToAdd = badgeIds;
    if (!badgesToAdd || badgesToAdd.length === 0) {
      console.log('📋 Fetching available badges...');
      const { data: availableBadges, error: badgesError } = await supabase
        .from('badges')
        .select('id')
        .limit(5);

      if (badgesError) {
        console.error('❌ Error fetching badges:', badgesError);
        return NextResponse.json({ error: 'Failed to fetch badges', details: badgesError }, { status: 500 });
      }

      console.log('✅ Available badges:', availableBadges);
      badgesToAdd = availableBadges.map(badge => badge.id);
    }

    console.log('🏆 Adding badges:', badgesToAdd);

    // Add badges to user
    const userBadgesToInsert = badgesToAdd.map(badgeId => ({
      user_id: userId,
      badge_id: badgeId,
      status: 'unlocked',
      unlocked_at: new Date().toISOString()
    }));

    console.log('📝 Inserting user badges:', userBadgesToInsert);

    const { data: insertedData, error: insertError } = await supabase
      .from('user_badges')
      .insert(userBadgesToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting user badges:', insertError);
      return NextResponse.json({ 
        error: 'Failed to add badges', 
        details: insertError,
        attemptedData: userBadgesToInsert
      }, { status: 500 });
    }

    console.log('✅ Successfully added badges:', insertedData.length);

    // Verify the badges were added
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        status,
        badges (
          title,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', userId);

    if (verifyError) {
      console.error('❌ Error verifying badges:', verifyError);
      return NextResponse.json({ error: 'Failed to verify badges', details: verifyError }, { status: 500 });
    }

    console.log('✅ Verification successful, total badges:', verifyData.length);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${insertedData.length} badges`,
      totalBadges: verifyData.length,
      badges: verifyData
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
