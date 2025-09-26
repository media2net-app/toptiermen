'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TagIcon,
  CpuChipIcon,
  BookOpenIcon,
  ChartBarIcon,
  MoonIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/solid';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

interface SleepSession {
  id: string;
  title: string;
  duration: number;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'breathing' | 'relaxation' | 'meditation' | 'body-scan';
  completed?: boolean;
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  category: 'evening' | 'bedtime' | 'night';
}

const sleepSessions: SleepSession[] = [
  {
    id: 'bedtime-breathing',
    title: 'Bedtime Ademhaling',
    duration: 5,
    description: 'Eenvoudige ademhalingsoefening om je lichaam voor te bereiden op slaap.',
    difficulty: 'beginner',
    category: 'breathing'
  },
  {
    id: 'progressive-sleep-relaxation',
    title: 'Progressieve Slaap Ontspanning',
    duration: 15,
    description: 'Systematisch ontspannen van je lichaam voor een diepe nachtrust.',
    difficulty: 'beginner',
    category: 'relaxation'
  },
  {
    id: 'sleep-meditation',
    title: 'Slaap Meditatie',
    duration: 20,
    description: 'Mindfulness meditatie specifiek ontworpen voor het in slaap vallen.',
    difficulty: 'intermediate',
    category: 'meditation'
  },
  {
    id: 'body-scan-sleep',
    title: 'Body Scan voor Slaap',
    duration: 25,
    description: 'Voel spanning in je lichaam en laat het los voor een rustige nacht.',
    difficulty: 'intermediate',
    category: 'body-scan'
  },
  {
    id: 'advanced-sleep-breathing',
    title: 'Geavanceerde Slaap Ademhaling',
    duration: 30,
    description: 'Complexe ademhalingstechnieken voor diepe slaap voorbereiding.',
    difficulty: 'advanced',
    category: 'breathing'
  },
  {
    id: 'full-sleep-preparation',
    title: 'Volledige Slaap Voorbereiding',
    duration: 35,
    description: 'Complete routine om je lichaam en geest voor te bereiden op slaap.',
    difficulty: 'advanced',
    category: 'relaxation'
  }
];

const dailyTasks: DailyTask[] = [
  {
    id: 'evening-wind-down',
    title: 'Avond Wind-Down',
    description: 'Begin 1 uur voor bedtijd met ontspannende activiteiten',
    duration: 60,
    completed: false,
    category: 'evening'
  },
  {
    id: 'bedtime-routine',
    title: 'Bedtijd Routine',
    description: 'Volg je vaste bedtijd routine voor consistentie',
    duration: 30,
    completed: false,
    category: 'bedtime'
  },
  {
    id: 'sleep-environment',
    title: 'Slaap Omgeving Check',
    description: 'Zorg voor optimale slaapomstandigheden (temperatuur, licht, geluid)',
    duration: 10,
    completed: false,
    category: 'night'
  }
];

