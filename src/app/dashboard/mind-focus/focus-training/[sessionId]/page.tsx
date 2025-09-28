"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  CpuChipIcon,
  FireIcon,
  BookOpenIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MusicalNoteIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface FocusSession {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'concentration' | 'mindfulness' | 'breathing' | 'visualization';
  steps: string[];
  tips: string[];
}

const focusSessions: FocusSession[] = [
  {
    id: 'basic-concentration',
    title: 'Basis Concentratie Training',
    description: 'Leer je aandacht te focussen op één punt. Perfect voor beginners.',
    duration: 5,
    difficulty: 'beginner',
    category: 'concentration',
    steps: [
      'Ga comfortabel zitten met je rug recht',
      'Kies een focuspunt (kaars, steen, of ademhaling)',
      'Sluit je ogen en richt je aandacht op je gekozen focuspunt',
      'Wanneer je gedachten afdwalen, merk dit op zonder oordeel',
      'Breng je aandacht terug naar je focuspunt',
      'Herhaal dit proces gedurende de sessie'
    ],
    tips: [
      'Start met korte sessies en bouw langzaam op',
      'Consistentie is belangrijker dan perfectie',
      'Gebruik een timer om je sessie te timen',
      'Track je progress om motivatie te behouden'
    ]
  },
  {
    id: 'breathing-focus',
    title: 'Ademhaling Focus',
    duration: 10,
    description: 'Gebruik je ademhaling als anker voor je aandacht.',
    difficulty: 'beginner',
    category: 'breathing',
    steps: [
      'Ga comfortabel zitten met je rug recht',
      'Sluit je ogen en ontspan je schouders',
      'Adem 4 tellen in door je neus',
      'Houd je adem 4 tellen vast',
      'Adem 4 tellen uit door je mond',
      'Herhaal dit patroon gedurende de sessie'
    ],
    tips: [
      'Zorg voor een rustige omgeving zonder afleidingen',
      'Zet je telefoon op stil of in een andere kamer',
      'Als je gedachten afdwalen, breng je aandacht terug naar je ademhaling',
      'Wees geduldig met jezelf - focus trainen kost tijd'
    ]
  },
  {
    id: 'mindful-awareness',
    title: 'Mindful Bewustzijn',
    duration: 15,
    description: 'Ontwikkel bewustzijn van je gedachten zonder erin mee te gaan.',
    difficulty: 'intermediate',
    category: 'mindfulness',
    steps: [
      'Neem een comfortabele zithouding aan',
      'Sluit je ogen en begin met 3 diepe ademhalingen',
      'Observeer je gedachten zonder ze te beoordelen',
      'Let op lichamelijke sensaties en emoties',
      'Wanneer je afgeleid raakt, keer terug naar je ademhaling',
      'Eindig met 3 diepe ademhalingen en open langzaam je ogen'
    ],
    tips: [
      'Gedachten zijn normaal - probeer ze niet te stoppen',
      'Observeer je gedachten als wolken die voorbij drijven',
      'Wees vriendelijk voor jezelf als je afgeleid raakt',
      'Oefen dagelijks voor de beste resultaten'
    ]
  },
  {
    id: 'concentration-focus',
    title: 'Concentratie Focus',
    description: 'Train je aandacht om langer gefocust te blijven',
    duration: 15,
    difficulty: 'advanced',
    category: 'concentration',
    steps: [
      'Kies een focuspunt (kaars, steen, of ademhaling)',
      'Ga comfortabel zitten en sluit je ogen',
      'Richt je volledige aandacht op je gekozen focuspunt',
      'Wanneer je gedachten afdwalen, merk dit op zonder oordeel',
      'Breng je aandacht terug naar je focuspunt',
      'Blijf dit proces herhalen gedurende de sessie'
    ],
    tips: [
      'Start met korte sessies en bouw langzaam op',
      'Consistentie is belangrijker dan perfectie',
      'Gebruik een timer om je sessie te timen',
      'Track je progress om motivatie te behouden'
    ]
  },
  {
    id: 'visual-focus',
    title: 'Visuele Focus Training',
    duration: 12,
    description: 'Train je ogen en geest om gefocust te blijven op visuele objecten.',
    difficulty: 'intermediate',
    category: 'visualization',
    steps: [
      'Kies een visueel object (kaars, steen, of foto)',
      'Ga comfortabel zitten en plaats het object op ooghoogte',
      'Kijk naar het object zonder je ogen te bewegen',
      'Observeer alle details zonder te oordelen',
      'Wanneer je gedachten afdwalen, keer terug naar het object',
      'Blijf gefocust op het object gedurende de sessie'
    ],
    tips: [
      'Kies een object dat je interessant vindt',
      'Zorg voor goede verlichting',
      'Blijf ontspannen en adem normaal',
      'Oefen dagelijks voor betere resultaten'
    ]
  },
  {
    id: 'advanced-concentration',
    title: 'Geavanceerde Concentratie',
    duration: 20,
    description: 'Intensieve concentratie training voor gevorderden.',
    difficulty: 'advanced',
    category: 'concentration',
    steps: [
      'Kies een complexe focuspunt (mandala, complexe vorm)',
      'Ga comfortabel zitten en sluit je ogen',
      'Visualiseer je focuspunt in je geest',
      'Houd je aandacht vast op alle details',
      'Wanneer je gedachten afdwalen, merk dit op zonder oordeel',
      'Breng je aandacht terug naar je focuspunt',
      'Blijf dit proces herhalen gedurende de sessie'
    ],
    tips: [
      'Deze sessie is voor gevorderden - start met kortere sessies',
      'Wees geduldig - geavanceerde concentratie kost tijd',
      'Oefen regelmatig voor de beste resultaten',
      'Track je progress en vier je successen'
    ]
  },
  {
    id: 'body-scan-focus',
    title: 'Body Scan Focus',
    duration: 18,
    description: 'Systematisch door je lichaam gaan om focus en bewustzijn te ontwikkelen.',
    difficulty: 'intermediate',
    category: 'mindfulness',
    steps: [
      'Ga comfortabel liggen of zitten',
      'Sluit je ogen en begin met 3 diepe ademhalingen',
      'Start bij je tenen en scan je lichaam omhoog',
      'Let op elke sensatie zonder te oordelen',
      'Ga langzaam door elke lichaamsdeel',
      'Eindig bij je hoofd en open langzaam je ogen'
    ],
    tips: [
      'Ga langzaam en systematisch te werk',
      'Wees geduldig met jezelf',
      'Oefen regelmatig voor betere resultaten',
      'Track je progress en vier je successen'
    ]
  }
];

