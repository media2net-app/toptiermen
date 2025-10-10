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

    // Simple query: Get all users except the current user
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, full_name, avatar_url')
      .neq('id', excludeUserId)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch users' 
      }, { status: 500 });
    }

    // Format profiles with default rank
    const formattedProfiles = (profiles || []).map(p => ({
      id: p.id,
      display_name: p.display_name || p.full_name || 'Unknown',
      full_name: p.full_name || p.display_name || 'Unknown',
      avatar_url: p.avatar_url || null,
      rank: 'Member' // Default rank for all users
    }));

    console.log('✅ Found', formattedProfiles.length, 'available users');
    if (formattedProfiles.length > 0) {
      console.log('📊 Sample user:', formattedProfiles[0]);
    }

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