export default function SleepPreparationPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [currentSession, setCurrentSession] = useState<SleepSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [currentSleepQuality, setCurrentSleepQuality] = useState(5);

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <CpuChipIcon className="w-5 h-5" /> },
    { id: 'sessions', label: 'Slaap Sessies', icon: <PlayIcon className="w-5 h-5" /> },
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

  const startSession = (session: SleepSession) => {
    setCurrentSession(session);
    setTimeRemaining(session.duration * 60); // Convert minutes to seconds
    setIsPlaying(true);
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
      toast.success('Slaap voorbereiding sessie voltooid! 😴');
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
      case 'breathing': return <MoonIcon className="w-5 h-5" />;
      case 'relaxation': return <HeartIcon className="w-5 h-5" />;
      case 'meditation': return <CpuChipIcon className="w-5 h-5" />;
      case 'body-scan': return <SparklesIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#B6C948] mb-2">🌙 Sleep Preparation</h1>
            <p className="text-[#8BAE5A] text-lg">Bereid je voor op een goede nachtrust</p>
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

      {/* What is Sleep Preparation */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <ClockIcon className="w-8 h-8 text-[#B6C948] mr-3" />
          Wat is Sleep Preparation?
        </h2>
        <div className="space-y-4 text-[#8BAE5A] text-lg leading-relaxed">
          <p>
            Sleep Preparation is een systematische aanpak om je lichaam en geest voor te bereiden op een goede nachtrust. 
            Door de juiste routines en technieken te gebruiken, verbeter je je slaapkwaliteit aanzienlijk.
          </p>
          <p>
            <strong className="text-[#B6C948]">Waarom Sleep Preparation?</strong><br />
            Goede slaap is essentieel voor herstel, focus, en mentale gezondheid. Door je lichaam en geest goed voor te bereiden 
            op slaap, val je sneller in slaap en slaap je dieper en rustiger.
          </p>
          <p>
            <strong className="text-[#B6C948]">Wat ga je leren?</strong><br />
            • Ademhalingstechnieken voor slaap voorbereiding<br />
            • Progressieve ontspanning voor lichamelijke rust<br />
            • Mindfulness technieken voor mentale kalmte<br />
            • Body scan oefeningen om spanning los te laten
          </p>
        </div>
      </div>

      {/* Current Sleep Quality */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <MoonIcon className="w-8 h-8 text-[#B6C948] mr-3" />
          Huidige Slaapkwaliteit
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#8BAE5A] text-lg">Hoe goed slaap je? (1-10)</span>
            <span className="text-2xl font-bold text-[#B6C948]">{currentSleepQuality}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={currentSleepQuality}
            onChange={(e) => setCurrentSleepQuality(parseInt(e.target.value))}
            className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer slider-green"
            style={{
              background: `linear-gradient(to right, #B6C948 0%, #B6C948 ${(currentSleepQuality - 1) * 11.11}%, #2A3A1A ${(currentSleepQuality - 1) * 11.11}%, #2A3A1A 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-[#8BAE5A]">
            <span>Zeer slecht slapen</span>
            <span>Perfect slapen</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
            {Math.round((completedSessions.length / sleepSessions.length) * 100)}%
          </div>
          <div className="text-[#8BAE5A]">Progress</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
          <PlayIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#B6C948] mr-2 sm:mr-3" />
          Hoe begin je met Sleep Preparation?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">1</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Vaste Bedtijd</h3>
            <p className="text-[#8BAE5A] text-sm">Ga elke dag op hetzelfde tijdstip naar bed voor een consistent slaapritme.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">2</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Wind-Down Routine</h3>
            <p className="text-[#8BAE5A] text-sm">Begin 1 uur voor bedtijd met ontspannende activiteiten.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">3</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Optimale Omgeving</h3>
            <p className="text-[#8BAE5A] text-sm">Zorg voor een koele, donkere en stille slaapomgeving.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Slaap Voorbereiding Sessies</h2>
        <div className="text-[#8BAE5A]">
          {completedSessions.length} van {sleepSessions.length} voltooid
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sleepSessions.map((session) => (
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
        <h2 className="text-2xl font-bold text-white">Dagelijkse Slaap Taken</h2>
        <div className="text-[#8BAE5A]">
          {completedTasks.length} van {dailyTasks.length} voltooid
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Sleep Tips */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
        <h3 className="text-xl font-semibold text-white mb-4">🌙 Slaap Tips</h3>
        <div className="space-y-3 text-[#8BAE5A]">
          <p>• <strong className="text-[#B6C948]">Vermijd schermen 1 uur voor bedtijd:</strong> Blauw licht verstoort je natuurlijke slaapritme</p>
          <p>• <strong className="text-[#B6C948]">Houd je slaapkamer koel:</strong> 18-20°C is ideaal voor slaap</p>
          <p>• <strong className="text-[#B6C948]">Vermijd cafeïne na 14:00:</strong> Cafeïne kan 6-8 uur in je systeem blijven</p>
          <p>• <strong className="text-[#B6C948]">Zorg voor totale duisternis:</strong> Gebruik verduisterende gordijnen of een slaapmasker</p>
          <p>• <strong className="text-[#B6C948]]">Vermijd zware maaltijden voor bedtijd:</strong> Eet je laatste maaltijd 2-3 uur voor bedtijd</p>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Jouw Slaap Progress</h2>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sessie Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#8BAE5A]">Voltooide sessies</span>
              <span className="text-white font-semibold">{completedSessions.length}/{sleepSessions.length}</span>
            </div>
            <div className="w-full bg-[#2A3A1A] rounded-full h-2">
              <div 
                className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSessions.length / sleepSessions.length) * 100}%` }}
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

      {/* Sleep Quality Tracking */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Slaapkwaliteit Tracking</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#8BAE5A]">Huidige slaapkwaliteit</span>
            <span className="text-2xl font-bold text-[#B6C948]">{currentSleepQuality}/10</span>
          </div>
          <div className="w-full bg-[#2A3A1A] rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                currentSleepQuality <= 3 ? 'bg-red-400' :
                currentSleepQuality <= 6 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              style={{ width: `${(currentSleepQuality / 10) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-[#8BAE5A]">
            <span>Slecht (1-3)</span>
            <span>Gemiddeld (4-6)</span>
            <span>Goed (7-10)</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🏆 Slaap Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                <h4 className="text-white font-medium">Eerste Slaap Sessie</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi je eerste slaap voorbereiding sessie</p>
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
                <h4 className="text-white font-medium">Slaap Beginner</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi 3 slaap voorbereiding sessies</p>
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
                <h4 className="text-white font-medium">Slaap Warrior</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi 5 slaap voorbereiding sessies</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            completedSessions.length === sleepSessions.length 
              ? 'border-[#B6C948] bg-[#B6C948]/10' 
              : 'border-[#2A3A1A] bg-[#1A2A1A]'
          }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                completedSessions.length === sleepSessions.length ? 'bg-[#B6C948]' : 'bg-[#2A3A1A]'
              }`}>
                <span className="text-sm font-bold">🌙</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Slaap Master</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi alle slaap voorbereiding sessies</p>
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
