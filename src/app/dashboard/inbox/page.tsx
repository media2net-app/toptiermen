'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

const messages = [
  { id: 1, avatar: '/profielfoto.png', name: 'Coach Mark', text: 'Goed bezig met je missies deze week!', time: '2 uur geleden', unread: true },
  { id: 2, avatar: '/profielfoto.png', name: 'Top Tier Community', text: 'Welkom bij de Brotherhood!', time: 'vandaag', unread: true },
  { id: 3, avatar: '/profielfoto.png', name: 'Mentor Lisa', text: 'Je voortgang ziet er sterk uit!', time: '1 dag geleden', unread: false },
  { id: 4, avatar: '/profielfoto.png', name: 'Challenge Team', text: 'Nieuwe challenge: 30 dagen discipline', time: '2 dagen geleden', unread: false },
  { id: 5, avatar: '/profielfoto.png', name: 'Coach Mark', text: 'Vergeet je check-in niet vanavond!', time: '2 dagen geleden', unread: true },
  { id: 6, avatar: '/profielfoto.png', name: 'Top Tier Men', text: 'Je abonnement is verlengd', time: '3 dagen geleden', unread: true },
  { id: 7, avatar: '/profielfoto.png', name: 'Mentor Lisa', text: 'Plan een 1-op-1 call in voor extra support', time: '3 dagen geleden', unread: false },
];

type ChatMessage = { fromMe: boolean; text: string; time: string };

type DummyChats = {
  [key: number]: ChatMessage[];
};

const dummyChats: DummyChats = {
  1: [
    { fromMe: false, text: 'Goed bezig met je missies deze week!', time: '2 uur geleden' },
    { fromMe: true, text: 'Dankjewel coach!', time: '1 uur geleden' },
  ],
  2: [
    { fromMe: false, text: 'Welkom bij de Brotherhood!', time: 'vandaag' },
    { fromMe: true, text: 'Super blij om erbij te zijn!', time: 'vandaag' },
  ],
  3: [
    { fromMe: false, text: 'Je voortgang ziet er sterk uit!', time: '1 dag geleden' },
    { fromMe: true, text: 'Thanks Lisa!', time: '1 dag geleden' },
  ],
  4: [
    { fromMe: false, text: 'Nieuwe challenge: 30 dagen discipline', time: '2 dagen geleden' },
    { fromMe: true, text: 'Ik doe mee!', time: '2 dagen geleden' },
  ],
  5: [
    { fromMe: false, text: 'Vergeet je check-in niet vanavond!', time: '2 dagen geleden' },
    { fromMe: true, text: 'Komt goed!', time: '2 dagen geleden' },
  ],
  6: [
    { fromMe: false, text: 'Je abonnement is verlengd', time: '3 dagen geleden' },
    { fromMe: true, text: 'Top, bedankt!', time: '3 dagen geleden' },
  ],
  7: [
    { fromMe: false, text: 'Plan een 1-op-1 call in voor extra support', time: '3 dagen geleden' },
    { fromMe: true, text: 'Goed idee, ik plan het in!', time: '3 dagen geleden' },
  ],
};

type DummyResponses = {
  [key: number]: string[];
};

const dummyResponses: DummyResponses = {
  1: [
    "Goed bezig! Blijf zo doorgaan.",
    "Perfect, dat is precies wat we willen zien.",
    "Top! Zullen we volgende week evalueren?",
    "Mooi om te zien dat je vooruitgang boekt.",
    "Dat is de juiste mindset!",
  ],
  2: [
    "Welkom in de community!",
    "Geweldig om je hier te hebben.",
    "Samen maken we elkaar sterker.",
    "Je past perfect bij de Brotherhood.",
    "Laten we samen groeien!",
  ],
  3: [
    "Je bent op de goede weg!",
    "Blijf deze energie vasthouden.",
    "Ik zie veel potentie in je.",
    "Perfect, zo moet het!",
    "Je maakt indrukwekkende stappen.",
  ],
  4: [
    "Geweldig dat je meedoet!",
    "Deze challenge gaat je sterker maken.",
    "30 dagen discipline, je kunt het!",
    "Perfecte keuze voor je groei.",
    "Laten we deze challenge samen aangaan.",
  ],
  5: [
    "Top, ik zie je vanavond!",
    "Perfect, dan kunnen we je voortgang bespreken.",
    "Goed dat je er bent, tot vanavond!",
    "Ik kijk ernaar uit om je te zien.",
    "Tot de check-in vanavond!",
  ],
  6: [
    "Graag gedaan! Blijf zo doorgaan.",
    "Perfect, je bent goed op weg.",
    "Mooi om te zien dat je tevreden bent.",
    "We gaan samen vooruit!",
    "Top, tot je volgende mijlpaal!",
  ],
  7: [
    "Perfect, ik zie je dan!",
    "Goed plan, tot de call!",
    "Ik kijk ernaar uit om je te spreken.",
    "Top, dan kunnen we dieper ingaan op je doelen.",
    "Perfect, tot dan!",
  ],
};

