'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import Link from 'next/link';
import { playNotificationSound } from '@/utils/notificationSound';

interface InboxMessage {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  conversation_id?: string;
}

export default function InboxIcon() {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showInbox, setShowInbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousUnreadCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  // Fetch messages when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchMessages();
      
      // Set up polling for new messages every 30 seconds
      const interval = setInterval(fetchMessages, 120000); // OPTIMIZED: Changed from 30s to 2min
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowInbox(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play notification sound when unread count increases
  useEffect(() => {
    // Skip on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousUnreadCountRef.current = unreadCount;
      return;
    }

    // Play sound if unread count increased (new messages)
    if (unreadCount > previousUnreadCountRef.current) {
      playNotificationSound();
    }

    // Update previous count
    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const fetchMessages = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch real conversations from the chat API
      const response = await fetch(`/api/chat/conversations?userId=${user.id}`);
      const data = await response.json();
      
      if (response.ok && data.conversations) {
        // Convert conversations to inbox messages format
        const inboxMessages: InboxMessage[] = data.conversations
          .filter((conv: any) => conv.lastMessage) // Only show conversations with messages
          .map((conv: any) => {
            // Check if the last message is from the other participant (not the current user)
            const isFromOtherUser = conv.lastMessage.fromMe === false;
            const shouldShowNotification = isFromOtherUser && conv.unreadCount > 0;
            
            return {
              id: conv.id,
              type: 'chat',
              title: `Bericht van ${conv.participant.name}`,
              message: conv.lastMessage.content,
              is_read: !shouldShowNotification, // Only show as unread if from other user
              created_at: conv.lastMessage.time,
              sender_name: conv.participant.name,
              conversation_id: conv.id
            };
          })
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setMessages(inboxMessages);
        setUnreadCount(inboxMessages.filter(m => !m.is_read).length);
      } else {
        console.log('No conversations found, showing empty inbox');
        setMessages([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to empty messages if API fails
      setMessages([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      // Find the message to get conversation ID
      const message = messages.find(msg => msg.id === messageId);
      if (!message?.conversation_id) return;

      // Mark conversation as read via API
      const response = await fetch('/api/chat/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: message.conversation_id,
          userId: user?.id
        })
      });

      if (response.ok) {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, is_read: true }
              : msg
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      // Still update local state for better UX
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_read: true }
            : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all conversations as read via API
      const unreadMessages = messages.filter(msg => !msg.is_read);
      
      for (const message of unreadMessages) {
        if (message.conversation_id) {
          await fetch('/api/chat/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: message.conversation_id,
              userId: user?.id
            })
          });
        }
      }

      // Update local state
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      // Still update local state for better UX
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'bug_update':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'chat':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500" />;
      default:
        return <EnvelopeIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Nu';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m geleden`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}u geleden`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d geleden`;
    
    return date.toLocaleDateString('nl-NL');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Inbox Icon */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowInbox(!showInbox)}
        className="relative p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
      >
        <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Inbox Dropdown */}
      <AnimatePresence>
        {showInbox && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Inbox</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Alles als gelezen
                  </button>
                )}
                <Link
                  href="/dashboard/inbox"
                  className="text-sm text-[#8BAE5A] hover:text-[#3A4D23] font-medium"
                  onClick={() => setShowInbox(false)}
                >
                  Bekijk alles
                </Link>
              </div>
            </div>

            {/* Messages List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8BAE5A] mx-auto"></div>
                  <p className="text-gray-500 mt-2">Laden...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center">
                  <EnvelopeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Geen berichten</p>
                  <p className="text-sm text-gray-400">Je inbox is leeg</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !message.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        markAsRead(message.id);
                        // Navigate to inbox page and open the conversation
                        if (message.conversation_id) {
                          window.location.href = `/dashboard/inbox?conversation=${message.conversation_id}`;
                        } else {
                          window.location.href = '/dashboard/inbox';
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getMessageIcon(message.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {message.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(message.created_at)}
                            </span>
                          </div>
                          {message.sender_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              Van: {message.sender_name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {message.message}
                          </p>
                          {!message.is_read && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-blue-600 font-medium">Nieuw</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {messages.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {unreadCount} ongelezen van {messages.length} totaal
                  </span>
                  <button
                    onClick={() => setShowInbox(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
