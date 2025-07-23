import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get profiles data
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Get XP and rank data for all users
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
      return NextResponse.json({ error: 'Failed to fetch XP data' }, { status: 500 });
    }

    // Get user badges count
    const { data: badgesCounts, error: badgesError } = await supabase
      .from('user_badges')
      .select('user_id, status')
      .eq('status', 'unlocked');

    if (badgesError) {
      console.error('Error fetching badges data:', badgesError);
      return NextResponse.json({ error: 'Failed to fetch badges data' }, { status: 500 });
    }

    // Create a map for XP data
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

    // Create a map for badges count
    const badgesMap = new Map();
    if (badgesCounts) {
      badgesCounts.forEach(badge => {
        const count = badgesMap.get(badge.user_id) || 0;
        badgesMap.set(badge.user_id, count + 1);
      });
    }

    // Combine the data
    const enrichedMembers = (profilesData || []).map(profile => {
      const xpInfo = xpMap.get(profile.id);
      const badgeCount = badgesMap.get(profile.id) || 0;
      
      return {
        ...profile,
        // Add new rank system data
        current_xp: xpInfo?.total_xp || 0,
        current_rank: xpInfo?.rank || null,
        badges_count: badgeCount,
        // Keep original rank as fallback
        fallback_rank: profile.rank
      };
    });

    return NextResponse.json({ members: enrichedMembers });
  } catch (error) {
    console.error('Error in members-data API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 