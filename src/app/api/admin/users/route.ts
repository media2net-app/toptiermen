import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const rank = searchParams.get('rank') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        username,
        status,
        role,
        points,
        missions_completed,
        created_at,
        updated_at,
        profiles!inner(
          rank,
          subscription_tier,
          onboarding_completed,
          last_login_at,
          badge_count,
          streak_count
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (rank) {
      query = query.eq('profiles.rank', rank);
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data: users, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Format users data
    const formattedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name || 'Onbekend',
      username: user.username || `@${user.email?.split('@')[0]}`,
      status: user.status || 'active',
      role: user.role || 'user',
      points: user.points || 0,
      missions_completed: user.missions_completed || 0,
      rank: user.profiles && user.profiles.length > 0 ? user.profiles[0].rank || 'Recruit' : 'Recruit',
      subscription_tier: user.profiles && user.profiles.length > 0 ? user.profiles[0].subscription_tier || 'Gratis' : 'Gratis',
      onboarding_completed: user.profiles && user.profiles.length > 0 ? user.profiles[0].onboarding_completed || false : false,
      last_login_at: user.profiles && user.profiles.length > 0 ? user.profiles[0].last_login_at : null,
      badge_count: user.profiles && user.profiles.length > 0 ? user.profiles[0].badge_count || 0 : 0,
      streak_count: user.profiles && user.profiles.length > 0 ? user.profiles[0].streak_count || 0 : 0,
      created_at: user.created_at,
      updated_at: user.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'update_status':
        return await updateUserStatus(userId, data.status);
      
      case 'update_role':
        return await updateUserRole(userId, data.role);
      
      case 'update_rank':
        return await updateUserRank(userId, data.rank);
      
      case 'delete_user':
        return await deleteUser(userId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in users API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateUserStatus(userId: string, status: string) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User status updated successfully'
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateUserRole(userId: string, role: string) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateUserRank(userId: string, rank: string) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ rank })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user rank:', error);
      return NextResponse.json(
        { error: 'Failed to update user rank' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User rank updated successfully'
    });

  } catch (error) {
    console.error('Error updating user rank:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteUser(userId: string) {
  try {
    // Delete from profiles first
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
    }

    // Delete from users
    const { error: userError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Error deleting user:', userError);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // Delete from auth (optional - requires admin privileges)
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (authError) {
      console.warn('Could not delete user from auth:', authError);
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 