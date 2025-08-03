'use client';
import ClientLayout from '@/components/ClientLayout';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ChatMessage {
  fromMe: boolean;
  text: string;
  time: string;
}

interface Message {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Profile {
  id: string;
  display_name: string;
  full_name: string;
  avatar_url: string;
  rank: string;
  last_seen: string;
}

export default function Inbox() {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      // Fetch recent profiles as potential chat contacts
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, avatar_url, rank, updated_at')
        .neq('id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      // Convert profiles to messages format
      const formattedMessages: Message[] = profiles?.map((profile, index) => ({
        id: index + 1,
        name: profile.display_name || profile.full_name || 'Onbekende gebruiker',
        avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        lastMessage: getRandomLastMessage(profile.rank || 'Member'),
        time: formatTimeAgo(profile.updated_at),
        unread: Math.floor(Math.random() * 3), // Random unread count
        online: Math.random() > 0.7 // 30% chance of being online
      })) || [];

      setMessages(formattedMessages);
      
      // Set first message as selected by default
      if (formattedMessages.length > 0) {
        setSelected(formattedMessages[0].id);
        setShowChat(true);
      }

    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomLastMessage = (rank: string): string => {
    const messages = {
      'Founder': [
        'Welkom bij de Brotherhood!',
        'Hoe gaat het met je voortgang?',
        'Heb je de nieuwe module al bekeken?'
      ],
      'Alpha': [
        'Goed bezig met je missies deze week!',
        'Klaar voor de volgende challenge?',
        'Je voortgang ziet er sterk uit!'
      ],
      'Elite': [
        'Nieuwe challenge: 30 dagen discipline',
        'Vergeet je check-in niet vanavond!',
        'Plan een 1-op-1 call in voor extra support'
      ],
      'Veteran': [
        'Hoe gaat het met je doelen?',
        'Klaar voor de groepstraining?',
        'Je abonnement is verlengd'
      ],
      'Warrior': [
        'Welkom bij de community!',
        'Hoe voel je je na je eerste week?',
        'Heb je vragen over de app?'
      ],
      'Member': [
        'Welkom bij Top Tier Men!',
        'Hoe gaat het met je reis?',
        'Heb je al je eerste missie voltooid?'
      ]
    };

    const rankMessages = messages[rank as keyof typeof messages] || messages['Member'];
    return rankMessages[Math.floor(Math.random() * rankMessages.length)];
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

  const getRandomResponse = (selectedId: number) => {
    const responses = [
      'Goed bezig! Blijf consistent.',
      'Dat klinkt als een geweldige voortgang!',
      'Houd vol, je bent op de goede weg.',
      'Consistentie is de sleutel tot succes.',
      'Ik ben trots op je vooruitgang!',
      'Blijf gefocust op je doelen.',
      'Elke dag is een nieuwe kans om te groeien.',
      'Je mindset is aan het veranderen, dat zie ik!',
      'Geweldig werk! Blijf de druk opvoeren.',
      'Succes is geen toeval, het is keuze na keuze.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = () => {
    if (input.trim() === '' || !selected) return;
    
    // Add user message
    setChatMessages(prev => [
      ...prev,
      { fromMe: true, text: input, time: 'nu' },
    ]);
    setInput('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate response after delay
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [
        ...prev,
        { fromMe: false, text: getRandomResponse(selected), time: 'nu' },
      ]);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedMsg = messages.find(m => m.id === selected);

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
          {/* Message List */}
          <div className="w-full md:w-1/3 border-r border-[#3A4D23]/40">
            <div className="p-4 border-b border-[#3A4D23]/40">
              <h2 className="text-xl font-bold text-white">Berichten</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelected(message.id);
                    setShowChat(true);
                    setChatMessages([]); // Reset chat for new conversation
                  }}
                  className={`p-4 border-b border-[#3A4D23]/40 cursor-pointer transition-colors ${
                    selected === message.id ? 'bg-[#3A4D23]/40' : 'hover:bg-[#2A341F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={message.avatar}
                        alt={message.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {message.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#232D1A]"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate">{message.name}</h3>
                        <span className="text-[#8BAE5A] text-xs">{message.time}</span>
                      </div>
                      <p className="text-[#8BAE5A] text-sm truncate">{message.lastMessage}</p>
                      {message.unread > 0 && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[#8BAE5A] text-xs">{message.unread} ongelezen</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-col flex-1">
            {selectedMsg ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[#3A4D23]/40 bg-[#181F17]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={selectedMsg.avatar}
                        alt={selectedMsg.name}
                        className="w-10 h-10 rounded-full"
                      />
                      {selectedMsg.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#181F17]"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedMsg.name}</h3>
                      <p className="text-[#8BAE5A] text-sm">
                        {selectedMsg.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                          msg.fromMe
                            ? 'bg-[#8BAE5A] text-[#181F17]'
                            : 'bg-[#3A4D23] text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#3A4D23] text-white px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  <p className="text-[#8BAE5A] text-lg">Selecteer een bericht om te beginnen</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Chat Overlay */}
        {showChat && selectedMsg && (
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
                    src={selectedMsg.avatar}
                    alt={selectedMsg.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{selectedMsg.name}</h3>
                    <p className="text-[#8BAE5A] text-sm">
                      {selectedMsg.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.fromMe
                          ? 'bg-[#8BAE5A] text-[#181F17]'
                          : 'bg-[#3A4D23] text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#3A4D23] text-white px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#8BAE5A] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#8BAE5A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#8BAE5A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
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