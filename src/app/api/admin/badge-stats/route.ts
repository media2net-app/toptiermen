import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching badge statistics...');

    // Fetch all required data in parallel
    const [
      { data: badges, error: badgesError },
      { data: userBadges, error: userBadgesError },
      { data: users, error: usersError }
    ] = await Promise.all([
      supabaseAdmin.from('badges').select('*'),
      supabaseAdmin.from('user_badges').select('*'),
      supabaseAdmin.from('users').select('id')
    ]);

    if (badgesError) console.error('Error fetching badges:', badgesError);
    if (userBadgesError) console.error('Error fetching user badges:', userBadgesError);
    if (usersError) console.error('Error fetching users:', usersError);

    // Calculate badge statistics
    const totalBadges = badges?.length || 0;
    const activeBadges = badges?.filter(b => b.is_active).length || 0;
    const totalUnlocked = userBadges?.filter(ub => ub.status === 'unlocked').length || 0;
    const averageUnlocks = totalBadges > 0 ? Math.round(totalUnlocked / totalBadges) : 0;

    // Find most popular badge
    const badgeCounts = userBadges?.reduce((acc, ub) => {
      if (ub.status === 'unlocked') {
        acc[ub.badge_id] = (acc[ub.badge_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const mostPopularBadgeId = Object.keys(badgeCounts).reduce((a, b) => 
      badgeCounts[a] > badgeCounts[b] ? a : b, '');
    
    const mostPopularBadge = badges?.find(b => b.id === mostPopularBadgeId)?.name || 'Geen';

    // Calculate recent unlocks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUnlocks = userBadges?.filter(ub => 
      ub.status === 'unlocked' && 
      ub.unlocked_at && 
      new Date(ub.unlocked_at) > sevenDaysAgo
    ).length || 0;

    const badgeStats = {
      totalBadges,
      activeBadges,
      totalUnlocked,
      averageUnlocks,
      mostPopularBadge,
      recentUnlocks
    };

    // Calculate rank statistics
    const { data: ranks, error: ranksError } = await supabaseAdmin
      .from('ranks')
      .select('*');

    if (ranksError) console.error('Error fetching ranks:', ranksError);

    const { data: userXP, error: userXPError } = await supabaseAdmin
      .from('user_xp')
      .select('*');

    if (userXPError) console.error('Error fetching user XP:', userXPError);

    const totalRanks = ranks?.length || 0;
    const usersWithRanks = userXP?.length || 0;
    const averageRank = userXP?.reduce((sum, xp) => sum + (xp.current_rank_id || 1), 0) / (userXP?.length || 1) || 1;
    
    const highestRank = ranks?.find(r => r.rank_order === Math.max(...(ranks?.map(r => r.rank_order) || [1])))?.name || 'Rookie';
    
    const recentPromotions = userXP?.filter(xp => 
      xp.last_rank_upgrade && 
      new Date(xp.last_rank_upgrade) > sevenDaysAgo
    ).length || 0;

    const rankStats = {
      totalRanks,
      usersWithRanks,
      averageRank: Math.round(averageRank * 10) / 10,
      highestRank,
      recentPromotions
    };

    console.log('📊 Badge and rank stats calculated:', {
      totalBadges,
      activeBadges,
      totalUnlocked,
      mostPopularBadge,
      totalRanks,
      usersWithRanks
    });

    return NextResponse.json({ 
      success: true, 
      badgeStats,
      rankStats
    });

  } catch (error) {
    console.error('Error fetching badge statistics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch badge statistics' 
    }, { status: 500 });
  }
} 