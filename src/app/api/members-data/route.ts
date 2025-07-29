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

    console.log('🔍 Fetching members data...');

    // Get all profiles with basic data first
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    console.log(`📊 Found ${profiles?.length || 0} profiles`);

    // Get real-time online status from user_presence table
    const { data: presenceData, error: presenceError } = await supabase
      .from('user_presence')
      .select('user_id, is_online, last_seen')
      .eq('is_online', true);

    if (presenceError) {
      console.error('Error fetching presence data:', presenceError);
      // Continue without presence data if there's an error
    }

    console.log(`🟢 Found ${presenceData?.length || 0} online users`);

    // Get XP data separately
    const { data: xpData, error: xpError } = await supabase
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

    // Get badges count
    const { data: badgesData, error: badgesError } = await supabase
      .from('user_badges')
      .select('user_id, status')
      .eq('status', 'unlocked');

    if (badgesError) {
      console.error('Error fetching badges data:', badgesError);
    }

    // Create maps for efficient lookup
    const onlineUsers = new Map();
    if (presenceData) {
      presenceData.forEach(presence => {
        onlineUsers.set(presence.user_id, {
          is_online: presence.is_online,
          last_seen: presence.last_seen
        });
      });
    }

    const xpMap = new Map();
    if (xpData) {
      xpData.forEach(xp => {
        xpMap.set(xp.user_id, {
          total_xp: xp.total_xp,
          rank: xp.ranks,
          current_rank_id: xp.current_rank_id
        });
      });
    }

    const badgesMap = new Map();
    if (badgesData) {
      badgesData.forEach(badge => {
        const count = badgesMap.get(badge.user_id) || 0;
        badgesMap.set(badge.user_id, count + 1);
      });
    }

    // Enrich profiles with all data
    const enrichedMembers = (profiles || []).map(profile => {
      const xpInfo = xpMap.get(profile.id);
      const badgeCount = badgesMap.get(profile.id) || 0;
      const presence = onlineUsers.get(profile.id);

      return {
        ...profile,
        current_xp: xpInfo?.total_xp || 0,
        current_rank: xpInfo?.rank || null,
        badges_count: badgeCount,
        is_online: presence?.is_online || false,
        last_seen: presence?.last_seen || null,
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