'use client';
import ClientLayout from '@/app/components/ClientLayout';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import ChatNotificationSettings from '@/components/ChatNotificationSettings';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ChatMessage {
  id: string;
  content: string;
  messageType: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  fromMe: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    rank: string;
  };
  lastMessage: {
    content: string;
    time: string;
    fromMe: boolean;
  } | null;
  unreadCount: number;
  online: boolean;
  lastSeen: string | null;
  updatedAt: string;
}

interface Profile {
  id: string;
  display_name: string;
  full_name: string;
  avatar_url: string;
  rank: string;
}

export default function Inbox() {
  const { user } = useSupabaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set up real-time notifications
  const { isOnline } = useChatNotifications(
    // onNewMessage callback
    (notification) => {
      console.log('📨 New message notification:', notification);
      
      // If the message is for the currently selected conversation, add it to the chat
      if (selectedConversation && notification.conversationId === selectedConversation.id) {
        const newMessage: ChatMessage = {
          id: notification.id,
          content: notification.content,
          messageType: 'text',
          isRead: false,
          readAt: null,
          createdAt: notification.timestamp,
          fromMe: false
        };
        
        setChatMessages(prev => [...prev, newMessage]);
      }
      
      // OPTIMIZED: Update specific conversation instead of refetching all
      setConversations(prev => prev.map(conv => {
        if (conv.id === notification.conversationId) {
          return {
            ...conv,
            lastMessage: {
              content: notification.content,
              time: notification.timestamp,
              fromMe: false
            },
            updatedAt: notification.timestamp,
            unreadCount: conv.id === selectedConversation?.id ? conv.unreadCount : conv.unreadCount + 1
          };
        }
        return conv;
      }));
    },
    // onConversationUpdate callback
    (conversationId) => {
      console.log('💬 Conversation updated:', conversationId);
      // OPTIMIZED: Only refetch if really necessary, use debounced approach
      const timeoutId = setTimeout(() => {
        fetchConversations();
      }, 1000); // Debounce by 1 second
      
      return () => clearTimeout(timeoutId);
    }
  );

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchAvailableUsers();
    }
  }, [user]);

  // Check for conversation parameter in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const conversationId = urlParams.get('conversation');
      
      if (conversationId && conversations.length > 0) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          setSelectedConversation(conversation);
          fetchMessages(conversation.id);
          setShowChat(true);
        }
      }
    }
  }, [conversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/chat/conversations?userId=${user?.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setConversations(data.conversations);
        
        // Set first conversation as selected by default if no conversation is selected (desktop only)
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0]);
          // Only auto-open chat on desktop (md and larger screens)
          if (window.innerWidth >= 768) {
            fetchMessages(data.conversations[0].id);
            setShowChat(true);
          }
        }
        // If we have a selected conversation, make sure it's still in the list
        else if (selectedConversation && data.conversations.length > 0) {
          const currentConversation = data.conversations.find(c => c.id === selectedConversation.id);
          if (currentConversation) {
            setSelectedConversation(currentConversation);
          }
        }
      } else {
        console.error('Error fetching conversations:', data.error);
        // Fallback to empty conversations if API fails
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Fallback to empty conversations if API fails
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      if (!user?.id) return;
      setIsLoadingUsers(true);
      console.log('Fetching available users via API...');
      const res = await fetch(`/api/chat/available-users?excludeUserId=${encodeURIComponent(user.id)}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        console.error('Error fetching available users:', json.error || res.statusText);
        setAvailableUsers([]);
        return;
      }
      console.log('Available users loaded:', json.items?.length || 0, 'users');
      setAvailableUsers(json.items || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
      setAvailableUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}&userId=${user?.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setChatMessages(data.messages);
      } else {
        console.error('Error fetching messages:', data.error);
        // Fallback to empty messages if API fails
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to empty messages if API fails
      setChatMessages([]);
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || !selectedConversation || !user) return;
    
    const messageContent = input.trim();
    setInput('');

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: user.id,
          content: messageContent
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Add new message to chat
        setChatMessages(prev => [...prev, data.message]);
        
        // Update the selected conversation with the new last message
        if (selectedConversation) {
          const updatedConversation = {
            ...selectedConversation,
            lastMessage: {
              content: messageContent,
              time: new Date().toISOString(),
              fromMe: true
            },
            updatedAt: new Date().toISOString()
          };
          
          setSelectedConversation(updatedConversation);
          
          // Update the conversation in the list
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversation.id ? updatedConversation : conv
            )
          );
        }
      } else {
        console.error('Error sending message:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewConversation = async (userId: string) => {
    if (!user || isCreatingConversation) return;

    console.log('Starting new conversation with user:', userId);
    setIsCreatingConversation(true);
    
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1Id: user.id,
          participant2Id: userId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Conversation created successfully:', data);
        // Normalize API response { conversationId } or { conversation: { id } }
        const newConversationId: string | undefined = data?.conversationId || data?.conversation?.id;
        if (!newConversationId) {
          throw new Error('Geen conversatie ID ontvangen van de server');
        }

        // Get the user profile for the new conversation
        const selectedUserProfile = availableUsers.find(u => u.id === userId);
        const userName = selectedUserProfile?.display_name || selectedUserProfile?.full_name || 'Gebruiker';
        
        // Create the new conversation object
        const newConversation: Conversation = {
          id: newConversationId,
          participant: {
            id: userId,
            name: userName,
            avatar: selectedUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            rank: selectedUserProfile?.rank || 'Member'
          },
          lastMessage: null,
          unreadCount: 0,
          online: false,
          lastSeen: null,
          updatedAt: new Date().toISOString()
        };
        
        // Add the new conversation to the list and select it
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setChatMessages([]);
        setShowChat(true);
        
        setShowNewChat(false);
        setSelectedUser(null);
        
        // Show success message
        alert(`Gesprek succesvol gestart met ${userName}!`);
      } else {
        console.error('Error creating conversation:', data.error);
        alert('Fout bij het starten van het gesprek: ' + (data.error || 'Onbekende fout'));
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Fout bij het starten van het gesprek: ' + (error instanceof Error ? error.message : 'Onbekende fout'));
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Zojuist';
    if (diffInHours < 24) return `${diffInHours}u geleden`;
    if (diffInHours < 48) return 'Gisteren';
    return `${Math.floor(diffInHours / 24)} dagen geleden`;
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Inbox</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`}></div>
            <span className="text-sm text-[#8BAE5A]">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowNotificationSettings(!showNotificationSettings)}
          className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-lg text-sm font-semibold hover:bg-[#4A5D2E] transition-colors"
        >
          ⚙️ Instellingen
        </button>
      </div>
      <p className="text-[#8BAE5A] text-lg mb-8">Beheer je berichten en connecties</p>

      {/* Notification Settings */}
      {showNotificationSettings && (
        <div className="mb-6">
          <ChatNotificationSettings />
        </div>
      )}

      <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className={`${showChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-[#3A4D23]/40`}>
            <div className="p-4 border-b border-[#3A4D23]/40 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Gesprekken</h2>
              <button
                onClick={() => {
                  setShowNewChat(true);
                  // Refresh available users when opening new chat
                  fetchAvailableUsers();
                }}
                className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded-lg text-sm font-semibold hover:bg-[#A6C97B] transition-colors"
              >
                + Nieuw
              </button>
            </div>
            
            {/* New Chat Modal */}
            {showNewChat && (
              <div className="fixed inset-0 bg-[#232D1A]/95 z-50 flex items-center justify-center">
                <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
                  <div className="p-4 border-b border-[#3A4D23]/40 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Nieuw gesprek</h3>
                    <button
                      onClick={() => {
                        setShowNewChat(false);
                        setSelectedUser(null);
                      }}
                      className="text-[#8BAE5A] hover:text-white text-xl"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 max-h-96">
                    {isLoadingUsers ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                        <p className="text-[#8BAE5A] text-lg">Ledenlijst laden...</p>
                      </div>
                    ) : availableUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-[#8BAE5A] text-lg">Geen leden gevonden</p>
                        <p className="text-gray-400 text-sm mt-2">Er zijn momenteel geen andere leden beschikbaar</p>
                      </div>
                    ) : (
                      availableUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => startNewConversation(user.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-[#3A4D23]/40 cursor-pointer transition-colors ${
                            isCreatingConversation ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <img
                            src={user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                            alt={user.display_name || user.full_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">
                              {user.display_name || user.full_name || 'Onbekende gebruiker'}
                            </h4>
                            {isCreatingConversation && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                                <span className="text-sm text-[#8BAE5A]">Gesprek starten...</span>
                              </div>
                            )}
                            <p className="text-[#8BAE5A] text-sm">{user.rank || 'Member'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[#8BAE5A] text-lg">Nog geen gesprekken</p>
                  <p className="text-[#8BAE5A] text-sm mt-2">Start een nieuw gesprek om te beginnen</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      fetchMessages(conversation.id);
                      setShowChat(true);
                    }}
                    className={`p-4 border-b border-[#3A4D23]/40 cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-[#3A4D23]/40' : 'hover:bg-[#2A341F]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={conversation.participant.avatar}
                          alt={conversation.participant.name}
                          className="w-12 h-12 rounded-full"
                        />
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#232D1A]"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white truncate">{conversation.participant.name}</h3>
                          <div className="flex items-center gap-2">
                            {conversation.unreadCount > 0 && (
                              <div className="bg-[#8BAE5A] text-[#181F17] text-xs px-2 py-1 rounded-full font-bold min-w-[20px] text-center">
                                {conversation.unreadCount}
                              </div>
                            )}
                            <span className="text-[#8BAE5A] text-xs">
                              {conversation.lastMessage ? formatTimeAgo(conversation.lastMessage.time) : 'Nieuw'}
                            </span>
                          </div>
                        </div>
                        <p className="text-[#8BAE5A] text-sm truncate">
                          {conversation.lastMessage ? conversation.lastMessage.content : 'Start een gesprek...'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[#8BAE5A] text-xs">{conversation.unreadCount} ongelezen</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${showChat ? 'flex' : 'hidden'} md:flex flex-col flex-1`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[#3A4D23]/40 bg-[#181F17]">
                  <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setShowChat(false)}
                      className="md:hidden p-2 hover:bg-[#3A4D23]/40 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="relative">
                      <img
                        src={selectedConversation.participant.avatar}
                        alt={selectedConversation.participant.name}
                        className="w-10 h-10 rounded-full"
                      />
                      {selectedConversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#181F17]"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedConversation.participant.name}</h3>
                      <p className="text-[#8BAE5A] text-sm">
                        {selectedConversation.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                          msg.fromMe
                            ? 'bg-[#8BAE5A] text-[#181F17]'
                            : 'bg-[#3A4D23] text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTimeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-[#3A4D23]/40 bg-[#181F17]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type je bericht..."
                      className="flex-1 bg-[#232D1A] text-white px-4 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verstuur
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[#8BAE5A] text-lg">Selecteer een gesprek om te beginnen</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Chat Overlay */}
        {showChat && selectedConversation && (
          <div className="md:hidden fixed inset-0 bg-[#232D1A] z-50">
            <div className="flex flex-col h-full">
              {/* Mobile Chat Header */}
              <div className="p-4 border-b border-[#3A4D23]/40 bg-[#181F17] flex items-center gap-3">
                <button
                  onClick={() => setShowChat(false)}
                  className="text-[#8BAE5A] hover:text-[#FFD700]"
                >
                  ← Terug
                </button>
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={selectedConversation.participant.avatar}
                    alt={selectedConversation.participant.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{selectedConversation.participant.name}</h3>
                    <p className="text-[#8BAE5A] text-sm">
                      {selectedConversation.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.fromMe
                          ? 'bg-[#8BAE5A] text-[#181F17]'
                          : 'bg-[#3A4D23] text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Mobile Chat Input */}
              <div className="p-4 border-t border-[#3A4D23]/40 bg-[#181F17]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type je bericht..."
                    className="flex-1 bg-[#232D1A] text-white px-4 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verstuur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 