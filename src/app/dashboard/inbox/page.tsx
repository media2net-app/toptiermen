'use client';
import ClientLayout from '@/app/components/ClientLayout';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchAvailableUsers();
      updateOnlineStatus(true);
    }

    // Update online status when component unmounts
    return () => {
      if (user) {
        updateOnlineStatus(false);
      }
    };
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/chat/conversations?userId=${user?.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setConversations(data.conversations);
        
        // Set first conversation as selected by default
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0]);
          fetchMessages(data.conversations[0].id);
        }
      } else {
        console.error('Error fetching conversations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      console.log('Fetching available users...');
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, avatar_url, rank')
        .neq('id', user?.id)
        .order('display_name', { ascending: true });

      if (error) {
        console.error('Error fetching available users:', error);
        return;
      }

      console.log('Available users loaded:', profiles?.length || 0, 'users');
      setAvailableUsers(profiles || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
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
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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
        
        // Update conversation list
        fetchConversations();
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
    if (!user) return;

    console.log('Starting new conversation with user:', userId);
    
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
        // Refresh conversations and select the new one
        await fetchConversations();
        setShowNewChat(false);
        setSelectedUser(null);
      } else {
        console.error('Error creating conversation:', data.error);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
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
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Inbox</h1>
      <p className="text-[#8BAE5A] text-lg mb-8">Beheer je berichten en connecties</p>

      <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-full md:w-1/3 border-r border-[#3A4D23]/40">
            <div className="p-4 border-b border-[#3A4D23]/40 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Gesprekken</h2>
              <button
                onClick={() => setShowNewChat(true)}
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
                    {availableUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-[#8BAE5A] text-lg">Geen gebruikers beschikbaar</p>
                      </div>
                    ) : (
                      availableUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => startNewConversation(user.id)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#3A4D23]/40 cursor-pointer transition-colors"
                        >
                          <img
                            src={user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                            alt={user.display_name || user.full_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h4 className="font-semibold text-white">
                              {user.display_name || user.full_name || 'Onbekende gebruiker'}
                            </h4>
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
                          <span className="text-[#8BAE5A] text-xs">
                            {conversation.lastMessage ? formatTimeAgo(conversation.lastMessage.time) : 'Nieuw'}
                          </span>
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
          <div className="hidden md:flex flex-col flex-1">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[#3A4D23]/40 bg-[#181F17]">
                  <div className="flex items-center gap-3">
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