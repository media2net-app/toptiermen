import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all badges with their categories
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('badges')
      .select(`
        *,
        badge_categories (
          id,
          name,
          icon_name,
          icon_color,
          display_order
        )
      `)
      .eq('is_active', true)
      .order('id');

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    // Get all ranks
    const { data: ranks, error: ranksError } = await supabaseAdmin
      .from('ranks')
      .select('*')
      .order('rank_order');

    if (ranksError) {
      console.error('Error fetching ranks:', ranksError);
      return NextResponse.json({ error: 'Failed to fetch ranks' }, { status: 500 });
    }

    // Get leaderboard data with real XP from user_missions
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        created_at
      `)
      .not('full_name', 'is', null)
      .limit(20);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Get XP data for each user from user_missions with time periods
    const leaderboardData = await Promise.all(
      profiles.map(async (profile) => {
        // Get all missions for this user
        const { data: allMissions, error: missionsError } = await supabaseAdmin
          .from('user_missions')
          .select('points, xp_reward, last_completion_date')
          .eq('user_id', profile.id)
          .not('last_completion_date', 'is', null);

        if (missionsError) {
          console.error(`Error fetching missions for user ${profile.id}:`, missionsError);
        }

        // Calculate XP for different time periods
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let totalXP = 0;
        let weeklyXP = 0;
        let monthlyXP = 0;

        if (allMissions) {
          allMissions.forEach(mission => {
            const missionDate = new Date(mission.last_completion_date);
            const xpReward = mission.points || mission.xp_reward || 0;
            
            totalXP += xpReward;
            
            if (missionDate >= weekAgo) {
              weeklyXP += xpReward;
            }
            
            if (missionDate >= monthAgo) {
              monthlyXP += xpReward;
            }
          });
        }

        const level = Math.floor(totalXP / 100) + 1;

        // Get user's badge count with time periods
        const { data: userBadges, error: badgesError } = await supabaseAdmin
          .from('user_badges')
          .select('id, unlocked_at')
          .eq('user_id', profile.id)
          .eq('status', 'unlocked');

        const badgeCount = userBadges?.length || 0;
        
        // Calculate badges for different time periods
        let weeklyBadges = 0;
        let monthlyBadges = 0;
        
        if (userBadges) {
          userBadges.forEach(badge => {
            const badgeDate = new Date(badge.unlocked_at);
            
            if (badgeDate >= weekAgo) {
              weeklyBadges++;
            }
            
            if (badgeDate >= monthAgo) {
              monthlyBadges++;
            }
          });
        }

        return {
          id: profile.id,
          name: profile.full_name,
          avatar_url: profile.avatar_url,
          xp: {
            total: totalXP,
            weekly: weeklyXP,
            monthly: monthlyXP
          },
          level: level,
          badges: {
            total: badgeCount,
            weekly: weeklyBadges,
            monthly: monthlyBadges
          },
          joinDate: profile.created_at
        };
      })
    );

    // Create different leaderboards
    const xpLeaderboard = leaderboardData
      .sort((a, b) => b.xp.total - a.xp.total)
      .slice(0, 10)
      .map((profile, index) => ({
        rank: index + 1,
        ...profile
      }));

    const weeklyXPLeaderboard = leaderboardData
      .sort((a, b) => b.xp.weekly - a.xp.weekly)
      .slice(0, 10)
      .map((profile, index) => ({
        rank: index + 1,
        ...profile
      }));

    const monthlyXPLeaderboard = leaderboardData
      .sort((a, b) => b.xp.monthly - a.xp.monthly)
      .slice(0, 10)
      .map((profile, index) => ({
        rank: index + 1,
        ...profile
      }));

    const badgesLeaderboard = leaderboardData
      .sort((a, b) => b.badges.total - a.badges.total)
      .slice(0, 10)
      .map((profile, index) => ({
        rank: index + 1,
        ...profile
      }));

    const weeklyBadgesLeaderboard = leaderboardData
      .sort((a, b) => b.badges.weekly - a.badges.weekly)
      .slice(0, 10)
      .map((profile, index) => ({
        rank: index + 1,
        ...profile
      }));

    const monthlyBadgesLeaderboard = leaderboardData
      .sort((a, b) => b.badges.monthly - a.badges.monthly)
      .slice(0, 10)
      .map((profile, index) => ({
        rank: index + 1,
        ...profile
      }));

    const levelLeaderboard = leaderboardData
      .sort((a, b) => b.level - a.level)
      .slice(0, 10)
      .map((profile, index) => ({
        rank: index + 1,
        ...profile
      }));

    const processedLeaderboard = {
      xp: {
        allTime: xpLeaderboard,
        weekly: weeklyXPLeaderboard,
        monthly: monthlyXPLeaderboard
      },
      badges: {
        allTime: badgesLeaderboard,
        weekly: weeklyBadgesLeaderboard,
        monthly: monthlyBadgesLeaderboard
      },
      levels: {
        allTime: levelLeaderboard
      }
    };

    // Get user badges for progress calculation
    const { data: userBadges, error: userBadgesError } = await supabaseAdmin
      .from('user_badges')
      .select(`
        user_id,
        badge_id,
        status,
        unlocked_at,
        progress_data
      `);

    if (userBadgesError) {
      console.error('Error fetching user badges:', userBadgesError);
      return NextResponse.json({ error: 'Failed to fetch user badges' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        badges,
        ranks,
        leaderboard: processedLeaderboard,
        userBadges
      }
    });

  } catch (error) {
    console.error('Error in badges API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
