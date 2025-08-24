import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ChatNotification {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export function useChatNotifications(
  onNewMessage?: (notification: ChatNotification) => void,
  onConversationUpdate?: (conversationId: string) => void
) {
  const { user } = useSupabaseAuth();
  const subscriptionRef = useRef<any>(null);
  const isOnlineRef = useRef<boolean>(true);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    console.log('🔔 Setting up chat notifications for user:', user.id);

    // Subscribe to new messages for all conversations this user is part of
    const messageSubscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          console.log('📨 New message received:', payload);
          
          const newMessage = payload.new;
          
          // Check if this message is for a conversation this user is part of
          const { data: conversation } = await supabase
            .from('chat_conversations')
            .select('participant1_id, participant2_id')
            .eq('id', newMessage.conversation_id)
            .eq('is_active', true)
            .single();

          if (!conversation) return;

          // Check if current user is part of this conversation
          const isParticipant = conversation.participant1_id === user.id || conversation.participant2_id === user.id;
          if (!isParticipant) return;

          // Don't notify for own messages
          if (newMessage.sender_id === user.id) {
            return;
          }

          // Get sender profile
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('display_name, full_name')
            .eq('id', newMessage.sender_id)
            .single();

          const senderName = senderProfile?.display_name || senderProfile?.full_name || 'Onbekende gebruiker';

          const notification: ChatNotification = {
            id: newMessage.id,
            conversationId: newMessage.conversation_id,
            senderId: newMessage.sender_id,
            senderName,
            content: newMessage.content,
            timestamp: newMessage.created_at
          };

          // Call callback if provided
          if (onNewMessage) {
            onNewMessage(notification);
          }

          // Send push notification if user is not focused on the page
          if (!document.hasFocus() && isOnlineRef.current) {
            sendPushNotification(notification);
          }

          // Show in-app notification if user is online
          if (isOnlineRef.current) {
            showInAppNotification(notification);
          }

          // Update conversation list
          if (onConversationUpdate) {
            onConversationUpdate(newMessage.conversation_id);
          }
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationSubscription = supabase
      .channel('chat_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
          filter: `participant1_id=eq.${user.id} OR participant2_id=eq.${user.id}`
        },
        (payload) => {
          console.log('💬 Conversation update:', payload);
          if (onConversationUpdate) {
            onConversationUpdate(payload.new?.id || payload.old?.id);
          }
        }
      )
      .subscribe();

    // Track online status
    const handleVisibilityChange = () => {
      isOnlineRef.current = !document.hidden;
      updateOnlineStatus(!document.hidden);
    };

    const handleFocus = () => {
      isOnlineRef.current = true;
      updateOnlineStatus(true);
    };

    const handleBlur = () => {
      isOnlineRef.current = false;
      updateOnlineStatus(false);
    };

    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Store subscription reference
    subscriptionRef.current = {
      message: messageSubscription,
      conversation: conversationSubscription
    };

    // Initial online status
    updateOnlineStatus(true);

    // Cleanup function
    return () => {
      console.log('🔕 Cleaning up chat notifications');
      
      if (subscriptionRef.current) {
        subscriptionRef.current.message.unsubscribe();
        subscriptionRef.current.conversation.unsubscribe();
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);

      updateOnlineStatus(false);
    };
  }, [user, onNewMessage, onConversationUpdate]);

  // Helper function to get user's conversation IDs
  const getUserConversationIds = async () => {
    if (!user) return '';
    
    const { data: conversations } = await supabase
      .from('chat_conversations')
      .select('id')
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .eq('is_active', true);

    return conversations?.map(c => c.id).join(',') || '';
  };

  // Update online status
  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      await fetch('/api/chat/online-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isOnline })
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  // Send push notification
  const sendPushNotification = async (notification: ChatNotification) => {
    try {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          title: `Nieuw bericht van ${notification.senderName}`,
          body: notification.content.length > 50 
            ? notification.content.substring(0, 50) + '...' 
            : notification.content,
          icon: '/favicon.ico',
          badge: '/badge-no-excuses.png',
          data: {
            conversationId: notification.conversationId,
            senderId: notification.senderId,
            type: 'chat_message'
          },
          tag: `chat_${notification.conversationId}`
        })
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  // Show in-app notification
  const showInAppNotification = (notification: ChatNotification) => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      return;
    }

    // Check if we have permission
    if (Notification.permission === 'granted') {
      new Notification(`Nieuw bericht van ${notification.senderName}`, {
        body: notification.content.length > 100 
          ? notification.content.substring(0, 100) + '...' 
          : notification.content,
        icon: '/favicon.ico',
        badge: '/badge-no-excuses.png',
        tag: `chat_${notification.conversationId}`,
        requireInteraction: false,
        silent: false
      });
    }
  };

  return {
    isOnline: isOnlineRef.current
  };
}
