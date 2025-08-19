import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch user's conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch conversations for the user
    const { data: conversations, error: convError } = await supabase
      .from('chat_conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        created_at,
        updated_at,
        last_message_at,
        is_active
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false });

    if (convError) {
      console.error('Error fetching conversations:', convError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Get the other participant's info for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations?.map(async (conv) => {
        const otherParticipantId = conv.participant1_id === userId 
          ? conv.participant2_id 
          : conv.participant1_id;

        // Get other participant's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, avatar_url, rank')
          .eq('id', otherParticipantId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        // Get last message
        const { data: lastMessage, error: msgError } = await supabase
          .from('chat_messages')
          .select('content, created_at, sender_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (msgError && msgError.code !== 'PGRST116') {
          console.error('Error fetching last message:', msgError);
        }

        // Get unread count
        const { count: unreadCount, error: countError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        if (countError) {
          console.error('Error counting unread messages:', countError);
        }

        // Get online status
        const { data: onlineStatus, error: statusError } = await supabase
          .from('user_online_status')
          .select('is_online, last_seen')
          .eq('user_id', otherParticipantId)
          .single();

        if (statusError && statusError.code !== 'PGRST116') {
          console.error('Error fetching online status:', statusError);
        }

        return {
          id: conv.id,
          participant: {
            id: otherParticipantId,
            name: profile?.display_name || profile?.full_name || 'Onbekende gebruiker',
            avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            rank: profile?.rank || 'Member'
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            time: lastMessage.created_at,
            fromMe: lastMessage.sender_id === userId
          } : null,
          unreadCount: unreadCount || 0,
          online: onlineStatus?.is_online || false,
          lastSeen: onlineStatus?.last_seen,
          updatedAt: conv.updated_at
        };
      }) || []
    );

    return NextResponse.json({ 
      conversations: conversationsWithParticipants 
    });

  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST: Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const { participant1Id, participant2Id } = await request.json();

    if (!participant1Id || !participant2Id) {
      return NextResponse.json({ 
        error: 'Both participant IDs are required' 
      }, { status: 400 });
    }

    // Check if conversation already exists
    const { data: existingConv, error: checkError } = await supabase
      .from('chat_conversations')
      .select('id')
      .or(`and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`)
      .eq('is_active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing conversation:', checkError);
      return NextResponse.json({ 
        error: 'Failed to check existing conversation' 
      }, { status: 500 });
    }

    if (existingConv) {
      return NextResponse.json({ 
        conversationId: existingConv.id,
        message: 'Conversation already exists' 
      });
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('chat_conversations')
      .insert({
        participant1_id: participant1Id,
        participant2_id: participant2Id,
        is_active: true
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return NextResponse.json({ 
        error: 'Failed to create conversation' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      conversationId: newConversation.id,
      message: 'Conversation created successfully' 
    });

  } catch (error) {
    console.error('Error in create conversation API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
