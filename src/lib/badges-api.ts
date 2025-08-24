import { supabase } from './supabase';

// Icon mapping for converting database icon names to React components
export const iconMap = {
  FaFlag: '🚩',
  FaUserShield: '🛡️',
  FaBolt: '⚡',
  FaDumbbell: '🏋️',
  FaCrown: '👑',
  FaStar: '⭐',
  FaFire: '🔥',
  FaBrain: '🧠',
  FaUsers: '👥',
  FaBookOpen: '📖',
  FaRunning: '🏃',
  FaSnowflake: '❄️',
  FaMedal: '🏅',
  FaTrophy: '🏆',
  FaLock: '🔒'
};

export interface Rank {
  id: number;
  name: string;
  icon_name: string;
  badges_needed: number;
  xp_needed: number;
  unlock_description: string;
  rank_order: number;
}

export interface BadgeCategory {
  id: number;
  name: string;
  icon_name: string;
  icon_color: string;
  description: string;
  display_order: number;
}

export interface Badge {
  id: number;
  category_id: number;
  title: string;
  description: string;
  icon_name: string;
  image_url?: string;
  requirements: any;
  xp_reward: number;
  rarity_level: string;
  is_active: boolean;
}

export interface UserBadge {
  id: number;
  user_id: string;
  badge_id: number;
  status: 'locked' | 'progress' | 'unlocked';
  progress_data: any;
  unlocked_at: string | null;
  badge: Badge;
}

export interface UserXP {
  id: number;
  user_id: string;
  total_xp: number;
  current_rank_id: number;
  rank_achieved_at: string;
  ranks: Rank;
}

export interface XPTransaction {
  id: number;
  user_id: string;
  xp_amount: number;
  source_type: string;
  source_id: number | null;
  description: string;
  created_at: string;
}

export interface UserStreak {
  id: number;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_xp: number;
  current_rank_id: number;
  rank_name: string;
  badge_count: number;
  current_streak: number;
  rank_position: number;
}

// Get all ranks
export async function getRanks(): Promise<Rank[]> {
  const { data, error } = await supabase
    .from('ranks')
    .select('*')
    .order('rank_order');

  if (error) throw error;
  return data || [];
}

// Get all badge categories with badges
export async function getBadgeCategories(): Promise<(BadgeCategory & { badges: Badge[] })[]> {
  try {
    const { data, error } = await supabase
      .from('badge_categories')
      .select(`
        *,
        badges(*)
      `)
      .order('display_order');

    if (error) {
      console.error('getBadgeCategories error:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('getBadgeCategories catch:', err);
    throw err;
  }
}

// Get user's XP and rank info
export async function getUserXP(userId: string): Promise<UserXP | null> {
  try {
    const { data, error } = await supabase
      .from('user_xp')
      .select(`
        *,
        ranks!current_rank_id(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('getUserXP error:', error);
      if (error.code === 'PGRST116') {
        // User doesn't exist in user_xp, create entry
        console.log('Creating new user XP entry for:', userId);
        const { data: newData, error: insertError } = await supabase
          .from('user_xp')
          .insert({ user_id: userId, total_xp: 0, current_rank_id: 1 })
          .select(`
            *,
            ranks!current_rank_id(*)
          `)
          .single();

        if (insertError) {
          console.error('getUserXP insert error:', insertError);
          throw insertError;
        }
        return newData;
      }
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('getUserXP catch:', err);
    throw err;
  }
}

// Get user's badges with progress
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  // First get all badges
  const { data: allBadges, error: badgesError } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('id');

  if (badgesError) throw badgesError;

  // Then get user's badge progress
  const { data: userBadgeData, error: userBadgesError } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId);

  if (userBadgesError) throw userBadgesError;

  // Combine the data
  const userBadges: UserBadge[] = allBadges.map(badge => {
    const userBadge = userBadgeData?.find(ub => ub.badge_id === badge.id);
    
    return {
      id: userBadge?.id || 0,
      user_id: userId,
      badge_id: badge.id,
      status: userBadge?.status || 'locked',
      progress_data: userBadge?.progress_data || null,
      unlocked_at: userBadge?.unlocked_at || null,
      badge: badge
    };
  });

  return userBadges;
}

// Get user's XP transaction history
export async function getXPHistory(userId: string, limit: number = 10): Promise<XPTransaction[]> {
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Get user's streaks
export async function getUserStreaks(userId: string): Promise<UserStreak[]> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

// Get leaderboard data
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard', { 
      p_limit: limit 
    });

    if (error) {
      console.error('RPC get_leaderboard error:', error);
      // Fallback: manual query
      const { data: xpData, error: xpError } = await supabase
        .from('user_xp')
        .select(`
          user_id,
          total_xp,
          current_rank_id
        `)
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (xpError) {
        console.error('Fallback XP query error:', xpError);
        throw xpError;
      }

      // Get profiles separately
      const userIds = xpData?.map(item => item.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Profiles query error:', profilesError);
      }

      // Get ranks separately
      const { data: ranksData, error: ranksError } = await supabase
        .from('ranks')
        .select('id, name');

      if (ranksError) {
        console.error('Ranks query error:', ranksError);
      }

      // Transform manual data
      return xpData?.map((item: any, index) => {
        const profile = profilesData?.find(p => p.id === item.user_id);
        const rank = ranksData?.find(r => r.id === item.current_rank_id);
        
        return {
          user_id: item.user_id,
          full_name: profile?.full_name || 'Unknown User',
          total_xp: item.total_xp,
          current_rank_id: item.current_rank_id,
          rank_name: rank?.name || 'Recruit',
          badge_count: 0, // We'll count this separately if needed
          current_streak: 0, // We'll get this separately if needed
          rank_position: index + 1
        };
      }) || [];
    }

    return data || [];
  } catch (err) {
    console.error('getLeaderboard error:', err);
    throw err;
  }
}

// Award XP to user
export async function awardXP(
  userId: string, 
  xpAmount: number, 
  sourceType: string, 
  sourceId?: number, 
  description?: string
): Promise<any> {
  const { data, error } = await supabase.rpc('award_xp', {
    p_user_id: userId,
    p_xp_amount: xpAmount,
    p_source_type: sourceType,
    p_source_id: sourceId,
    p_description: description
  });

  if (error) throw error;
  return data;
}

// Unlock badge for user
export async function unlockBadge(userId: string, badgeId: number): Promise<any> {
  const { data, error } = await supabase.rpc('unlock_badge', {
    p_user_id: userId,
    p_badge_id: badgeId
  });

  if (error) throw error;
  return data;
}

// Update user streak
export async function updateStreak(userId: string, streakType: string): Promise<any> {
  const { data, error } = await supabase.rpc('update_streak', {
    p_user_id: userId,
    p_streak_type: streakType
  });

  if (error) throw error;
  return data;
}

// Get streak rewards configuration
export async function getStreakRewards(): Promise<any[]> {
  const { data, error } = await supabase
    .from('streak_rewards')
    .select('*')
    .eq('streak_type', 'daily_login')
    .order('milestone_days');

  if (error) throw error;
  return data || [];
}

// Helper function to get icon for display
export function getIconForDisplay(iconName: string): string {
  return iconMap[iconName as keyof typeof iconMap] || '❓';
} 