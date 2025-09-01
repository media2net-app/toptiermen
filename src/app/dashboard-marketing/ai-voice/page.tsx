"use client";
import { useState, useRef, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { MicrophoneIcon, SpeakerWaveIcon, StopIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface VoiceMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export default function AIVoicePage() {
  const { user } = useSupabaseAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'nl-NL',
    voice: 'female',
    speed: 1.0,
    pitch: 1.0
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceSettings.language;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (currentTranscript.trim()) {
          handleUserMessage(currentTranscript.trim());
          setCurrentTranscript('');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Spraakherkenning fout: ' + event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentTranscript, voiceSettings.language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setCurrentTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleUserMessage = async (text: string) => {
    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Simulate AI processing (replace with actual AI API call in the future)
      const aiResponse = await processAIResponse(text);
      
      const aiMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the AI response
      await speakText(aiResponse);

    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Fout bij verwerken van je vraag');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAIResponse = async (userText: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simple response logic (replace with actual AI in the future)
    const responses = {
      marketing: "Voor marketing kunnen we verschillende strategieën bespreken. Waar wil je specifiek hulp bij?",
      campagne: "Laten we een effectieve campagne opzetten. Wat is je doelgroep en budget?",
      analytics: "Ik kan je helpen met het analyseren van je marketing data. Welke metrics zijn het belangrijkst voor jou?",
      content: "Content marketing is cruciaal. Wil je hulp bij het creëren van een content strategie?",
      social: "Social media marketing heeft veel potentieel. Op welke platforms ben je actief?",
      default: "Dat is een interessante vraag! Ik ben hier om je te helpen met marketing strategieën en analyses. Kun je je vraag wat specifieker maken?"
    };

    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('marketing')) return responses.marketing;
    if (lowerText.includes('campagne')) return responses.campagne;
    if (lowerText.includes('analytics') || lowerText.includes('analyse')) return responses.analytics;
    if (lowerText.includes('content')) return responses.content;
    if (lowerText.includes('social')) return responses.social;
    
    return responses.default;
  };

  const speakText = async (text: string) => {
    if (!synthRef.current) return;

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceSettings.language;
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;

      // Get available voices and select preferred one
      const voices = synthRef.current!.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('nl') && 
        (voiceSettings.voice === 'female' ? voice.name.includes('female') || voice.name.includes('vrouw') : voice.name.includes('male') || voice.name.includes('man'))
      ) || voices.find(voice => voice.lang.includes('nl')) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      synthRef.current!.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentTranscript('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user || user.role?.toLowerCase() !== 'admin') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Toegang Geweigerd</h1>
        <p className="text-gray-600">Je hebt geen toegang tot deze pagina.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Voice Assistant</h1>
          <p className="text-gray-600">Praat met je AI marketing assistent</p>
        </div>

        {/* Voice Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Stem Instellingen</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taal</label>
              <select
                value={voiceSettings.language}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="nl-NL">Nederlands</option>
                <option value="en-US">Engels (US)</option>
                <option value="en-GB">Engels (UK)</option>
                <option value="de-DE">Duits</option>
                <option value="fr-FR">Frans</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stem</label>
              <select
                value={voiceSettings.voice}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="female">Vrouwelijk</option>
                <option value="male">Mannelijk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Snelheid</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.speed}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{voiceSettings.speed}x</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Toonhoogte</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{voiceSettings.pitch}x</span>
            </div>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <SpeakerWaveIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Start een gesprek door op de microfoon te klikken</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">AI denkt na...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Transcript */}
        {(isListening || currentTranscript) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              {isListening ? 'Luisteren...' : 'Opgenomen tekst:'}
            </h3>
            <p className="text-blue-700">{currentTranscript || 'Zeg iets...'}</p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Microphone Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse'
                  : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <StopIcon className="w-8 h-8" />
              ) : (
                <MicrophoneIcon className="w-8 h-8" />
              )}
            </button>

            {/* Speaker Button */}
            <button
              onClick={isSpeaking ? stopSpeaking : () => {}}
              disabled={!isSpeaking}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSpeaking
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500'
              } disabled:cursor-not-allowed`}
            >
              <SpeakerWaveIcon className="w-6 h-6" />
            </button>

            {/* Clear Button */}
            <button
              onClick={clearConversation}
              disabled={isProcessing || isListening || isSpeaking}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Wissen
            </button>
          </div>

          <div className="text-center mt-4 text-sm text-gray-600">
            {isListening && 'Luisteren naar je spraak...'}
            {isProcessing && 'AI verwerkt je vraag...'}
            {isSpeaking && 'AI spreekt...'}
            {!isListening && !isProcessing && !isSpeaking && 'Klik op de microfoon om te beginnen'}
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Functionaliteiten</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-purple-700 mb-2">Huidige Features:</h3>
              <ul className="space-y-1">
                <li>• Spraakherkenning (Nederlands/Engels)</li>
                <li>• Text-to-Speech antwoorden</li>
                <li>• Real-time transcriptie</li>
                <li>• Conversatie geschiedenis</li>
                <li>• Aanpasbare stem instellingen</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-700 mb-2">Toekomstige Features:</h3>
              <ul className="space-y-1">
                <li>• Integratie met ChatGPT/Claude</li>
                <li>• Marketing data analyse</li>
                <li>• Campagne optimalisatie tips</li>
                <li>• Voice commands voor dashboard</li>
                <li>• Multilingual support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 