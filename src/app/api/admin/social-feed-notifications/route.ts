import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching social feed notifications from database...');
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const is_read = searchParams.get('is_read');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('social_feed_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (is_read !== null) {
      query = query.eq('is_read', is_read === 'true');
    }

    const { data: notifications, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching social feed notifications:', error);
      return NextResponse.json({ error: `Failed to fetch notifications: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Social feed notifications fetched successfully:', notifications?.length || 0, 'notifications');
    return NextResponse.json({ success: true, notifications: notifications || [] });

  } catch (error) {
    console.error('❌ Error in social feed notifications API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new social feed notification...');
    
    const body = await request.json();
    const { type, message, user_id, metadata } = body;

    if (!type || !message) {
      return NextResponse.json({ error: 'Type and message are required' }, { status: 400 });
    }

    const { data: notification, error } = await supabaseAdmin
      .from('social_feed_notifications')
      .insert({
        type,
        message,
        user_id,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating social feed notification:', error);
      return NextResponse.json({ error: `Failed to create notification: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Social feed notification created successfully:', notification.id);
    return NextResponse.json({ success: true, notification });

  } catch (error) {
    console.error('❌ Error in social feed notifications POST API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 