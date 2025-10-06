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
  ShieldCheckIcon,
  ArrowPathIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  category: 'morning' | 'afternoon' | 'evening' | 'integration';
  type: 'focus' | 'breathing' | 'assessment' | 'stress_release' | 'sleep_prep' | 'integration' | 'habit_consolidation';
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

export default function Week4Page() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isWeekCompleted, setIsWeekCompleted] = useState(false);

  // Week 4 tasks - Integration & Habit Consolidation
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: 'integrated-morning-routine',
      title: 'Geïntegreerde Ochtend Routine',
      description: 'Combineer alle Week 1-3 technieken in één flow - 25 minuten',
      duration: 25,
      completed: false,
      category: 'morning',
      type: 'integration'
    },
    {
      id: 'habit-consolidation-session',
      title: 'Gewoonte Consolidatie Sessie',
      description: 'Reflectie en versterking van opgebouwde gewoonten',
      duration: 15,
      completed: false,
      category: 'morning',
      type: 'habit_consolidation'
    },
    {
      id: 'stress-resilience-training',
      title: 'Stress Weerbaarheid Training',
      description: 'Geavanceerde stress management voor dagelijks leven',
      duration: 20,
      completed: false,
      category: 'afternoon',
      type: 'stress_release'
    },
    {
      id: 'integrated-evening-wind-down',
      title: 'Geïntegreerde Avond Routine',
      description: 'Combinatie van focus, ademhaling en slaapvoorbereiding',
      duration: 30,
      completed: false,
      category: 'evening',
      type: 'integration'
    },
    {
      id: 'monthly-progress-assessment',
      title: 'Maandelijkse Voortgang Assessment',
      description: 'Uitgebreide evaluatie van eerste maand Mind & Focus',
      duration: 10,
      completed: false,
      category: 'integration',
      type: 'assessment'
    }
  ]);

  // Load user profile for personalization and check week status
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        // Load profile and progress data
        const [profileResponse, progressResponse] = await Promise.all([
          fetch(`/api/mind-focus/intake?userId=${user.id}`),
          fetch(`/api/mind-focus/user-progress?userId=${user.id}`)
        ]);
        
        const [profileData, progressData] = await Promise.all([
          profileResponse.json(),
          progressResponse.json()
        ]);
        
        if (profileData.success && profileData.profile) {
          setUserProfile(profileData.profile);
          personalizeTasks(profileData.profile);
        }
        
        if (progressData.success && progressData.progress) {
          const { completed_weeks } = progressData.progress;
          const week4Completed = completed_weeks && completed_weeks.includes(4);
          setIsWeekCompleted(week4Completed);
          
          // If week is completed, mark all tasks as completed
          if (week4Completed) {
            setDailyTasks(prev => prev.map(task => ({ ...task, completed: true })));
          }
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

    // Adjust integration based on lifestyle
    if (profile.lifestyle_info.workSchedule === 'shift_work') {
      personalizedTasks[0].description = 'Flexibele ochtend routine voor ploegendienst - 30 minuten';
      personalizedTasks[0].duration = 30;
    }

    // Adjust stress resilience based on work stress
    if (profile.stress_assessment.workStress >= 8) {
      personalizedTasks[2].duration = 25;
      personalizedTasks[2].description = 'Intensieve stress weerbaarheid training voor hoge werkdruk - 25 minuten';
    }

    // Adjust evening routine based on sleep quality improvement
    if (profile.stress_assessment.sleepQuality <= 6) {
      personalizedTasks[3].duration = 35;
      personalizedTasks[3].description = 'Uitgebreide avond routine voor slaapkwaliteit verbetering - 35 minuten';
    }

    // Add extra integration task for work-life balance goal
    if (profile.personal_goals.workLifeBalance) {
      personalizedTasks.push({
        id: 'work-life-boundary-setting',
        title: 'Work-Life Boundary Setting',
        description: 'Grenzen stellen en balans creëren tussen werk en privé',
        duration: 12,
        completed: false,
        category: 'integration',
        type: 'habit_consolidation'
      });
    }

    setDailyTasks(personalizedTasks);
  };

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'tasks', label: 'Integratie', icon: <LinkIcon className="w-5 h-5" /> },
    { id: 'progress', label: 'Voortgang', icon: <FireIcon className="w-5 h-5" /> }
  ];

  const toggleTask = (taskId: string) => {
    // Don't allow toggling if week is already completed
    if (isWeekCompleted) return;
    
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
      case 'integration':
        return <LinkIcon className="w-5 h-5 text-cyan-500" />;
      case 'habit_consolidation':
        return <ArrowPathIcon className="w-5 h-5 text-emerald-500" />;
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
      case 'integration':
        return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400';
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
          completedWeek: 4,
          currentActiveWeek: 5
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Week 4 completed successfully:', result.data);
        router.push('/dashboard/mind-focus');
      } else {
        console.error('❌ Failed to complete week 4:', result.error);
        alert('Er is een fout opgetreden bij het voltooien van Week 4. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('❌ Error completing week 4:', error);
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
          <p className="text-[#8BAE5A]">Integratie protocol laden...</p>
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
            <h1 className="text-3xl font-bold text-white">
              Week 4 - Integratie & Gewoonten
              {isWeekCompleted && (
                <span className="ml-3 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                  ✅ Voltooid
                </span>
              )}
            </h1>
            <p className="text-[#8BAE5A] mt-1">
              {isWeekCompleted ? 'Je hebt deze week succesvol voltooid!' : 'Consolidatie van alle opgebouwde Mind & Focus gewoonten'}
            </p>
          </div>
        </div>

        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#06B6D4]/20 rounded-xl p-6 mb-6 border border-[#8BAE5A]/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Week 4 Integratie Protocol</h2>
              <p className="text-[#8BAE5A] text-sm">Eerste maand afronding en gewoonte consolidatie</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{completedToday}/{totalToday}</div>
              <div className="text-sm text-[#8BAE5A]">Taken voltooid</div>
            </div>
          </div>
          <div className="w-full bg-[#3A4D23] rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-[#8BAE5A] to-[#06B6D4] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8BAE5A]">Week 4 van 24 - Maand 1 Afronding</span>
            <span className="text-white">Voltooi alle taken om Maand 2 te starten</span>
          </div>
        </div>

        {/* Integration Personalization */}
        {userProfile && (
          <div className="bg-[#232D1A]/80 rounded-xl p-4 mb-6 border border-[#3A4D23]/40">
            <h3 className="text-lg font-bold text-white mb-3">🔗 Integratie Gepersonaliseerd</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#8BAE5A]">Werkrooster:</span>
                <span className="text-white ml-2 capitalize">{userProfile.lifestyle_info.workSchedule.replace('_', ' ')}</span>
                {userProfile.lifestyle_info.workSchedule === 'shift_work' && (
                  <span className="text-cyan-400 ml-2">→ Flexibele routine</span>
                )}
              </div>
              <div>
                <span className="text-[#8BAE5A]">Werkstress niveau:</span>
                <span className="text-white ml-2">{userProfile.stress_assessment.workStress}/10</span>
                {userProfile.stress_assessment.workStress >= 8 && (
                  <span className="text-orange-400 ml-2">→ Intensieve stress training</span>
                )}
              </div>
              <div>
                <span className="text-[#8BAE5A]">Slaapkwaliteit:</span>
                <span className="text-white ml-2">{userProfile.stress_assessment.sleepQuality}/10</span>
                {userProfile.stress_assessment.sleepQuality <= 6 && (
                  <span className="text-indigo-400 ml-2">→ Uitgebreide avond routine</span>
                )}
              </div>
              <div>
                <span className="text-[#8BAE5A]">Work-Life Balance:</span>
                <span className="text-white ml-2">{userProfile.personal_goals.workLifeBalance ? 'Ja' : 'Nee'}</span>
                {userProfile.personal_goals.workLifeBalance && (
                  <span className="text-emerald-400 ml-2">→ Boundary setting toegevoegd</span>
                )}
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
            {/* Week 4 Goals */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4">Week 4 Integratie & Consolidatie Doelen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <LinkIcon className="w-6 h-6 text-cyan-500" />
                    <h4 className="font-semibold text-white">Techniek Integratie</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Combineer alle Week 1-3 technieken in dagelijkse routines</p>
                </div>
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowPathIcon className="w-6 h-6 text-emerald-500" />
                    <h4 className="font-semibold text-white">Gewoonte Consolidatie</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Versterk en automatiseer opgebouwde gewoonten</p>
                </div>
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <FireIcon className="w-6 h-6 text-orange-500" />
                    <h4 className="font-semibold text-white">Stress Weerbaarheid</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Geavanceerde stress management voor dagelijks leven</p>
                </div>
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <ChartBarIcon className="w-6 h-6 text-purple-500" />
                    <h4 className="font-semibold text-white">Maandelijkse Assessment</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Uitgebreide evaluatie van eerste maand voortgang</p>
                </div>
              </div>
            </div>

            {/* Monthly Milestone */}
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#06B6D4]/10 rounded-xl p-6 border border-[#8BAE5A]/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center">
                  <span className="text-[#8BAE5A] text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Maand 1 Milestone</h3>
                  <p className="text-[#8BAE5A]">Je bent klaar om de eerste maand af te ronden!</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">Week 1</div>
                  <div className="text-sm text-[#8BAE5A]">Focus Training</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Week 2</div>
                  <div className="text-sm text-[#8BAE5A]">Stress Release</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Week 3</div>
                  <div className="text-sm text-[#8BAE5A]">Slaap Protocol</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Week 4</div>
                  <div className="text-sm text-[#8BAE5A]">Integratie</div>
                </div>
              </div>
            </div>

            {/* Daily Integration Preview */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4">Dagelijkse Integratie Protocol</h3>
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
                         task.category === 'evening' ? 'Avond' : 'Integratie'}
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
            {['morning', 'afternoon', 'evening', 'integration'].map((category) => {
              const categoryTasks = dailyTasks.filter(task => task.category === category);
              const completedCategory = categoryTasks.filter(task => task.completed).length;
              
              if (categoryTasks.length === 0) return null;
              
              return (
                <div key={category} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white capitalize">
                      {category === 'morning' ? 'Ochtend' : 
                       category === 'afternoon' ? 'Middag' : 
                       category === 'evening' ? 'Avond' : 'Integratie'} Protocol
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
                               task.category === 'evening' ? 'Avond' : 'Integratie'}
                            </span>
                          </div>
                        </div>
                        
                        {(task.type === 'integration' || task.type === 'habit_consolidation') && (
                          <button className="px-4 py-2 bg-[#8BAE5A] text-[#1A2A1A] rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors">
                            Start Integratie
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
                <LinkIcon className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Week 4</div>
                <div className="text-[#8BAE5A] text-sm">Integratie</div>
              </div>
              
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{completedToday}</div>
                <div className="text-[#8BAE5A] text-sm">Integratie Voltooid</div>
              </div>
              
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <ChartBarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
                <div className="text-[#8BAE5A] text-sm">Maand Voortgang</div>
              </div>
            </div>

            {/* Monthly Progress Summary */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-lg font-bold text-white mb-4">Maand 1 Voortgang Samenvatting</h3>
              <div className="h-48 bg-[#1A2A1A] rounded-lg flex items-center justify-center border border-[#3A4D23]/40">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-[#8BAE5A] mx-auto mb-2" />
                  <p className="text-[#8BAE5A]">Maandelijkse voortgang dashboard komt binnenkort</p>
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
                  <span className="text-green-500 text-3xl">🎯</span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Maand 1 Voltooid!</h3>
                <p className="text-[#8BAE5A] mb-4">
                  Gefeliciteerd! Je hebt de eerste maand van je Mind & Focus programma afgerond!
                </p>
                
                <div className="bg-[#8BAE5A]/10 border border-[#8BAE5A]/20 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-[#8BAE5A] mb-2">Wat gebeurt er nu?</h4>
                  <ul className="text-sm text-[#8BAE5A] space-y-1 text-left">
                    <li>• Maand 1 integratie voltooid</li>
                    <li>• Maand 2 wordt automatisch ontgrendeld</li>
                    <li>• Geavanceerde technieken beschikbaar</li>
                    <li>• Maandelijkse voortgang opgeslagen</li>
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
                    'Start Maand 2'
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
