import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Push subscription API called');
    
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    const { userId, subscription } = body;

    if (!userId || !subscription) {
      console.error('❌ Missing required fields:', { userId: !!userId, subscription: !!subscription });
      return NextResponse.json(
        { error: 'Missing userId or subscription' },
        { status: 400 }
      );
    }

    console.log('✅ Validating subscription data...');
    console.log('👤 User ID:', userId);
    console.log('📡 Endpoint:', subscription.endpoint?.substring(0, 50) + '...');
    console.log('🔑 Has p256dh key:', !!subscription.keys?.p256dh);
    console.log('🔑 Has auth key:', !!subscription.keys?.auth);

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      console.error('❌ Invalid subscription data');
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Store push subscription in database
    console.log('💾 Storing subscription in database...');
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: `Failed to store subscription: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Push subscription stored for user:', userId);
    console.log('📊 Stored data:', data);

    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription created successfully',
      subscriptionId: null
    });

  } catch (error) {
    console.error('❌ Push subscription error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Remove push subscription from database
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 }
      );
    }

    console.log('✅ Push subscription removed for user:', userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription removed successfully' 
    });

  } catch (error) {
    console.error('Push unsubscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 