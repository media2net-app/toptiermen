import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    console.log('🔍 Fetching ALL members data...');

    // OPTIMIZED: Use parallel queries and better joins for performance
    console.log('⚡ [PERFORMANCE] Starting optimized parallel data fetching...');
    const startTime = Date.now();

    // Parallel fetch all data sources
    const [
      { data: allProfiles, error: profilesError },
      { data: allBadges, error: badgesError },
      { data: allMissions, error: missionsError },
      { data: onlineUsers, error: onlineError }
    ] = await Promise.all([
      // Get ALL profiles
      supabase.from('profiles').select('*'),
      
      // Get badge data with join
      supabase
        .from('user_badges')
        .select(`
          id,
          user_id,
          badge_id,
          unlocked_at,
          badges (
            id,
            title,
            description,
            image_url
          )
        `)
        .eq('status', 'unlocked')
        .order('unlocked_at', { ascending: false }),
      
      // Get XP data from missions
      supabase
        .from('user_missions')
        .select('user_id, points, xp_reward, last_completion_date')
        .not('last_completion_date', 'is', null),
      
      // Get online status
      supabase
        .from('user_presence')
        .select('user_id, is_online, last_seen')
        .eq('is_online', true)
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`⚡ [PERFORMANCE] Parallel queries completed in ${queryTime}ms`);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
    }

    if (missionsError) {
      console.error('Error fetching missions data:', missionsError);
    }

    if (onlineError) {
      console.error('Error fetching online status:', onlineError);
    }

    console.log(`📊 Found ${allProfiles?.length || 0} total profiles`);
    
    // Debug: Log all profile IDs
    if (allProfiles) {
      console.log('🔍 ALL Profile IDs found:');
      allProfiles.forEach((profile, index) => {
        const name = profile.display_name || profile.full_name || 'Unknown';
        console.log(`   ${index + 1}. ${name} (${profile.email}) - ID: ${profile.id}`);
      });
    }

    // OPTIMIZED: Process data with efficient maps
    const badgeCounts = new Map();
    const recentBadges = new Map();
    
    if (allBadges) {
      allBadges.forEach(badge => {
        const userId = badge.user_id;
        
        // Count badges
        const count = badgeCounts.get(userId) || 0;
        badgeCounts.set(userId, count + 1);
        
        // Store recent badges (max 5 per user)
        if (!recentBadges.has(userId)) {
          recentBadges.set(userId, []);
        }
        const userBadges = recentBadges.get(userId);
        if (userBadges.length < 5) {
          const badgeData = Array.isArray(badge.badges) ? badge.badges[0] : badge.badges;
          userBadges.push({
            id: badge.id,
            name: badgeData?.title || 'Unknown Badge',
            description: badgeData?.description || '',
            icon_url: badgeData?.image_url || null,
            unlocked_at: badge.unlocked_at
          });
        }
      });
    }

    // Calculate XP for each user
    const xpMap = new Map();
    if (allMissions) {
      const userXpMap = new Map();
      
      // Group missions by user and calculate total XP
      allMissions.forEach(mission => {
        const userId = mission.user_id;
        const currentXp = userXpMap.get(userId) || 0;
        const missionXp = mission.points || mission.xp_reward || 0;
        userXpMap.set(userId, currentXp + missionXp);
      });
      
      // Create rank data for each user
      userXpMap.forEach((totalXp, userId) => {
        const level = Math.floor(totalXp / 100) + 1;
        xpMap.set(userId, {
          total_xp: totalXp,
          rank: {
            id: level,
            name: level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : level === 3 ? 'Advanced' : 'Expert',
            rank_order: level,
            icon_name: 'FaStar'
          },
          current_rank_id: level
        });
      });
    }

    // Create online map
    const onlineMap = new Map();
    if (onlineUsers) {
      onlineUsers.forEach(user => {
        onlineMap.set(user.user_id, {
          is_online: user.is_online,
          last_seen: user.last_seen
        });
      });
    }

    // Step 5: Filter out test users (same logic as Admin Ledenbeheer)
    const isTestUser = (profile: any) => {
      return profile.email?.includes('test') || 
             profile.full_name?.toLowerCase().includes('test') ||
             profile.email?.includes('onboarding.') ||
             profile.email?.includes('final.') ||
             profile.email?.includes('premium.test') ||
             profile.email?.includes('basic.test') ||
             profile.email?.includes('v2.test') ||
             profile.email?.includes('v3.test');
    };

    // Filter out test users
    const realProfiles = (allProfiles || []).filter(profile => !isTestUser(profile));
    const testUsersCount = (allProfiles || []).length - realProfiles.length;
    
    console.log(`🔍 Filtered out ${testUsersCount} test users, ${realProfiles.length} real members remaining`);

    // Step 6: Enrich real profiles with data
    const enrichedMembers = realProfiles.map(profile => {
      const xpInfo = xpMap.get(profile.id);
      const badgeCount = badgeCounts.get(profile.id) || 0;
      const onlineInfo = onlineMap.get(profile.id);
      const userBadges = recentBadges.get(profile.id) || [];

      return {
        ...profile,
        current_xp: xpInfo?.total_xp || 0,
        current_rank: xpInfo?.rank || null,
        badges_count: badgeCount,
        badges: userBadges,
        is_online: onlineInfo?.is_online || false,
        last_seen: onlineInfo?.last_seen || null,
        fallback_rank: profile.rank
      };
    });

    console.log(`✅ Returning ${enrichedMembers.length} enriched members`);

    // Add cache control headers to prevent caching
    const response = NextResponse.json({ members: enrichedMembers });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error in members-data API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 