export default function Inbox() {
  const [selected, setSelected] = useState<number>(messages[0].id);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(dummyChats[selected] || []);
  const [input, setInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Update chat when selected changes
  useEffect(() => {
    setChatMessages(dummyChats[selected] ? [...dummyChats[selected]] : []);
    setShowChat(true);
  }, [selected]);

  const getRandomResponse = (id: number) => {
    const responses = dummyResponses[id] || dummyResponses[1];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = () => {
    if (input.trim() === '') return;
    
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
    }, 1500 + Math.random() * 1000); // Random delay between 1.5 and 2.5 seconds
  };

  const selectedMsg = messages.find(m => m.id === selected);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-8">Inbox</h1>
      
      {/* Mobile: Show either conversations or chat */}
      <div className="lg:hidden">
        {!showChat ? (
          <div className="flex flex-col gap-4">
            {messages.map(m => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-[#181F17]/90 border border-[#8BAE5A]/30 shadow-xl text-left transition-all duration-150 ${selected === m.id ? 'ring-2 ring-[#8BAE5A] scale-[1.02]' : ''}`}
              >
                <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{m.name}</div>
                  <div className="text-[#8BAE5A] text-sm truncate">{m.text}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[#8BAE5A]">{m.time}</span>
                  {!m.unread && <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] mt-1" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-12rem)]">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowChat(false)}
                className="text-[#8BAE5A] hover:text-[#A3C47C] transition-colors"
              >
                ← Terug
              </button>
              {selectedMsg && (
                <>
                  <img src={selectedMsg.avatar} alt={selectedMsg.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-white">{selectedMsg.name}</div>
                    <div className="text-xs text-[#8BAE5A]">Laatste bericht: {selectedMsg.time}</div>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4 pr-2">
              {chatMessages.map((msg: ChatMessage, idx: number) => (
                <div
                  key={idx}
                  className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.fromMe ? 'bg-[#8BAE5A] text-[#181F17] rounded-br-none' : 'bg-[#232D1B] text-white rounded-bl-none'}`}>
                    {msg.text}
                    <span className="block text-[10px] text-right text-[#A3C47C] mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#232D1B] text-white px-4 py-2 rounded-2xl rounded-bl-none text-sm">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-100">●</span>
                      <span className="animate-bounce delay-200">●</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <input
                type="text"
                className="flex-1 rounded-xl bg-[#232D1B] text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder={`Stuur een bericht naar ${selectedMsg?.name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              />
              <button
                onClick={handleSend}
                className="bg-[#8BAE5A] hover:bg-[#A3C47C] text-[#181F17] rounded-xl p-2 transition-colors"
                aria-label="Stuur"
              >
                <PaperAirplaneIcon className="w-6 h-6 rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Show both conversations and chat side by side */}
      <div className="hidden lg:flex flex-row gap-8 min-h-[70vh]">
        <div className="w-1/3 flex flex-col">
          <div className="flex flex-col gap-4">
            {messages.map(m => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`flex items-center gap-4 p-5 rounded-2xl bg-[#181F17]/90 border border-[#8BAE5A]/30 shadow-xl text-left transition-all duration-150 ${selected === m.id ? 'ring-2 ring-[#8BAE5A] scale-[1.03]' : ''}`}
              >
                <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{m.name}</div>
                  <div className="text-[#8BAE5A] text-sm truncate">{m.text}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[#8BAE5A]">{m.time}</span>
                  {!m.unread && <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A] mt-1" />}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="w-2/3 flex flex-col bg-[#181F17]/80 border border-[#8BAE5A]/30 rounded-2xl shadow-xl p-6">
          {selectedMsg && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <img src={selectedMsg.avatar} alt={selectedMsg.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-white">{selectedMsg.name}</div>
                  <div className="text-xs text-[#8BAE5A]">Laatste bericht: {selectedMsg.time}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4 pr-2">
                {chatMessages.map((msg: ChatMessage, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.fromMe ? 'bg-[#8BAE5A] text-[#181F17] rounded-br-none' : 'bg-[#232D1B] text-white rounded-bl-none'}`}>
                      {msg.text}
                      <span className="block text-[10px] text-right text-[#A3C47C] mt-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#232D1B] text-white px-4 py-2 rounded-2xl rounded-bl-none text-sm">
                      <div className="flex gap-1">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce delay-100">●</span>
                        <span className="animate-bounce delay-200">●</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <input
                  type="text"
                  className="flex-1 rounded-xl bg-[#232D1B] text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder={`Stuur een bericht naar ${selectedMsg.name}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                <button
                  onClick={handleSend}
                  className="bg-[#8BAE5A] hover:bg-[#A3C47C] text-[#181F17] rounded-xl p-2 transition-colors"
                  aria-label="Stuur"
                >
                  <PaperAirplaneIcon className="w-6 h-6 rotate-90" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 