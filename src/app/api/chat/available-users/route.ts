import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeUserId = searchParams.get('excludeUserId');

    if (!excludeUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'excludeUserId parameter is required' 
      }, { status: 400 });
    }

    console.log('🔍 Fetching available users, excluding:', excludeUserId);

    // Get all users except the current user with their rank info
    // Use left join so we get all users, even those without ranks
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        display_name,
        full_name,
        avatar_url,
        fallback_rank,
        user_ranks (
          rank:ranks (
            id,
            name
          )
        )
      `)
      .neq('id', excludeUserId)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      // Fallback: Try without ranks if the query fails
      const { data: fallbackProfiles, error: fallbackError } = await supabaseAdmin
        .from('profiles')
        .select('id, display_name, full_name, avatar_url, fallback_rank')
        .neq('id', excludeUserId)
        .order('display_name', { ascending: true });
      
      if (fallbackError) {
        console.error('❌ Fallback query also failed:', fallbackError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to fetch users' 
        }, { status: 500 });
      }
      
      // Format fallback profiles
      const formattedFallback = (fallbackProfiles || []).map(p => ({
        id: p.id,
        display_name: p.display_name,
        full_name: p.full_name,
        avatar_url: p.avatar_url || null,
        rank: p.fallback_rank || 'Member'
      }));
      
      console.log('✅ Found', formattedFallback.length, 'available users (fallback)');
      return NextResponse.json({
        success: true,
        items: formattedFallback
      });
    }

    // Format profiles with rank information
    const formattedProfiles = (profiles || []).map(p => {
      // user_ranks can be an array or null
      const userRanks = (p as any).user_ranks;
      let rankName = p.fallback_rank || 'Member';
      
      // Extract rank name from user_ranks if available
      if (Array.isArray(userRanks) && userRanks.length > 0) {
        // Get the first user_rank that has a rank object
        const validRank = userRanks.find((ur: any) => ur?.rank?.name);
        if (validRank?.rank?.name) {
          rankName = validRank.rank.name;
        }
      }
      
      return {
        id: p.id,
        display_name: p.display_name,
        full_name: p.full_name,
        avatar_url: p.avatar_url || null,
        rank: rankName
      };
    });

    console.log('✅ Found', formattedProfiles.length, 'available users');
    console.log('📊 Sample user:', formattedProfiles[0]);

    return NextResponse.json({
      success: true,
      items: formattedProfiles
    });

  } catch (error) {
    console.error('❌ Error in available-users API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