export default function FocusSessionPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<FocusSession | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [stepTimer, setStepTimer] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);


  // Meditatie audio tracks
  const [meditationTracks, setMeditationTracks] = useState<Array<{ id: string; name: string; url: string | undefined; description?: string }>>([
    { id: 'nature-sounds', name: 'Natuurgeluiden', url: undefined, description: 'Rustige natuurgeluiden voor diepe ontspanning' },
    { id: 'ambient-pad', name: 'Ambient Pad', url: undefined, description: 'Zachte ambient muziek voor focus' },
    { id: 'binaural-beats', name: 'Binaural Beats', url: undefined, description: 'Binaural beats voor diepe meditatie' },
    { id: 'singing-bowls', name: 'Zingende Schalen', url: undefined, description: 'Tibetaanse zingende schalen voor meditatie' }
  ]);

  // Laad beschikbare meditatie audio uit de database (supabase) via API
  useEffect(() => {
    const loadMeditationLibrary = async () => {
      try {
        const res = await fetch('/api/mind-focus/meditation-library?type=all');
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.meditations)) {
          // Map naar track shape; gebruik title en audio_url
          const tracksFromDb: Array<{ id: string; name: string; url: string | undefined; description?: string }> = json.meditations
            .filter((m: any) => !!m.audio_url)
            .map((m: any, idx: number) => ({
              id: m.id?.toString() || `db-${idx}`,
              name: m.title || 'Meditatie Audio',
              url: (m.audio_url as string) || undefined,
              description: m.description || undefined
            }));
          if (tracksFromDb.length > 0) {
            // Prefer 'Meditation & Gentle Nature' if present
            const preferredName = 'Meditation & Gentle Nature';
            const preferredIdx = tracksFromDb.findIndex((t) => t.name === preferredName);
            let ordered = tracksFromDb.slice();
            if (preferredIdx > 0) {
              const [pref] = ordered.splice(preferredIdx, 1);
              ordered = [pref, ...ordered];
            }
            setMeditationTracks(ordered);
            // Select preferred if available, else first
            setCurrentTrack(preferredIdx >= 0 ? 0 : 0);
          } else {
            // Fallback naar lokale bestanden in public/sounds/
            const localTracks: Array<{ id: string; name: string; url: string | undefined; description?: string }> = [
              { id: 'meditation-and-gentle-nature-184572', name: 'Meditation & Gentle Nature', url: '/sounds/meditation-and-gentle-nature-184572.mp3' },
              { id: 'ambient-background-339939', name: 'Ambient Background', url: '/sounds/ambient-background-339939.mp3' },
              { id: 'meditation-music-without-nature-sound-256142', name: 'Meditation Music (No Nature)', url: '/sounds/meditation-music-without-nature-sound-256142.mp3' },
              { id: 'meditation-yoga-relaxing-music-378307', name: 'Meditation Yoga Relaxing', url: '/sounds/meditation-yoga-relaxing-music-378307.mp3' },
              { id: 'meditation-yoga-relaxing-music-380330', name: 'Meditation Yoga Relaxing 2', url: '/sounds/meditation-yoga-relaxing-music-380330.mp3' },
              { id: 'nature-dreamscape-350256', name: 'Nature Dreamscape', url: '/sounds/nature-dreamscape-350256.mp3' },
              { id: 'nature-investigation-255161', name: 'Nature Investigation', url: '/sounds/nature-investigation-255161.mp3' }
            ];
            setMeditationTracks(localTracks);
            // Preferred is first in fallback list
            setCurrentTrack(0);
          }
        }
      } catch (e) {
        console.log('Kon meditatie bibliotheek niet laden, gebruik standaard tracks (stilte).', e);
        // Fallback als API niet bereikbaar is
        const localTracks: Array<{ id: string; name: string; url: string | undefined; description?: string }> = [
          { id: 'meditation-and-gentle-nature-184572', name: 'Meditation & Gentle Nature', url: '/sounds/meditation-and-gentle-nature-184572.mp3' },
          { id: 'ambient-background-339939', name: 'Ambient Background', url: '/sounds/ambient-background-339939.mp3' },
          { id: 'meditation-music-without-nature-sound-256142', name: 'Meditation Music (No Nature)', url: '/sounds/meditation-music-without-nature-sound-256142.mp3' },
          { id: 'meditation-yoga-relaxing-music-378307', name: 'Meditation Yoga Relaxing', url: '/sounds/meditation-yoga-relaxing-music-378307.mp3' },
          { id: 'meditation-yoga-relaxing-music-380330', name: 'Meditation Yoga Relaxing 2', url: '/sounds/meditation-yoga-relaxing-music-380330.mp3' },
          { id: 'nature-dreamscape-350256', name: 'Nature Dreamscape', url: '/sounds/nature-dreamscape-350256.mp3' },
          { id: 'nature-investigation-255161', name: 'Nature Investigation', url: '/sounds/nature-investigation-255161.mp3' }
        ];
        setMeditationTracks(localTracks);
        setCurrentTrack(0);
      }
    };
    loadMeditationLibrary();
  }, []);

  useEffect(() => {
    const foundSession = focusSessions.find(s => s.id === params.sessionId);
    if (foundSession) {
      setSession(foundSession);
      setTimeRemaining(foundSession.duration * 60);
      // Initialize step timer
      const stepDuration = (foundSession.duration * 60) / foundSession.steps.length;
      setStepTimer(stepDuration);
      console.log('Step timer initialized:', stepDuration, 'seconds');
      // Start audio automatically when session is loaded
      if (audioEnabled && audioRef.current) {
        audioRef.current.loop = true; // loop
        // Stel bron in op huidige track (indien aanwezig)
        const src = meditationTracks[currentTrack]?.url || '';
        if (src) {
          audioRef.current.src = src;
          // set volume immediately before play
          audioRef.current.volume = volume;
          audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(error => {
            console.log('Audio play failed, trying fallback:', error);
            playFallbackTone();
          });
        } else {
          // Geen audio beschikbaar -> stilte
          playFallbackTone();
        }
      }
    }
  }, [params.sessionId, audioEnabled, currentTrack, meditationTracks]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setSessionCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining]);

  // Auto-advance steps during meditation with countdown timer
  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    if (isPlaying && session && session.steps && session.steps.length > 0) {
      const stepDuration = (session.duration * 60) / session.steps.length; // Duration per step in seconds
      
      stepInterval = setInterval(() => {
        setStepTimer(prev => {
          if (prev <= 1) {
            // Move to next step
            setCurrentStep(prevStep => {
              const nextStep = prevStep + 1;
              if (nextStep >= session.steps.length) {
                setSessionCompleted(true);
                setIsPlaying(false);
                return prevStep;
              }
              return nextStep;
            });
            return stepDuration; // Reset timer for next step
          }
          return prev - 1;
        });
      }, 1000); // Update every second
    }
    return () => clearInterval(stepInterval);
  }, [isPlaying, session]);

  // Speak current step when it changes
  useEffect(() => {
    if (session && session.steps && session.steps[currentStep] && isPlaying && speechEnabled) {
      // Small delay to ensure step has changed
      const timer = setTimeout(() => {
        speakText(session.steps[currentStep]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, session, isPlaying, speechEnabled]);

  // Audio control effects
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioEnabled) {
        audioRef.current.loop = true; // Ensure loop is enabled
        // Update bron bij trackwijziging
        const src = meditationTracks[currentTrack]?.url || '';
        if (src) {
          if (audioRef.current.src !== window.location.origin + src && audioRef.current.src !== src) {
            audioRef.current.src = src;
          }
        }
        // ensure current volume
        audioRef.current.volume = volume;
        audioRef.current.play().catch(error => {
          console.log('Audio play failed, trying fallback:', error);
          playFallbackTone();
        });
        setIsAudioPlaying(true);
      } else {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    }
  }, [isPlaying, audioEnabled, currentTrack, meditationTracks, volume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Text-to-Speech functionality
  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nl-NL'; // Dutch language
    utterance.rate = 0.8; // Slightly slower for meditation
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (speechEnabled) {
      stopSpeaking();
    }
  };

  const startSession = () => {
    setShowInstructions(false);
    setIsPlaying(true);
    setCurrentStep(0); // Reset to first step
    
    // Start audio immediately when meditation starts
    if (audioEnabled && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Audio play failed, trying fallback:', error);
        // Try to play a simple tone as fallback
        playFallbackTone();
      });
    }
  };

  // Fallback tone generator for when audio files fail - gebruik eenvoudige stilte
  const playFallbackTone = () => {
    try {
      console.log('Audio bestanden niet beschikbaar - meditatie zonder audio');
      // Voor nu gewoon stil - de meditatie kan zonder audio
      setIsAudioPlaying(false);
    } catch (error) {
      console.log('Fallback audio failed:', error);
      setIsAudioPlaying(false);
    }
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resumeSession = () => {
    setIsPlaying(true);
  };

  const stopSession = () => {
    setIsPlaying(false);
    setTimeRemaining(session?.duration ? session.duration * 60 : 0);
    setShowInstructions(true);
    setSessionCompleted(false);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const changeTrack = (trackIndex: number) => {
    setCurrentTrack(trackIndex);
    // Update audio bron onmiddellijk
    if (audioRef.current) {
      const src = meditationTracks[trackIndex]?.url || '';
      if (src) {
        audioRef.current.src = src;
        if (isPlaying && audioEnabled) {
          audioRef.current.volume = volume;
          audioRef.current.play().catch(() => {});
        }
      } else {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'concentration': return <TagIcon className="w-5 h-5" />;
      case 'mindfulness': return <CpuChipIcon className="w-5 h-5" />;
      case 'breathing': return <FireIcon className="w-5 h-5" />;
      case 'visualization': return <BookOpenIcon className="w-5 h-5" />;
      default: return <TagIcon className="w-5 h-5" />;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Sessie laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E]">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #B6C948;
          cursor: pointer;
          border: 2px solid #1A2A1A;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #B6C948;
          cursor: pointer;
          border: 2px solid #1A2A1A;
        }
      `}</style>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#2A3A1A] text-[#B6C948] px-4 py-2 rounded-lg hover:bg-[#3A4A2A] transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Terug
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{session.title}</h1>
            <div className="flex items-center justify-center gap-4 text-[#8BAE5A]">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {session.duration} minuten
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(session.difficulty)}`}>
                {session.difficulty}
              </div>
              <div className="flex items-center gap-1">
                {getCategoryIcon(session.category)}
                {session.category}
              </div>
            </div>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <AnimatePresence mode="wait">
          {showInstructions && !sessionCompleted && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Session Info */}
              <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">📋 Wat ga je doen?</h2>
                <p className="text-[#8BAE5A] text-base sm:text-lg mb-4 sm:mb-6">{session.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Steps */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">📝 Stappen</h3>
                    <div className="space-y-3">
                      {session.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#B6C948] text-[#1A2A1A] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-[#8BAE5A]">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tips */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">💡 Tips</h3>
                    <div className="space-y-3">
                      {session.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#8BAE5A] text-[#1A2A1A] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            💡
                          </div>
                          <p className="text-[#8BAE5A]">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <motion.button
                  onClick={startSession}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#B6C948] text-[#1A2A1A] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#A6B938] transition-colors flex items-center gap-3 mx-auto"
                >
                  <PlayIcon className="w-6 h-6" />
                  Start Meditatie
                </motion.button>
              </div>
            </motion.div>
          )}

          {!showInstructions && !sessionCompleted && (
            <motion.div
              key="meditation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto text-center"
            >
              {/* Hidden audio element for meditation playback */}
              <audio ref={audioRef} preload="auto" loop className="hidden" />
              {/* Timer */}
              <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <div className="text-4xl sm:text-6xl font-bold text-[#B6C948] mb-3 sm:mb-4">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-[#8BAE5A] text-base sm:text-lg mb-4 sm:mb-6">
                  {isPlaying ? 'Meditatie actief...' : 'Gepauzeerd'}
                </div>
                
                {/* Current Step and Step Timer */}
                <div className="bg-[#2A3A1A] rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="text-center mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Stap {currentStep + 1} van {session?.steps?.length || 0}
                    </h3>
                    <div className="text-2xl sm:text-3xl font-bold text-[#B6C948] mb-2">
                      {formatTime(Math.floor(stepTimer))}
                    </div>
                    <div className="text-[#8BAE5A] text-sm">
                      Volgende stap over {Math.floor(stepTimer)} seconden
                    </div>
                  </div>
                  {session?.steps && session.steps[currentStep] && (
                    <div className="bg-[#1A2A1A] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white text-lg leading-relaxed flex-1">
                          {session.steps[currentStep]}
                        </p>
                        {speechEnabled && (
                          <motion.button
                            onClick={() => speakText(session.steps[currentStep])}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isSpeaking}
                            className={`ml-4 p-2 rounded-lg transition-colors ${
                              isSpeaking 
                                ? 'bg-[#B6C948] text-[#1A2A1A] animate-pulse' 
                                : 'bg-[#3A4A2A] text-[#B6C948] hover:bg-[#2A3A1A]'
                            }`}
                            title={isSpeaking ? 'Spreekt...' : 'Herhaal stap'}
                          >
                            {isSpeaking ? (
                              <MicrophoneIcon className="w-5 h-5" />
                            ) : (
                              <SpeakerWaveIcon className="w-5 h-5" />
                            )}
                          </motion.button>
                        )}
                      </div>
                      {isSpeaking && (
                        <div className="flex items-center gap-2 text-[#8BAE5A] text-sm">
                          <div className="animate-pulse">🔊</div>
                          <span>Stap wordt voorgelezen...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Audio Controls */}
                <div className="bg-[#2A3A1A] rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MusicalNoteIcon className="w-5 h-5" />
                      Meditatie Audio
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Speech Toggle */}
                      <motion.button
                        onClick={toggleSpeech}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg transition-colors ${
                          speechEnabled 
                            ? 'bg-[#B6C948] text-[#1A2A1A]' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                        title={speechEnabled ? 'Spraak uit' : 'Spraak aan'}
                      >
                        {speechEnabled ? (
                          <MicrophoneIcon className="w-5 h-5" />
                        ) : (
                          <SpeakerXMarkIcon className="w-5 h-5" />
                        )}
                      </motion.button>
                      
                      {/* Audio Toggle */}
                      <motion.button
                        onClick={toggleAudio}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg transition-colors ${
                          audioEnabled 
                            ? 'bg-[#B6C948] text-[#1A2A1A]' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                        title={audioEnabled ? 'Audio uit' : 'Audio aan'}
                      >
                        {audioEnabled ? (
                          <SpeakerWaveIcon className="w-5 h-5" />
                        ) : (
                          <SpeakerXMarkIcon className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  
                  {audioEnabled && (
                    <div className="space-y-4">
                      {/* Track Selection */}
                      <div>
                        <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                          Audio Track
                        </label>
                        <select
                          value={currentTrack}
                          onChange={(e) => changeTrack(parseInt(e.target.value))}
                          className="w-full bg-[#1A2A1A] border border-[#3A4A2A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#B6C948]"
                        >
                          {meditationTracks.map((track, index) => (
                            <option key={track.id} value={index}>
                              {track.name} - {track.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Volume Control */}
                      <div>
                        <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                          Volume: {Math.round(volume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-full h-2 bg-[#3A4A2A] rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                      
                      {/* Audio Status */}
                      <div className="text-sm text-[#8BAE5A] bg-[#2A3A1A] rounded-lg p-3">
                        <p className="flex items-center gap-2">
                          <MusicalNoteIcon className="w-4 h-4" />
                          Huidige track: {meditationTracks[currentTrack]?.name}
                        </p>
                        <p className="text-xs mt-1">
                          💡 Tip: Zet je telefoon op stil voor de beste meditatie ervaring
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  {isPlaying ? (
                    <motion.button
                      onClick={pauseSession}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#2A3A1A] text-[#B6C948] px-6 py-3 rounded-lg hover:bg-[#3A4A2A] transition-colors flex items-center gap-2"
                    >
                      <PauseIcon className="w-5 h-5" />
                      Pauzeer
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={resumeSession}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#B6C948] text-[#1A2A1A] px-6 py-3 rounded-lg hover:bg-[#A6B938] transition-colors flex items-center gap-2"
                    >
                      <PlayIcon className="w-5 h-5" />
                      Hervat
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={stopSession}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <StopIcon className="w-5 h-5" />
                    Stop
                  </motion.button>
                </div>
              </div>

              {/* Current Step */}
              <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Huidige Stap</h3>
                <p className="text-[#8BAE5A] text-lg">
                  {session.steps[currentStep] || 'Volg je ademhaling en blijf gefocust...'}
                </p>
              </div>
            </motion.div>
          )}

          {sessionCompleted && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
                <div className="w-20 h-20 bg-[#B6C948] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="w-10 h-10 text-[#1A2A1A]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">🎉 Goed gedaan!</h2>
                <p className="text-[#8BAE5A] text-lg mb-6">
                  Je hebt je {session.title} sessie succesvol voltooid. 
                  Consistentie is de sleutel tot betere focus en mentale helderheid.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={() => {
                      setSessionCompleted(false);
                      setShowInstructions(true);
                      setTimeRemaining(session.duration * 60);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#B6C948] text-[#1A2A1A] px-6 py-3 rounded-lg hover:bg-[#A6B938] transition-colors font-medium"
                  >
                    Opnieuw Doen
                  </motion.button>
                  
                  <motion.button
                    onClick={() => router.back()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#2A3A1A] text-[#B6C948] px-6 py-3 rounded-lg hover:bg-[#3A4A2A] transition-colors font-medium"
                  >
                    Terug naar Overzicht
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={meditationTracks[currentTrack]?.url}
          loop
          preload="auto"
          onError={(e) => {
            console.error('Audio error:', e);
            console.log('Trying fallback tone generator...');
            // Try fallback tone instead of disabling audio
            playFallbackTone();
          }}
          onLoadStart={() => {
            console.log('Audio loading started');
          }}
          onCanPlay={() => {
            console.log('Audio ready to play');
          }}
        />
      </div>
    </div>
  );
}
