'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TagIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  FireIcon,
  CpuChipIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

interface FocusSession {
  id: string;
  title: string;
  duration: number;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'concentration' | 'mindfulness' | 'breathing' | 'visualization';
  completed?: boolean;
  steps?: string[];
  tips?: string[];
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  category: 'morning' | 'afternoon' | 'evening';
}

const focusSessions: FocusSession[] = [
  {
    id: 'basic-concentration',
    title: 'Basis Concentratie Training',
    duration: 5,
    description: 'Leer je aandacht te focussen op één punt. Perfect voor beginners.',
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

const dailyTasks: DailyTask[] = [
  {
    id: 'morning-focus',
    title: 'Ochtend Focus Ritueel',
    description: 'Start je dag met 5 minuten focus training',
    duration: 5,
    completed: false,
    category: 'morning'
  },
  {
    id: 'work-focus',
    title: 'Werk Focus Check',
    description: 'Neem 3 minuten pauze om je focus te resetten',
    duration: 3,
    completed: false,
    category: 'afternoon'
  },
  {
    id: 'evening-reflection',
    title: 'Avond Reflectie',
    description: 'Evalueer je dag en plan morgen',
    duration: 10,
    completed: false,
    category: 'evening'
  }
];

export default function FocusTrainingPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <CpuChipIcon className="w-5 h-5" /> },
    { id: 'sessions', label: 'Focus Sessies', icon: <PlayIcon className="w-5 h-5" /> },
    { id: 'tasks', label: 'Dagelijkse Taken', icon: <CheckCircleIcon className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <ChartBarIcon className="w-5 h-5" /> }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            if (currentSession) {
              completeSession(currentSession.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, currentSession]);

  const startSession = (session: FocusSession) => {
    // Navigate to the session instruction page instead of starting directly
    router.push(`/dashboard/mind-focus/focus-training/${session.id}`);
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resumeSession = () => {
    setIsPlaying(true);
  };

  const stopSession = () => {
    setIsPlaying(false);
    setCurrentSession(null);
    setTimeRemaining(0);
  };

  const completeSession = (sessionId: string) => {
    if (!completedSessions.includes(sessionId)) {
      setCompletedSessions(prev => [...prev, sessionId]);
      toast.success('Focus sessie voltooid! 🎉');
    }
    setIsPlaying(false);
    setCurrentSession(null);
    setTimeRemaining(0);
  };

  const completeTask = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId]);
      toast.success('Dagelijkse taak voltooid! ✅');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#B6C948] mb-2">🎯 Focus Training</h1>
            <p className="text-[#8BAE5A] text-lg">Verbeter je concentratie en mentale helderheid</p>
          </div>
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#2A3A1A] text-[#B6C948] px-4 py-2 rounded-lg hover:bg-[#3A4A2A] transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Terug
          </motion.button>
        </div>
      </div>

      {/* What is Focus Training */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <TagIcon className="w-8 h-8 text-[#B6C948] mr-3" />
          Wat is Focus Training?
        </h2>
        <div className="space-y-4 text-[#8BAE5A] text-lg leading-relaxed">
          <p>
            Focus Training is een systematische aanpak om je concentratie en mentale helderheid te verbeteren. 
            Net zoals je spieren trainen in de gym, train je hier je geest om langer gefocust te blijven.
          </p>
          <p>
            <strong className="text-[#B6C948]">Waarom Focus Training?</strong><br />
            In onze moderne wereld worden we constant afgeleid door notificaties, social media en informatie-overload. 
            Focus Training helpt je om je aandacht te trainen en mentaal sterker te worden.
          </p>
          <p>
            <strong className="text-[#B6C948]">Wat ga je leren?</strong><br />
            • Je aandacht langer vasthouden<br />
            • Minder afgeleid raken door externe prikkels<br />
            • Beter presteren op werk en in sport<br />
            • Mentale rust en helderheid ontwikkelen
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
          <div className="text-3xl font-bold text-white mb-2">
            {completedSessions.length}
          </div>
          <div className="text-[#8BAE5A]">Voltooide Sessies</div>
        </div>
        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
          <div className="text-3xl font-bold text-white mb-2">
            {completedTasks.length}
          </div>
          <div className="text-[#8BAE5A]">Dagelijkse Taken</div>
        </div>
        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
          <div className="text-3xl font-bold text-white mb-2">
            {Math.round((completedSessions.length / focusSessions.length) * 100)}%
          </div>
          <div className="text-[#8BAE5A]">Progress</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <PlayIcon className="w-8 h-8 text-[#B6C948] mr-3" />
          Hoe begin je?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">1</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start Klein</h3>
            <p className="text-[#8BAE5A] text-sm">Begin met 5 minuten per dag. Consistentie is belangrijker dan duur.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">2</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Kies een Tijd</h3>
            <p className="text-[#8BAE5A] text-sm">Vind een vast moment op de dag dat werkt voor jouw routine.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">3</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Wees Geduldig</h3>
            <p className="text-[#8BAE5A] text-sm">Focus verbetering heeft tijd nodig. Blijf consistent en je ziet resultaten.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Focus Sessies</h2>
        <div className="text-[#8BAE5A]">
          {completedSessions.length} van {focusSessions.length} voltooid
        </div>
      </div>

      {/* Current Session Timer */}
      {currentSession && (
        <div className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#B6C948] mb-4">{currentSession.title}</h3>
          <div className="text-6xl font-bold text-white mb-4">
            {formatTime(timeRemaining)}
          </div>
          <div className="flex justify-center gap-4">
            {!isPlaying ? (
              <motion.button
                onClick={resumeSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#B6C948] text-[#1A2A1A] px-6 py-3 rounded-lg font-bold hover:bg-[#8BAE5A] transition-colors flex items-center gap-2"
              >
                <PlayIcon className="w-5 h-5" />
                Hervat
              </motion.button>
            ) : (
              <motion.button
                onClick={pauseSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#8BAE5A] text-[#1A2A1A] px-6 py-3 rounded-lg font-bold hover:bg-[#B6C948] transition-colors flex items-center gap-2"
              >
                <PauseIcon className="w-5 h-5" />
                Pauze
              </motion.button>
            )}
            <motion.button
              onClick={stopSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#2A3A1A] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#3A4A2A] transition-colors flex items-center gap-2"
            >
              <StopIcon className="w-5 h-5" />
              Stop
            </motion.button>
          </div>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {focusSessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6 hover:border-[#B6C948] transition-all ${
              completedSessions.includes(session.id) ? 'border-[#B6C948] bg-[#B6C948]/10' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-[#2A3A1A] rounded-lg mr-3">
                  {getCategoryIcon(session.category)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{session.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(session.difficulty)}`}>
                      {session.difficulty}
                    </span>
                    <span className="text-[#8BAE5A] text-sm flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {session.duration} min
                    </span>
                  </div>
                </div>
              </div>
              {completedSessions.includes(session.id) && (
                <CheckCircleIcon className="w-6 h-6 text-[#B6C948]" />
              )}
            </div>
            
            <p className="text-[#8BAE5A] text-sm mb-4">{session.description}</p>
            
            <motion.button
              onClick={() => startSession(session)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#2A3A1A] text-[#B6C948] py-2 rounded-lg hover:bg-[#3A4A2A] transition-colors font-medium"
            >
              {completedSessions.includes(session.id) ? 'Opnieuw Doen' : 'Start Sessie'}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dagelijkse Focus Taken</h2>
        <div className="text-[#8BAE5A]">
          {completedTasks.length} van {dailyTasks.length} voltooid
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dailyTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6 ${
              completedTasks.includes(task.id) ? 'border-[#B6C948] bg-[#B6C948]/10' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold mb-2">{task.title}</h3>
                <p className="text-[#8BAE5A] text-sm mb-3">{task.description}</p>
                <div className="flex items-center text-[#8BAE5A] text-sm">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {task.duration} minuten
                </div>
              </div>
              {completedTasks.includes(task.id) && (
                <CheckCircleIcon className="w-6 h-6 text-[#B6C948]" />
              )}
            </div>
            
            <motion.button
              onClick={() => completeTask(task.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={completedTasks.includes(task.id)}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                completedTasks.includes(task.id)
                  ? 'bg-[#B6C948] text-[#1A2A1A] cursor-default'
                  : 'bg-[#2A3A1A] text-[#B6C948] hover:bg-[#3A4A2A]'
              }`}
            >
              {completedTasks.includes(task.id) ? 'Voltooid' : 'Markeer als Voltooid'}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
        <h3 className="text-xl font-semibold text-white mb-4">💡 Focus Tips</h3>
        <div className="space-y-3 text-[#8BAE5A]">
          <p>• <strong className="text-[#B6C948]">Elimineer afleidingen:</strong> Zet je telefoon op stil en zoek een rustige plek</p>
          <p>• <strong className="text-[#B6C948]">Start met de ochtend:</strong> Je geest is dan het meest helder en gefocust</p>
          <p>• <strong className="text-[#B6C948]">Wees consistent:</strong> 5 minuten per dag is beter dan 1 uur per week</p>
          <p>• <strong className="text-[#B6C948]]">Track je progress:</strong> Houd bij hoe je focus verbetert over tijd</p>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Jouw Focus Progress</h2>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sessie Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#8BAE5A]">Voltooide sessies</span>
              <span className="text-white font-semibold">{completedSessions.length}/{focusSessions.length}</span>
            </div>
            <div className="w-full bg-[#2A3A1A] rounded-full h-2">
              <div 
                className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSessions.length / focusSessions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Dagelijkse Taken</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#8BAE5A]">Voltooide taken</span>
              <span className="text-white font-semibold">{completedTasks.length}/{dailyTasks.length}</span>
            </div>
            <div className="w-full bg-[#2A3A1A] rounded-full h-2">
              <div 
                className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedTasks.length / dailyTasks.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🏆 Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border-2 ${
            completedSessions.length >= 1 
              ? 'border-[#B6C948] bg-[#B6C948]/10' 
              : 'border-[#2A3A1A] bg-[#1A2A1A]'
          }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                completedSessions.length >= 1 ? 'bg-[#B6C948]' : 'bg-[#2A3A1A]'
              }`}>
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Eerste Sessie</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi je eerste focus sessie</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            completedSessions.length >= 3 
              ? 'border-[#B6C948] bg-[#B6C948]/10' 
              : 'border-[#2A3A1A] bg-[#1A2A1A]'
          }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                completedSessions.length >= 3 ? 'bg-[#B6C948]' : 'bg-[#2A3A1A]'
              }`}>
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Focus Beginner</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi 3 focus sessies</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            completedSessions.length >= 5 
              ? 'border-[#B6C948] bg-[#B6C948]/10' 
              : 'border-[#2A3A1A] bg-[#1A2A1A]'
          }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                completedSessions.length >= 5 ? 'bg-[#B6C948]' : 'bg-[#2A3A1A]'
              }`}>
                <span className="text-sm font-bold">5</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Focus Warrior</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi 5 focus sessies</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            completedSessions.length === focusSessions.length 
              ? 'border-[#B6C948] bg-[#B6C948]/10' 
              : 'border-[#2A3A1A] bg-[#1A2A1A]'
          }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                completedSessions.length === focusSessions.length ? 'bg-[#B6C948]' : 'bg-[#2A3A1A]'
              }`}>
                <span className="text-sm font-bold">★</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Focus Master</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi alle focus sessies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A] text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] mb-8">
          <div className="border-b border-[#2A3A1A]">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#B6C948] text-[#B6C948]'
                      : 'border-transparent text-[#8BAE5A] hover:text-white hover:border-[#3A4A2A]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderOverview()}
                </motion.div>
              )}

              {activeTab === 'sessions' && (
                <motion.div
                  key="sessions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSessions()}
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTasks()}
                </motion.div>
              )}

              {activeTab === 'progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderProgress()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
