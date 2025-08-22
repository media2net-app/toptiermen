import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, taskTitle, assignedTo, message } = body;

    console.log('🔔 Sending task notification:', { taskId, taskTitle, assignedTo });

    // Check if this is for Chiel
    if (assignedTo === 'Chiel') {
      // Create notification in database
      const { data: notification, error: notificationError } = await supabaseAdmin
        .from('admin_notifications')
        .insert([{
          type: 'task_assigned',
          title: 'Nieuwe Taak Toegewezen',
          message: message || `Je hebt een nieuwe taak gekregen: ${taskTitle}`,
          recipient: 'Chiel',
          task_id: taskId,
          status: 'unread',
          priority: 'high',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (notificationError) {
        console.error('❌ Error creating notification:', notificationError);
      } else {
        console.log('✅ Notification created:', notification.id);
      }

      // Send push notification if available
      try {
        const pushResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/push/send`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds: ['chiel-user-id'], // This would need to be Chiel's actual user ID
            title: '📋 Nieuwe Taak Toegewezen',
            body: `Je hebt een nieuwe taak gekregen: ${taskTitle}`,
            icon: '/logo_white-full.svg',
            badge: '/badge-no-excuses.png',
            data: { 
              url: '/dashboard-admin/taken',
              taskId: taskId,
              timestamp: new Date().toISOString()
            }
          })
        });

        if (pushResponse.ok) {
          console.log('✅ Push notification sent to Chiel');
        } else {
          console.log('⚠️ Push notification failed, but task notification was created');
        }
      } catch (pushError) {
        console.log('⚠️ Push notification error:', pushError);
      }

      // Send email notification (if email service is configured)
      try {
        // This would integrate with your email service
        console.log('📧 Email notification would be sent to Chiel');
      } catch (emailError) {
        console.log('⚠️ Email notification error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Task notification sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending task notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send task notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get('recipient') || 'Chiel';
    const status = searchParams.get('status') || 'unread';

    console.log('📋 Fetching notifications for:', recipient);

    const { data: notifications, error } = await supabaseAdmin
      .from('admin_notifications')
      .select('*')
      .eq('recipient', recipient)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      count: notifications?.length || 0
    });

  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
