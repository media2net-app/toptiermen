'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FireIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TagIcon,
  CpuChipIcon,
  BookOpenIcon,
  ChartBarIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

interface StressSession {
  id: string;
  title: string;
  duration: number;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'breathing' | 'relaxation' | 'mindfulness' | 'body-scan';
  completed?: boolean;
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  category: 'morning' | 'afternoon' | 'evening';
}

const stressSessions: StressSession[] = [
  {
    id: 'basic-breathing',
    title: 'Basis Ademhalingsoefening',
    duration: 5,
    description: 'Eenvoudige ademhalingstechniek om direct stress te verminderen.',
    difficulty: 'beginner',
    category: 'breathing'
  },
  {
    id: 'progressive-relaxation',
    title: 'Progressieve Spierontspanning',
    duration: 15,
    description: 'Systematisch ontspannen van alle spiergroepen in je lichaam.',
    difficulty: 'beginner',
    category: 'relaxation'
  },
  {
    id: 'mindful-breathing',
    title: 'Mindful Ademhaling',
    duration: 10,
    description: 'Combineer ademhaling met mindfulness voor diepe ontspanning.',
    difficulty: 'intermediate',
    category: 'mindfulness'
  },
  {
    id: 'body-scan-stress',
    title: 'Body Scan voor Stress',
    duration: 20,
    description: 'Voel spanning in je lichaam en laat het los.',
    difficulty: 'intermediate',
    category: 'body-scan'
  },
  {
    id: 'advanced-breathing',
    title: 'Geavanceerde Ademhaling',
    duration: 25,
    description: 'Complexe ademhalingstechnieken voor diepe stress release.',
    difficulty: 'advanced',
    category: 'breathing'
  },
  {
    id: 'full-body-relaxation',
    title: 'Volledige Lichaamsontspanning',
    duration: 30,
    description: 'Complete ontspanning van lichaam en geest.',
    difficulty: 'advanced',
    category: 'relaxation'
  }
];

const dailyTasks: DailyTask[] = [
  {
    id: 'morning-stress-check',
    title: 'Ochtend Stress Check',
    description: 'Start je dag met een korte stress assessment',
    duration: 3,
    completed: false,
    category: 'morning'
  },
  {
    id: 'lunch-break-relaxation',
    title: 'Lunch Break Ontspanning',
    description: 'Neem 5 minuten pauze om stress te verminderen',
    duration: 5,
    completed: false,
    category: 'afternoon'
  },
  {
    id: 'evening-stress-release',
    title: 'Avond Stress Release',
    description: 'Laat de stress van de dag los voordat je gaat slapen',
    duration: 10,
    completed: false,
    category: 'evening'
  }
];

