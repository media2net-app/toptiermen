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

    // OPTIMIZED: Batch fetch all related data to avoid N+1 queries
    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Get all unique participant IDs
    const participantIds = conversations.map(conv => 
      conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id
    );

    // Get all conversation IDs
    const conversationIds = conversations.map(conv => conv.id);

    // Batch fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, avatar_url, rank')
      .in('id', participantIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Batch fetch all last messages
    const { data: lastMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('conversation_id, content, created_at, sender_id')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    // Batch fetch unread counts
    const { data: unreadCounts, error: unreadError } = await supabase
      .from('chat_messages')
      .select('conversation_id, id')
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (unreadError) {
      console.error('Error fetching unread counts:', unreadError);
    }

    // Batch fetch online statuses
    const { data: onlineStatuses, error: onlineError } = await supabase
      .from('user_online_status')
      .select('user_id, is_online, last_seen')
      .in('user_id', participantIds);

    if (onlineError) {
      console.error('Error fetching online statuses:', onlineError);
    }

    // Create lookup maps
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
    const lastMessagesMap = new Map();
    const unreadCountsMap = new Map();
    const onlineStatusesMap = new Map(onlineStatuses?.map(s => [s.user_id, s]) || []);

    // Process last messages (get the most recent per conversation)
    lastMessages?.forEach(msg => {
      if (!lastMessagesMap.has(msg.conversation_id)) {
        lastMessagesMap.set(msg.conversation_id, msg);
      }
    });

    // Process unread counts
    unreadCounts?.forEach(msg => {
      const count = unreadCountsMap.get(msg.conversation_id) || 0;
      unreadCountsMap.set(msg.conversation_id, count + 1);
    });

    // Build response
    const conversationsWithParticipants = conversations.map(conv => {
      const otherParticipantId = conv.participant1_id === userId 
        ? conv.participant2_id 
        : conv.participant1_id;

      const profile = profilesMap.get(otherParticipantId);
      const lastMessage = lastMessagesMap.get(conv.id);
      const unreadCount = unreadCountsMap.get(conv.id) || 0;
      const onlineStatus = onlineStatusesMap.get(otherParticipantId);

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
        unreadCount,
        online: onlineStatus?.is_online || false,
        lastSeen: onlineStatus?.last_seen,
        updatedAt: conv.updated_at
      };
    });

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
