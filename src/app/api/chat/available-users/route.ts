import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Get all users except the current user
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        full_name,
        avatar_url,
        rank
      `)
      .neq('id', excludeUserId)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch users' 
      }, { status: 500 });
    }

    console.log('✅ Found', profiles?.length || 0, 'available users');

    return NextResponse.json({
      success: true,
      items: profiles || []
    });

  } catch (error) {
    console.error('❌ Error in available-users API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
