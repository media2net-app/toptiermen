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
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  category: 'morning' | 'afternoon' | 'evening';
  type: 'focus' | 'breathing' | 'assessment';
}

interface WeekProgress {
  week: number;
  totalTasks: number;
  completedTasks: number;
  streak: number;
  lastCompleted: string | null;
}

export default function Week1Page() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: 'morning-focus',
      title: 'Ochtend Focus Training',
      description: 'Start je dag met 5 minuten focus training om je aandacht te trainen',
      duration: 5,
      completed: false,
      category: 'morning',
      type: 'focus'
    },
    {
      id: 'breathing-exercise',
      title: 'Ademhalingsoefening',
      description: 'Doe 5 minuten ademhalingsoefeningen voor stress reductie',
      duration: 5,
      completed: false,
      category: 'morning',
      type: 'breathing'
    },
    {
      id: 'stress-assessment',
      title: 'Stress Assessment',
      description: 'Vul je dagelijkse stress level in (1-10 schaal)',
      duration: 2,
      completed: false,
      category: 'evening',
      type: 'assessment'
    }
  ]);
  
  const [weekProgress, setWeekProgress] = useState<WeekProgress>({
    week: 1,
    totalTasks: 21, // 3 taken x 7 dagen
    completedTasks: 0,
    streak: 0,
    lastCompleted: null
  });

  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(15); // Minimaal 15 van 21 taken
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'tasks', label: 'Dagelijkse Taken', icon: <CheckCircleIcon className="w-5 h-5" /> },
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
          completedWeek: 1,
          currentActiveWeek: 2
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Week 1 completed successfully:', result.data);
        // Navigate back to dashboard
        router.push('/dashboard/mind-focus');
      } else {
        console.error('❌ Failed to complete week 1:', result.error);
        alert('Er is een fout opgetreden bij het voltooien van Week 1. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('❌ Error completing week 1:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-white">Week 1 - Focus Training</h1>
            <p className="text-[#8BAE5A] mt-1">Je eerste week van het Mind & Focus traject</p>
          </div>
        </div>

        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 rounded-xl p-6 mb-6 border border-[#8BAE5A]/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Vandaag's Voortgang</h2>
              <p className="text-[#8BAE5A] text-sm">Voltooi je dagelijkse taken om je streak te behouden</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{completedToday}/{totalToday}</div>
              <div className="text-sm text-[#8BAE5A]">Taken voltooid</div>
            </div>
          </div>
          <div className="w-full bg-[#3A4D23] rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8BAE5A]">Streak: {currentStreak} dagen</span>
            <span className="text-white">Doel: {weeklyGoal}/21 taken deze week</span>
          </div>
        </div>

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
            {/* Week Goals */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4">Week 1 Doelen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <CpuChipIcon className="w-6 h-6 text-blue-500" />
                    <h4 className="font-semibold text-white">Focus Training</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">3x per week basis concentratie training</p>
                </div>
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <HeartIcon className="w-6 h-6 text-green-500" />
                    <h4 className="font-semibold text-white">Ademhalingsoefeningen</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Dagelijks 5 minuten voor stress reductie</p>
                </div>
                <div className="bg-[#1A2A1A] rounded-lg p-4 border border-[#3A4D23]/40">
                  <div className="flex items-center gap-3 mb-2">
                    <ChartBarIcon className="w-6 h-6 text-purple-500" />
                    <h4 className="font-semibold text-white">Stress Assessment</h4>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">Dagelijks je stress level bijhouden</p>
                </div>
              </div>
            </div>

            {/* Daily Tasks Preview */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4">Vandaag's Taken</h3>
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
                         task.category === 'afternoon' ? 'Middag' : 'Avond'}
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
            {['morning', 'afternoon', 'evening'].map((category) => {
              const categoryTasks = dailyTasks.filter(task => task.category === category);
              const completedCategory = categoryTasks.filter(task => task.completed).length;
              
              return (
                <div key={category} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white capitalize">
                      {category === 'morning' ? 'Ochtend' : 
                       category === 'afternoon' ? 'Middag' : 'Avond'} Taken
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
                               task.category === 'afternoon' ? 'Middag' : 'Avond'}
                            </span>
                          </div>
                        </div>
                        
                        {task.type === 'focus' && (
                          <button className="px-4 py-2 bg-[#8BAE5A] text-[#1A2A1A] rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors">
                            Start Sessie
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
                <FireIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{currentStreak}</div>
                <div className="text-[#8BAE5A] text-sm">Dagen Streak</div>
              </div>
              
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{weekProgress.completedTasks}</div>
                <div className="text-[#8BAE5A] text-sm">Taken Voltooid</div>
              </div>
              
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <ChartBarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round((weekProgress.completedTasks / weekProgress.totalTasks) * 100)}%</div>
                <div className="text-[#8BAE5A] text-sm">Week Voortgang</div>
              </div>
            </div>

            {/* Progress Chart Placeholder */}
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-lg font-bold text-white mb-4">Week 1 Voortgang</h3>
              <div className="h-48 bg-[#1A2A1A] rounded-lg flex items-center justify-center border border-[#3A4D23]/40">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-[#8BAE5A] mx-auto mb-2" />
                  <p className="text-[#8BAE5A]">Voortgang grafiek komt binnenkort</p>
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
                  <span className="text-green-500 text-3xl">🎉</span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Gefeliciteerd!</h3>
                <p className="text-[#8BAE5A] mb-4">
                  Je hebt alle taken van Week 1 voltooid!
                </p>
                
                <div className="bg-[#8BAE5A]/10 border border-[#8BAE5A]/20 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-[#8BAE5A] mb-2">Wat gebeurt er nu?</h4>
                  <ul className="text-sm text-[#8BAE5A] space-y-1 text-left">
                    <li>• Week 1 wordt gemarkeerd als voltooid</li>
                    <li>• Week 2 wordt automatisch ontgrendeld</li>
                    <li>• Je kunt nu verder met de volgende fase</li>
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
