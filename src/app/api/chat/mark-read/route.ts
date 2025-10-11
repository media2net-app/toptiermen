import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId } = await request.json();

    if (!conversationId || !userId) {
      return NextResponse.json({ 
        error: 'Conversation ID and User ID are required' 
      }, { status: 400 });
    }

    console.log('📖 Marking messages as read:', { conversationId, userId });

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('Conversation not found:', convError);
      return NextResponse.json({ 
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    // Check if user is part of the conversation
    if (conversation.participant1_id !== userId && conversation.participant2_id !== userId) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Mark all unread messages in this conversation (except user's own messages) as read
    const { error: updateError, count } = await supabase
      .from('chat_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', userId); // Don't mark own messages as read

    if (updateError) {
      console.error('Error marking messages as read:', updateError);
      return NextResponse.json({ 
        error: 'Failed to mark messages as read' 
      }, { status: 500 });
    }

    console.log(`✅ Marked ${count || 0} messages as read in conversation ${conversationId}`);

    return NextResponse.json({ 
      success: true,
      markedCount: count || 0,
      message: 'Messages marked as read' 
    });

  } catch (error) {
    console.error('Error in mark-read API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