export default function StressReleasePage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [currentSession, setCurrentSession] = useState<StressSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [currentStressLevel, setCurrentStressLevel] = useState(5);

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <CpuChipIcon className="w-5 h-5" /> },
    { id: 'sessions', label: 'Stress Release Sessies', icon: <PlayIcon className="w-5 h-5" /> },
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

  const startSession = (session: StressSession) => {
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
      toast.success('Stress release sessie voltooid! 🧘‍♂️');
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
      case 'breathing': return <FireIcon className="w-5 h-5" />;
      case 'relaxation': return <HeartIcon className="w-5 h-5" />;
      case 'mindfulness': return <CpuChipIcon className="w-5 h-5" />;
      case 'body-scan': return <SparklesIcon className="w-5 h-5" />;
      default: return <FireIcon className="w-5 h-5" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#B6C948] mb-2">🔥 Stress Release</h1>
            <p className="text-[#8BAE5A] text-lg">Ontspan en verminder stress met bewezen technieken</p>
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

      {/* What is Stress Release */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FireIcon className="w-8 h-8 text-[#B6C948] mr-3" />
          Wat is Stress Release?
        </h2>
        <div className="space-y-4 text-[#8BAE5A] text-lg leading-relaxed">
          <p>
            Stress Release is een verzameling van bewezen technieken om stress te verminderen en je lichaam 
            en geest te ontspannen. In onze drukke wereld is het essentieel om effectieve manieren te hebben 
            om stress te beheersen.
          </p>
          <p>
            <strong className="text-[#B6C948]">Waarom Stress Release?</strong><br />
            Chronische stress kan leiden tot burn-out, slaapproblemen, en gezondheidsklachten. 
            Door dagelijks stress release technieken te beoefenen, bouw je veerkracht op en blijf je mentaal sterk.
          </p>
          <p>
            <strong className="text-[#B6C948]">Wat ga je leren?</strong><br />
            • Ademhalingstechnieken voor directe stress vermindering<br />
            • Progressieve spierontspanning voor lichamelijke spanning<br />
            • Mindfulness technieken voor mentale rust<br />
            • Body scan oefeningen om spanning te voelen en los te laten
          </p>
        </div>
      </div>

      {/* Current Stress Level */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <HeartIcon className="w-8 h-8 text-[#B6C948] mr-3" />
          Huidige Stress Level
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#8BAE5A] text-lg">Hoe gestrest voel je je nu? (1-10)</span>
            <span className="text-2xl font-bold text-[#B6C948]">{currentStressLevel}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={currentStressLevel}
            onChange={(e) => setCurrentStressLevel(parseInt(e.target.value))}
            className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer slider-green"
            style={{
              background: `linear-gradient(to right, #B6C948 0%, #B6C948 ${(currentStressLevel - 1) * 11.11}%, #2A3A1A ${(currentStressLevel - 1) * 11.11}%, #2A3A1A 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-[#8BAE5A]">
            <span>Zeer ontspannen</span>
            <span>Extreem gestrest</span>
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
            {Math.round((completedSessions.length / stressSessions.length) * 100)}%
          </div>
          <div className="text-[#8BAE5A]">Progress</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
          <PlayIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#B6C948] mr-2 sm:mr-3" />
          Hoe begin je met Stress Release?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">1</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Herken Stress</h3>
            <p className="text-[#8BAE5A] text-sm">Leer de signalen van stress in je lichaam herkennen voordat het te erg wordt.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">2</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Adem Diep</h3>
            <p className="text-[#8BAE5A] text-sm">Ademhaling is de snelste manier om je zenuwstelsel te kalmeren.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#B6C948]">3</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Wees Consistent</h3>
            <p className="text-[#8BAE5A] text-sm">Dagelijkse oefening bouwt veerkracht op tegen stress.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Stress Release Sessies</h2>
        <div className="text-[#8BAE5A]">
          {completedSessions.length} van {stressSessions.length} voltooid
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
        {stressSessions.map((session) => (
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
        <h2 className="text-2xl font-bold text-white">Dagelijkse Stress Release Taken</h2>
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

      {/* Stress Management Tips */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
        <h3 className="text-xl font-semibold text-white mb-4">🔥 Stress Management Tips</h3>
        <div className="space-y-3 text-[#8BAE5A]">
          <p>• <strong className="text-[#B6C948]">Adem 4-7-8:</strong> Inhaleer 4 tellen, houd vast 7 tellen, adem uit 8 tellen</p>
          <p>• <strong className="text-[#B6C948]">Beweeg regelmatig:</strong> Fysieke activiteit vermindert stress hormonen</p>
          <p>• <strong className="text-[#B6C948]">Zorg voor slaap:</strong> 7-9 uur slaap per nacht voor optimale stress recovery</p>
          <p>• <strong className="text-[#B6C948]">Eet gezond:</strong> Vermijd suiker en cafeïne tijdens stressvolle periodes</p>
          <p>• <strong className="text-[#B6C948]">Sociale steun:</strong> Praat met vrienden of familie over je stress</p>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Jouw Stress Release Progress</h2>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sessie Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#8BAE5A]">Voltooide sessies</span>
              <span className="text-white font-semibold">{completedSessions.length}/{stressSessions.length}</span>
            </div>
            <div className="w-full bg-[#2A3A1A] rounded-full h-2">
              <div 
                className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSessions.length / stressSessions.length) * 100}%` }}
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

      {/* Stress Level Tracking */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Stress Level Tracking</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#8BAE5A]">Huidige stress level</span>
            <span className="text-2xl font-bold text-[#B6C948]">{currentStressLevel}/10</span>
          </div>
          <div className="w-full bg-[#2A3A1A] rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                currentStressLevel <= 3 ? 'bg-green-400' :
                currentStressLevel <= 6 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(currentStressLevel / 10) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-[#8BAE5A]">
            <span>Laag (1-3)</span>
            <span>Gemiddeld (4-6)</span>
            <span>Hoog (7-10)</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🏆 Stress Release Achievements</h3>
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
                <h4 className="text-white font-medium">Eerste Release</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi je eerste stress release sessie</p>
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
                <h4 className="text-white font-medium">Stress Warrior</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi 3 stress release sessies</p>
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
                <h4 className="text-white font-medium">Zen Master</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi 5 stress release sessies</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            completedSessions.length === stressSessions.length 
              ? 'border-[#B6C948] bg-[#B6C948]/10' 
              : 'border-[#2A3A1A] bg-[#1A2A1A]'
          }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                completedSessions.length === stressSessions.length ? 'bg-[#B6C948]' : 'bg-[#2A3A1A]'
              }`}>
                <span className="text-sm font-bold">🧘</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Stress Release Master</h4>
                <p className="text-[#8BAE5A] text-sm">Voltooi alle stress release sessies</p>
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
