import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');

    if (!conversationId || !userId) {
      return NextResponse.json({ 
        error: 'Conversation ID and User ID are required' 
      }, { status: 400 });
    }

    // Verify user is part of the conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .eq('is_active', true)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ 
        error: 'Conversation not found or access denied' 
      }, { status: 404 });
    }

    if (conversation.participant1_id !== userId && conversation.participant2_id !== userId) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        content,
        message_type,
        is_read,
        read_at,
        created_at,
        sender_id
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      return NextResponse.json({ 
        error: 'Failed to fetch messages' 
      }, { status: 500 });
    }

    // Mark messages as read
    await supabase.rpc('mark_conversation_as_read', {
      conv_id: conversationId,
      user_id: userId
    });

    // Format messages
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      content: msg.content,
      messageType: msg.message_type,
      isRead: msg.is_read,
      readAt: msg.read_at,
      createdAt: msg.created_at,
      fromMe: msg.sender_id === userId
    })) || [];

    return NextResponse.json({ 
      messages: formattedMessages 
    });

  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  try {
    const { conversationId, senderId, content, messageType = 'text' } = await request.json();

    if (!conversationId || !senderId || !content) {
      return NextResponse.json({ 
        error: 'Conversation ID, Sender ID, and content are required' 
      }, { status: 400 });
    }

    // Verify user is part of the conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .eq('is_active', true)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ 
        error: 'Conversation not found or access denied' 
      }, { status: 404 });
    }

    if (conversation.participant1_id !== senderId && conversation.participant2_id !== senderId) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Insert new message
    const { data: newMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        message_type: messageType
      })
      .select(`
        id,
        content,
        message_type,
        is_read,
        created_at,
        sender_id
      `)
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json({ 
        error: 'Failed to send message' 
      }, { status: 500 });
    }

    // Format response
    const formattedMessage = {
      id: newMessage.id,
      content: newMessage.content,
      messageType: newMessage.message_type,
      isRead: newMessage.is_read,
      createdAt: newMessage.created_at,
      fromMe: newMessage.sender_id === senderId
    };

    return NextResponse.json({ 
      message: formattedMessage,
      success: true 
    });

  } catch (error) {
    console.error('Error in send message API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
