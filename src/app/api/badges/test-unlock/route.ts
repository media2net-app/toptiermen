import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { badgeId, userEmail } = body;

    if (!badgeId || !userEmail) {
      return NextResponse.json({ 
        error: 'Badge ID en user email zijn verplicht' 
      }, { status: 400 });
    }

    console.log(`🔓 Testing badge unlock: Badge ID ${badgeId} for user ${userEmail}`);

    // 1. Find the user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.error('❌ User not found:', userError);
      return NextResponse.json({ 
        error: `Gebruiker met email ${userEmail} niet gevonden` 
      }, { status: 404 });
    }

    // 2. Check if the badge exists
    const { data: badge, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('id, title, description, icon_name, rarity_level, xp_reward')
      .eq('id', badgeId)
      .single();

    if (badgeError || !badge) {
      console.error('❌ Badge not found:', badgeError);
      return NextResponse.json({ 
        error: `Badge met ID ${badgeId} niet gevonden` 
      }, { status: 404 });
    }

    // 3. Check if user already has this badge
    const { data: existingBadge, error: existingError } = await supabaseAdmin
      .from('user_badges')
      .select('id, unlocked_at')
      .eq('user_id', user.id)
      .eq('badge_id', badgeId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('❌ Error checking existing badge:', existingError);
      return NextResponse.json({ 
        error: 'Fout bij controleren van bestaande badge' 
      }, { status: 500 });
    }

    if (existingBadge) {
      return NextResponse.json({ 
        error: `Gebruiker heeft deze badge al: ${badge.title}`,
        alreadyUnlocked: true,
        unlockedAt: existingBadge.unlocked_at
      }, { status: 409 });
    }

    // 4. Award the badge to the user
    const { data: newUserBadge, error: awardError } = await supabaseAdmin
      .from('user_badges')
      .insert({
        user_id: user.id,
        badge_id: badgeId,
        unlocked_at: new Date().toISOString(),
        status: 'unlocked'
      })
      .select()
      .single();

    if (awardError) {
      console.error('❌ Error awarding badge:', awardError);
      return NextResponse.json({ 
        error: 'Fout bij toekennen van badge' 
      }, { status: 500 });
    }

    // 5. Update user's XP if the badge has XP reward
    if (badge.xp_reward && badge.xp_reward > 0) {
      const { error: xpError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          points: supabaseAdmin.rpc('increment', { 
            row: 'points', 
            amount: badge.xp_reward 
          })
        })
        .eq('id', user.id);

      if (xpError) {
        console.warn('⚠️ Warning: Could not update user XP:', xpError);
      }
    }

    console.log(`✅ Badge "${badge.title}" successfully awarded to ${user.full_name}`);

    return NextResponse.json({
      success: true,
      message: `Badge "${badge.title}" succesvol toegekend aan ${user.full_name}`,
      badge: {
        id: badge.id,
        title: badge.title,
        description: badge.description,
        icon_name: badge.icon_name,
        rarity_level: badge.rarity_level,
        xp_reward: badge.xp_reward
      },
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      unlockedAt: newUserBadge.unlocked_at
    });

  } catch (error) {
    console.error('❌ Error in test badge unlock:', error);
    return NextResponse.json({ 
      error: 'Interne server fout' 
    }, { status: 500 });
  }
}
