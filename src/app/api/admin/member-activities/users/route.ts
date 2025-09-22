import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    console.log(`📊 Fetching users for activities filter, search: "${search}"`);

    // Build query with optional search
    let query = supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        created_at
      `)
      .order('full_name', { ascending: true });

    // Add search filter if provided
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log(`✅ Found ${users?.length || 0} users`);

    return NextResponse.json({
      success: true,
      users: users || []
    });

  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
