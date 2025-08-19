import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// POST: Update user's online status
export async function POST(request: NextRequest) {
  try {
    const { userId, isOnline } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Update online status
    const { error: updateError } = await supabase
      .from('user_online_status')
      .upsert({
        user_id: userId,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Error updating online status:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update online status' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Online status updated successfully' 
    });

  } catch (error) {
    console.error('Error in online status API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET: Get online status for multiple users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIds = searchParams.get('userIds');

    if (!userIds) {
      return NextResponse.json({ 
        error: 'User IDs are required' 
      }, { status: 400 });
    }

    const userIdArray = userIds.split(',');

    // Get online status for specified users
    const { data: onlineStatuses, error: fetchError } = await supabase
      .from('user_online_status')
      .select('user_id, is_online, last_seen')
      .in('user_id', userIdArray);

    if (fetchError) {
      console.error('Error fetching online statuses:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch online statuses' 
      }, { status: 500 });
    }

    // Format response
    const statusMap = onlineStatuses?.reduce((acc, status) => {
      acc[status.user_id] = {
        isOnline: status.is_online,
        lastSeen: status.last_seen
      };
      return acc;
    }, {} as Record<string, { isOnline: boolean; lastSeen: string }>) || {};

    return NextResponse.json({ 
      onlineStatuses: statusMap 
    });

  } catch (error) {
    console.error('Error in get online status API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
