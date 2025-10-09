import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// POST: Mark all messages in a conversation as read for a user
export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId } = await request.json();

    if (!conversationId || !userId) {
      return NextResponse.json({ 
        error: 'Conversation ID and User ID are required' 
      }, { status: 400 });
    }

    // Mark all messages in this conversation as read, except those sent by the user
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (error) {
      console.error('Error marking messages as read:', error);
      return NextResponse.json({ 
        error: 'Failed to mark messages as read' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Messages marked as read' 
    });

  } catch (error) {
    console.error('Error in mark-read API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

