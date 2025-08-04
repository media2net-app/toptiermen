import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:info@toptiermen.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, icon, badge, data, tag } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's push subscription
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      console.log('No push subscription found for user:', userId);
      return NextResponse.json(
        { error: 'No push subscription found' },
        { status: 404 }
      );
    }

    // Prepare push payload
    const payload = {
      title: title || 'Top Tier Men',
      body: body,
      icon: icon || '/logo.svg',
      badge: badge || '/badge1.png',
      tag: tag || 'ttm-notification',
      data: data || { url: '/dashboard' },
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Openen',
          icon: '/logo.svg'
        },
        {
          action: 'dismiss',
          title: 'Sluiten'
        }
      ]
    };

    // Send push notification
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key
      }
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    console.log('✅ Push notification sent to user:', userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Push notification sent successfully' 
    });

  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
}

// Send notification to multiple users
export async function PUT(request: NextRequest) {
  try {
    const { userIds, title, body, icon, badge, data, tag } = await request.json();

    if (!userIds || !Array.isArray(userIds) || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get push subscriptions for all users
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);

    if (error || !subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for users:', userIds);
      return NextResponse.json(
        { error: 'No push subscriptions found' },
        { status: 404 }
      );
    }

    // Prepare push payload
    const payload = {
      title: title || 'Top Tier Men',
      body: body,
      icon: icon || '/logo.svg',
      badge: badge || '/badge1.png',
      tag: tag || 'ttm-notification',
      data: data || { url: '/dashboard' },
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Openen',
          icon: '/logo.svg'
        },
        {
          action: 'dismiss',
          title: 'Sluiten'
        }
      ]
    };

    // Send push notifications to all users
    const promises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        );

        return { userId: subscription.user_id, success: true };
      } catch (error) {
        console.error(`Failed to send notification to user ${subscription.user_id}:`, error);
        return { userId: subscription.user_id, success: false, error };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Push notifications sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({ 
      success: true, 
      message: `Push notifications sent: ${successful} successful, ${failed} failed`,
      results 
    });

  } catch (error) {
    console.error('Bulk push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send push notifications' },
      { status: 500 }
    );
  }
} 