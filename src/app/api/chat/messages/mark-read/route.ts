import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { messageId, userId } = await request.json();

    if (!messageId || !userId) {
      return NextResponse.json({ 
        error: 'Message ID and User ID are required' 
      }, { status: 400 });
    }

    // Verify user has access to this message
    const { data: message, error: msgError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        chat_conversations!inner(
          participant1_id,
          participant2_id
        )
      `)
      .eq('id', messageId)
      .single();

    if (msgError || !message) {
      return NextResponse.json({ 
        error: 'Message not found' 
      }, { status: 404 });
    }

    // Check if user is part of the conversation
    const conversation = message.chat_conversations;
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json({ 
        error: 'Conversation not found' 
      }, { status: 404 });
    }
    
    const conv = conversation[0];
    if (conv.participant1_id !== userId && conv.participant2_id !== userId) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Don't mark own messages as read
    if (message.sender_id === userId) {
      return NextResponse.json({ 
        success: true,
        message: 'Own message, no need to mark as read' 
      });
    }

    // Mark message as read
    const { error: updateError } = await supabase
      .from('chat_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (updateError) {
      console.error('Error marking message as read:', updateError);
      return NextResponse.json({ 
        error: 'Failed to mark message as read' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Message marked as read' 
    });

  } catch (error) {
    console.error('Error in mark-read API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

