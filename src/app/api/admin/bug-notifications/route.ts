import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      bugReportId, 
      type, 
      title, 
      message, 
      metadata = {},
      oldStatus,
      newStatus 
    } = body;

    console.log('🔔 Sending bug notification:', { 
      userId, 
      bugReportId, 
      type, 
      title, 
      oldStatus, 
      newStatus 
    });

    if (!userId || !bugReportId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification in database
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('bug_notifications')
      .insert([{
        user_id: userId,
        bug_report_id: bugReportId,
        type,
        title,
        message,
        metadata: {
          ...metadata,
          old_status: oldStatus,
          new_status: newStatus,
          sent_at: new Date().toISOString()
        },
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (notificationError) {
      console.error('❌ Error creating bug notification:', notificationError);
      return NextResponse.json(
        { success: false, error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    console.log('✅ Bug notification created:', notification.id);

    // Try to send push notification if available
    try {
      // Get user's push subscription
      const { data: pushSubscription } = await supabaseAdmin
        .from('push_subscriptions')
        .select('endpoint, p256dh_key, auth_key')
        .eq('user_id', userId)
        .single();

      if (pushSubscription) {
        // Here you would implement the actual push notification sending
        // For now, we'll just log that we found a subscription
        console.log('📱 Push subscription found for user:', userId);
        // TODO: Implement actual push notification sending
      }
    } catch (pushError) {
      console.log('ℹ️ No push subscription found for user:', userId);
    }

    return NextResponse.json({
      success: true,
      notification: notification,
      message: 'Bug notification sent successfully'
    });

  } catch (error) {
    console.error('❌ Error in bug notifications API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('📋 Fetching bug notifications for user:', userId);

    let query = supabaseAdmin
      .from('bug_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }

    const { data: notifications, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching bug notifications:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('bug_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    console.log('✅ Bug notifications fetched successfully:', notifications?.length || 0, 'notifications');
    
    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      totalCount: notifications?.length || 0
    });

  } catch (error) {
    console.error('❌ Error fetching bug notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId || isRead === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📝 Marking notification as read:', { notificationId, isRead });

    const { data: notification, error } = await supabaseAdmin
      .from('bug_notifications')
      .update({ 
        is_read: isRead,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating notification:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    console.log('✅ Notification updated successfully');

    return NextResponse.json({
      success: true,
      notification: notification,
      message: 'Notification updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
