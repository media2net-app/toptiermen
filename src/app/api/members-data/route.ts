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

    // Step 1: Get ALL profiles first
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
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

    // Step 2: Get badge counts for all users
    const { data: allBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select('user_id');

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
    }

    // Create badge count map
    const badgeCounts = new Map();
    if (allBadges) {
      allBadges.forEach(badge => {
        const count = badgeCounts.get(badge.user_id) || 0;
        badgeCounts.set(badge.user_id, count + 1);
      });
    }

    // Step 3: Get XP data
    const { data: allXp, error: xpError } = await supabase
      .from('user_xp')
      .select(`
        user_id,
        total_xp,
        current_rank_id,
        ranks (
          id,
          name,
          rank_order,
          icon_name
        )
      `);

    if (xpError) {
      console.error('Error fetching XP data:', xpError);
    }

    // Create XP map
    const xpMap = new Map();
    if (allXp) {
      allXp.forEach(xp => {
        xpMap.set(xp.user_id, {
          total_xp: xp.total_xp,
          rank: xp.ranks,
          current_rank_id: xp.current_rank_id
        });
      });
    }

    // Step 4: Get online status
    const { data: onlineUsers, error: onlineError } = await supabase
      .from('user_presence')
      .select('user_id, is_online, last_seen')
      .eq('is_online', true);

    if (onlineError) {
      console.error('Error fetching online status:', onlineError);
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

    // Step 5: Enrich ALL profiles with data
    const enrichedMembers = (allProfiles || []).map(profile => {
      const xpInfo = xpMap.get(profile.id);
      const badgeCount = badgeCounts.get(profile.id) || 0;
      const onlineInfo = onlineMap.get(profile.id);

      return {
        ...profile,
        current_xp: xpInfo?.total_xp || 0,
        current_rank: xpInfo?.rank || null,
        badges_count: badgeCount,
        is_online: onlineInfo?.is_online || false,
        last_seen: onlineInfo?.last_seen || null,
        fallback_rank: profile.rank
      };
    });

    console.log(`✅ Returning ${enrichedMembers.length} enriched members`);

    return NextResponse.json({ members: enrichedMembers });
  } catch (error) {
    console.error('Error in members-data API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 