'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  ArrowLeftIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  FireIcon,
  HeartIcon,
  CpuChipIcon,
  MoonIcon,
  SunIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  category: 'morning' | 'afternoon' | 'evening' | 'night';
  type: 'focus' | 'breathing' | 'assessment' | 'stress_release' | 'sleep_prep' | 'recovery';
}

interface UserProfile {
  stress_assessment: {
    workStress: number;
    personalStress: number;
    sleepQuality: number;
    energyLevel: number;
    focusProblems: boolean;
    irritability: boolean;
  };
  personal_goals: {
    improveFocus: boolean;
    reduceStress: boolean;
    betterSleep: boolean;
    moreEnergy: boolean;
    workLifeBalance: boolean;
  };
  lifestyle_info: {
    workSchedule: string;
    sportSchedule: string;
  };
}

export default function Week3Page() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Week 3 tasks - Sleep Preparation & Recovery focus
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: 'morning-sun-exposure',
      title: 'Ochtend Zonlicht Exposure',
      description: '15 minuten natuurlijk licht voor circadiane ritme reset',
      duration: 15,
      completed: false,
      category: 'morning',
      type: 'recovery'
    },
    {
      id: 'focus-sleep-optimized',
      title: 'Slaap-Geoptimaliseerde Focus',
      description: 'Concentratie training aangepast voor betere slaapkwaliteit',
      duration: 12,
      completed: false,
      category: 'morning',
      type: 'focus'
    },
    {
      id: 'afternoon-energy-management',
      title: 'Middag Energie Management',
      description: 'Energie boost zonder slaap verstoring - 8 minuten',
      duration: 8,
      completed: false,
      category: 'afternoon',
      type: 'breathing'
    },
    {
      id: 'evening-wind-down',
      title: 'Avond Wind-Down Protocol',
      description: 'Volledig slaapvoorbereiding protocol - 20 minuten',
      duration: 20,
      completed: false,
      category: 'evening',
      type: 'sleep_prep'
    },
    {
      id: 'sleep-quality-assessment',
      title: 'Slaapkwaliteit Assessment',
      description: 'Dagelijkse slaap tracking en reflectie',
      duration: 5,
      completed: false,
      category: 'night',
      type: 'assessment'
    }
  ]);

  // Load user profile for personalization
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/mind-focus/intake?userId=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.profile) {
          setUserProfile(data.profile);
          personalizeTasks(data.profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const personalizeTasks = (profile: UserProfile) => {
    const personalizedTasks = [...dailyTasks];

    // Adjust sleep preparation based on sleep quality
    if (profile.stress_assessment.sleepQuality <= 5) {
      personalizedTasks[3].duration = 25; // Extended wind-down for poor sleep
      personalizedTasks[3].description = 'Uitgebreid slaapvoorbereiding protocol voor betere slaapkwaliteit - 25 minuten';
      
      // Add extra sleep preparation task
      personalizedTasks.push({
        id: 'progressive-muscle-relaxation',
        title: 'Progressieve Spierontspanning',
        description: 'Diepe ontspanning voor betere slaap - 15 minuten',
        duration: 15,
        completed: false,
        category: 'night',
        type: 'stress_release'
      });
    }

    // Adjust morning routine based on energy level
    if (profile.stress_assessment.energyLevel <= 5) {
      personalizedTasks[0].duration = 20; // More sunlight exposure
      personalizedTasks[0].description = 'Uitgebreide ochtend zonlicht exposure voor energie boost - 20 minuten';
    }

    // Adjust focus training for work stress
    if (profile.stress_assessment.workStress >= 7) {
      personalizedTasks[1].description = 'Werkstress-geoptimaliseerde focus training met ontspanning - 15 minuten';
      personalizedTasks[1].duration = 15;
    }

    setDailyTasks(personalizedTasks);
  };

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'tasks', label: 'Slaap Protocol', icon: <MoonIcon className="w-5 h-5" /> },
    { id: 'progress', label: 'Voortgang', icon: <FireIcon className="w-5 h-5" /> }
  ];

  const toggleTask = (taskId: string) => {
    setDailyTasks(prev => {
      const updatedTasks = prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      // Check if all tasks are completed
      const allCompleted = updatedTasks.every(task => task.completed);
      if (allCompleted && !showSuccessModal) {
        setShowSuccessModal(true);
      }
      
      return updatedTasks;
    });
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'focus':
        return <CpuChipIcon className="w-5 h-5 text-blue-500" />;
      case 'breathing':
        return <HeartIcon className="w-5 h-5 text-green-500" />;
      case 'assessment':
        return <ChartBarIcon className="w-5 h-5 text-purple-500" />;
      case 'stress_release':
        return <FireIcon className="w-5 h-5 text-orange-500" />;
      case 'sleep_prep':
        return <MoonIcon className="w-5 h-5 text-indigo-500" />;
      case 'recovery':
        return <SunIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'morning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'afternoon':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'evening':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      case 'night':
        return 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const completedToday = dailyTasks.filter(task => task.completed).length;
  const totalToday = dailyTasks.length;
  const progressPercentage = (completedToday / totalToday) * 100;

  const handleCompleteWeek = async () => {
    if (!user) return;
    
    setIsUpdatingProgress(true);
    
    try {
      const response = await fetch('/api/mind-focus/user-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          completedWeek: 3,
          currentActiveWeek: 4
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Week 3 completed successfully:', result.data);
        router.push('/dashboard/mind-focus');
      } else {
        console.error('❌ Failed to complete week 3:', result.error);
        alert('Er is een fout opgetreden bij het voltooien van Week 3. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('❌ Error completing week 3:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Slaap protocol laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#3A4D23]/40 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Week 3 - Slaap & Herstel</h1>
            <p className="text-[#8BAE5A] mt-1">Focus op slaapkwaliteit en circadiane ritme optimalisatie</p>
          </div>
        </div>

        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#3B82F6]/20 rounded-xl p-6 mb-6 border border-[#8BAE5A]/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Week 3 Slaap Protocol</h2>
              <p className="text-[#8BAE5A] text-sm">Circadiane ritme optimalisatie en slaapkwaliteit verbetering</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{completedToday}/{totalToday}</div>
              <div className="text-sm text-[#8BAE5A]">Taken voltooid</div>
            </div>
          </div>
          <div className="w-full bg-[#3A4D23] rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-[#8BAE5A] to-[#3B82F6] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8BAE5A]">Week 3 van 24</span>
            <span className="text-white">Voltooi alle taken om Week 4 te unlocken</span>
          </div>
        </div>

        {/* Sleep Quality Personalization */}
        {userProfile && (
          <div className="bg-[#232D1A]/80 rounded-xl p-4 mb-6 border border-[#3A4D23]/40">
            <h3 className="text-lg font-bold text-white mb-3">🌙 Slaap Protocol Gepersonaliseerd</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#8BAE5A]">Huidige slaapkwaliteit:</span>
                <span className="text-white ml-2">{userProfile.stress_assessment.sleepQuality}/10</span>
                {userProfile.stress_assessment.sleepQuality <= 5 && (
                  <span className="text-indigo-400 ml-2">→ Uitgebreid slaap protocol</span>
                )}
              </div>
              <div>
                <span className="text-[#8BAE5A]">Energie level:</span>
                <span className="text-white ml-2">{userProfile.stress_assessment.energyLevel}/10</span>
                {userProfile.stress_assessment.energyLevel <= 5 && (
                  <span className="text-yellow-400 ml-2">→ Extra zonlicht exposure</span>
                )}
              </div>
              <div>
                <span className="text-[#8BAE5A]">Werkstress:</span>
                <span className="text-white ml-2">{userProfile.stress_assessment.workStress}/10</span>
                {userProfile.stress_assessment.workStress >= 7 && (
                  <span className="text-blue-400 ml-2">→ Werkstress-geoptimaliseerde focus</span>
                )}
              </div>
              <div>
                <span className="text-[#8BAE5A]">Slaap doel:</span>
                <span className="text-white ml-2">
                  {userProfile.personal_goals.betterSleep ? 'Verbetering' : 'Onderhoud'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-[#232D1A] rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8BAE5A] text-[#1A2A1A] font-semibold'
                  : 'text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23]/40'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Week 3 Goals */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4">Week 3 Slaap & Herstel Doelen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <SunIcon className="w-6 h-6 text-yellow-500" />
                    <h4 className="font-semibold text-white">Circadiane Reset</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Ochtend zonlicht exposure voor natuurlijk ritme</p>
                </div>
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <MoonIcon className="w-6 h-6 text-indigo-500" />
                    <h4 className="font-semibold text-white">Slaap Voorbereiding</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Compleet avond wind-down protocol</p>
                </div>
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <CpuChipIcon className="w-6 h-6 text-blue-500" />
                    <h4 className="font-semibold text-white">Slaap-Geoptimaliseerde Focus</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Focus training die slaapkwaliteit ondersteunt</p>
                </div>
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                    <h4 className="font-semibold text-white">Herstel Monitoring</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Dagelijkse slaapkwaliteit tracking</p>
                </div>
              </div>
            </div>

            {/* Daily Protocol Preview */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4">Dagelijks Slaap Protocol</h3>
              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      task.completed 
                        ? 'bg-[#8BAE5A]/10 border-[#8BAE5A]/30' 
                        : 'bg-[#1A2A1A] border-[#3A4D23]/40'
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-[#8BAE5A] border-[#8BAE5A]'
                          : 'border-[#3A4D23] hover:border-[#8BAE5A]'
                      }`}
                    >
                      {task.completed && <CheckCircleIcon className="w-4 h-4 text-[#1A2A1A]" />}
                    </button>
                    {getTaskIcon(task.type)}
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'text-[#8BAE5A]' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <p className="text-[#8BAE5A] text-sm">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(task.category)}`}>
                        {task.category === 'morning' ? 'Ochtend' : 
                         task.category === 'afternoon' ? 'Middag' : 
                         task.category === 'evening' ? 'Avond' : 'Nacht'}
                      </span>
                      <div className="flex items-center gap-1 text-[#8BAE5A] text-sm">
                        <ClockIcon className="w-4 h-4" />
                        {task.duration} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Task Categories */}
            {['morning', 'afternoon', 'evening', 'night'].map((category) => {
              const categoryTasks = dailyTasks.filter(task => task.category === category);
              const completedCategory = categoryTasks.filter(task => task.completed).length;
              
              if (categoryTasks.length === 0) return null;
              
              return (
                <div key={category} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white capitalize">
                      {category === 'morning' ? 'Ochtend' : 
                       category === 'afternoon' ? 'Middag' : 
                       category === 'evening' ? 'Avond' : 'Nacht'} Protocol
                    </h3>
                    <span className="text-sm text-[#8BAE5A]">
                      {completedCategory}/{categoryTasks.length} voltooid
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {categoryTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          task.completed 
                            ? 'bg-[#8BAE5A]/10 border-[#8BAE5A]/30' 
                            : 'bg-[#1A2A1A] border-[#3A4D23]/40 hover:border-[#8BAE5A]/50'
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            task.completed
                              ? 'bg-[#8BAE5A] border-[#8BAE5A]'
                              : 'border-[#3A4D23] hover:border-[#8BAE5A] hover:bg-[#8BAE5A]/20'
                          }`}
                        >
                          {task.completed && <CheckCircleIcon className="w-5 h-5 text-[#1A2A1A]" />}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTaskIcon(task.type)}
                            <h4 className={`font-semibold ${task.completed ? 'text-[#8BAE5A]' : 'text-white'}`}>
                              {task.title}
                            </h4>
                          </div>
                          <p className="text-[#8BAE5A] text-sm mb-2">{task.description}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[#8BAE5A] text-sm">
                              <ClockIcon className="w-4 h-4" />
                              {task.duration} minuten
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(task.category)}`}>
                              {task.category === 'morning' ? 'Ochtend' : 
                               task.category === 'afternoon' ? 'Middag' : 
                               task.category === 'evening' ? 'Avond' : 'Nacht'}
                            </span>
                          </div>
                        </div>
                        
                        {(task.type === 'sleep_prep' || task.type === 'recovery') && (
                          <button className="px-4 py-2 bg-[#8BAE5A] text-[#1A2A1A] rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors">
                            Start Protocol
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Weekly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <MoonIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Week 3</div>
                <div className="text-[#8BAE5A] text-sm">Slaap & Herstel</div>
              </div>
              
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{completedToday}</div>
                <div className="text-[#8BAE5A] text-sm">Protocol Voltooid</div>
              </div>
              
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <ChartBarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
                <div className="text-[#8BAE5A] text-sm">Dag Voortgang</div>
              </div>
            </div>

            {/* Sleep Quality Tracking */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-lg font-bold text-white mb-4">Slaapkwaliteit Tracking</h3>
              <div className="h-48 bg-[#1A2A1A] rounded-lg flex items-center justify-center border border-[#3A4D23]/40">
                <div className="text-center">
                  <MoonIcon className="w-12 h-12 text-[#8BAE5A] mx-auto mb-2" />
                  <p className="text-[#8BAE5A]">Slaap tracking dashboard komt binnenkort</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A2A1A] rounded-xl border border-[#3A4D23]/40 max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-500 text-3xl">🌙</span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Slaap Protocol Voltooid!</h3>
                <p className="text-[#8BAE5A] mb-4">
                  Je hebt alle slaap en herstel taken van Week 3 voltooid!
                </p>
                
                <div className="bg-[#8BAE5A]/10 border border-[#8BAE5A]/20 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-[#8BAE5A] mb-2">Wat gebeurt er nu?</h4>
                  <ul className="text-sm text-[#8BAE5A] space-y-1 text-left">
                    <li>• Week 3 slaap protocol voltooid</li>
                    <li>• Week 4 wordt automatisch ontgrendeld</li>
                    <li>• Slaapkwaliteit voortgang opgeslagen</li>
                  </ul>
                </div>
                
                <button
                  onClick={handleCompleteWeek}
                  disabled={isUpdatingProgress}
                  className="w-full px-6 py-3 bg-[#8BAE5A] hover:bg-[#A6C97B] disabled:bg-[#3A4D23] disabled:text-[#8BAE5A] text-[#1A2A1A] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isUpdatingProgress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#1A2A1A] border-t-transparent rounded-full animate-spin"></div>
                      Bezig met opslaan...
                    </>
                  ) : (
                    'Terug naar Dashboard'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
