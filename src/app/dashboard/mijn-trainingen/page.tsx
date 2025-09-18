'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LockClosedIcon, 
  PlayIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  ArrowRightIcon, 
  CheckIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  StarIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import PageLayout from '@/components/PageLayout';
import PreWorkoutModal from '../trainingscentrum/PreWorkoutModal';

// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_duration: string;
  cover_image?: string;
  training_goal?: string;
  rep_range?: string;
  equipment_type?: string;
}

interface TrainingDay {
  id: string;
  day_number: number;
  name: string;
  description?: string;
  focus_area?: string;
  isCompleted?: boolean;
  completedAt?: string;
  training_schema_exercises?: {
    id: string;
    exercise_name: string;
    sets: number;
    reps: string;
    rest_time_seconds: number;
    notes?: string;
  }[];
}

interface UserProgress {
  current_day: number;
  completed_days: number;
  total_days: number;
  started_at: string;
  completed_at?: string;
  is_active: boolean;
}

interface TrainingData {
  hasActiveSchema: boolean;
  schema?: TrainingSchema;
  days?: TrainingDay[];
  progress?: UserProgress;
  message?: string;
}

export default function MijnTrainingen() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showPreWorkoutModal, setShowPreWorkoutModal] = useState(false);
  const [selectedDayForWorkout, setSelectedDayForWorkout] = useState<number>(1);
  const [showSchemaDetails, setShowSchemaDetails] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [completedWeeks, setCompletedWeeks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadTrainingData();
    }
  }, [user]);

  // Refresh data when page becomes visible (e.g., after returning from workout)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('🔄 Page became visible, refreshing training data');
        loadTrainingData();
      }
    };

    const handleFocus = () => {
      if (user) {
        console.log('🔄 Page focused, refreshing training data');
        loadTrainingData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const loadTrainingData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🔄 Loading training data for user:', user.id);
      
      const response = await fetch(`/api/user-training-schema?userId=${user.id}`);
      const data = await response.json();
      
      console.log('📊 Training data received:', data);
      setTrainingData(data);
      
      if (data.hasActiveSchema && data.progress) {
        setSelectedDay(data.progress.current_day);
        console.log('✅ Active schema found, current day:', data.progress.current_day);
      }

      // Check if all days are completed and handle week progression
      if (data.hasActiveSchema && data.days) {
        checkWeekCompletion(data.days);
      }
    } catch (error) {
      console.error('❌ Error loading training data:', error);
      toast.error('Fout bij het laden van trainingsgegevens');
    } finally {
      setLoading(false);
    }
  };

  // Function to check if all days are completed and handle week progression
  const checkWeekCompletion = (days: any[]) => {
    const allDaysCompleted = days.every(day => day.isCompleted);
    
    if (allDaysCompleted) {
      console.log('🎉 All days completed! Starting new week...');
      
      // Calculate the correct week number based on completed weeks
      const nextWeekNumber = completedWeeks.length + 1;
      
      // Add current week to completed weeks
      const weekData = {
        week: nextWeekNumber,
        completedAt: new Date().toISOString(),
        days: days.map(day => ({
          day: day.day_number,
          name: day.name,
          completedAt: day.completedAt
        }))
      };
      
      setCompletedWeeks(prev => [...prev, weekData]);
      
      // Reset all days for new week
      resetDaysForNewWeek();
      
      // Update current week
      if (nextWeekNumber < 8) {
        setCurrentWeek(nextWeekNumber + 1);
      } else {
        console.log('🏆 All 8 weeks completed! Congratulations!');
        setCurrentWeek(8);
      }
    }
  };

  // Function to reset all days for a new week
  const resetDaysForNewWeek = async () => {
    if (!user || !trainingData?.schema?.id) return;
    
    try {
      console.log('🔄 Resetting days for new week...');
      
      // Call API to reset all days
      const response = await fetch('/api/reset-training-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          schemaId: trainingData.schema.id
        })
      });
      
      if (response.ok) {
        console.log('✅ Days reset for new week');
        // Reload training data to reflect changes
        loadTrainingData();
      } else {
        console.error('❌ Failed to reset days for new week');
      }
    } catch (error) {
      console.error('❌ Error resetting days:', error);
    }
  };

  const startWorkout = (dayNumber: number) => {
    if (!trainingData?.schema) return;
    
    console.log('🚀 Starting workout for day:', dayNumber);
    setSelectedDayForWorkout(dayNumber);
    setShowPreWorkoutModal(true);
  };

  const goToTrainingscentrum = () => {
    router.push('/dashboard/trainingsschemas');
  };

  const viewSchemaDetails = () => {
    if (trainingData?.schema) {
      router.push(`/dashboard/trainingsschemas/${trainingData.schema.id}`);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Mijn Trainingen">
        <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                <p className="text-[#8BAE5A]">Laden van trainingsgegevens...</p>
              </div>
            </div>
                  </div>
      </div>
      </PageLayout>
    );
  }

  // No active schema state
  if (!trainingData?.hasActiveSchema) {
    return (
      <PageLayout title="Mijn Trainingen">
        <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Mijn Trainingen</h1>
              <p className="text-[#8BAE5A] text-lg">Persoonlijke trainingsschema's en voortgang</p>
            </div>

            {/* Lock State */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-2xl p-12 text-center shadow-xl"
            >
              <div className="mb-8">
                <div className="w-24 h-24 bg-[#3A4D23] rounded-full flex items-center justify-center mx-auto mb-6">
                  <LockClosedIcon className="w-12 h-12 text-[#8BAE5A]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Geen Actief Trainingsschema</h2>
                <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                  Je hebt nog geen trainingsschema geselecteerd. Ga naar het trainingscentrum om een schema te kiezen dat bij jou past.
                </p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={goToTrainingscentrum}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ArrowRightIcon className="w-6 h-6 mr-2" />
                  Ga naar Trainingscentrum
                </button>
                
                <div className="text-sm text-gray-500">
                  <p>Kies een schema dat past bij jouw doelen en niveau</p>
                </div>
              </div>
            </motion.div>

            {/* Benefits */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#181F17] border border-[#3A4D23]/30 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Gestructureerde Training</h3>
                <p className="text-gray-400 text-sm">Volg een bewezen schema met duidelijke doelen en progressie</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#181F17] border border-[#3A4D23]/30 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Voortgang Tracking</h3>
                <p className="text-gray-400 text-sm">Houd je prestaties bij en zie je vooruitgang over tijd</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#181F17] border border-[#3A4D23]/30 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-[#f0a14f]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayIcon className="w-6 h-6 text-[#f0a14f]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Direct Starten</h3>
                <p className="text-gray-400 text-sm">Begin direct met trainen zodra je schema is geselecteerd</p>
              </motion.div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Active schema state
  const { schema, days, progress } = trainingData;

  return (
    <PageLayout title="Mijn Trainingen">
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Mijn Trainingen</h1>
            <p className="text-[#8BAE5A] text-lg">Jouw actieve trainingsschema en voortgang</p>
          </div>

        {/* Schema Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-2xl p-8 mb-8 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{schema?.name}</h2>
                    <p className="text-gray-400 text-lg mb-4">{schema?.description}</p>
              </div>
                  {schema?.cover_image && (
                    <div className="w-24 h-24 bg-[#3A4D23] rounded-xl overflow-hidden ml-4">
                      <img 
                        src={schema.cover_image} 
                        alt={schema.name}
                        className="w-full h-full object-cover"
                      />
            </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-[#0F1419]/50 rounded-lg p-3">
                    <span className="text-[#8BAE5A] font-semibold">Categorie</span>
                    <p className="text-white">{schema?.category}</p>
                  </div>
                  <div className="bg-[#0F1419]/50 rounded-lg p-3">
                    <span className="text-[#FFD700] font-semibold">Niveau</span>
                    <p className="text-white">{schema?.difficulty}</p>
                  </div>
                  <div className="bg-[#0F1419]/50 rounded-lg p-3">
                    <span className="text-[#f0a14f] font-semibold">Duur</span>
                    <p className="text-white">{schema?.estimated_duration}</p>
                  </div>
                  <div className="bg-[#0F1419]/50 rounded-lg p-3">
                    <span className="text-[#8BAE5A] font-semibold">Doel</span>
                    <p className="text-white">{schema?.training_goal || 'Algemeen'}</p>
                  </div>
                </div>
              </div>
              
              {progress && (
                <div className="text-center lg:text-right">
                  <div className="bg-[#0F1419]/50 rounded-xl p-6">
                    <div className="text-4xl font-bold text-[#8BAE5A] mb-2">
                      {progress.completed_days}/{progress.total_days}
                    </div>
                    <div className="text-sm text-gray-400 mb-4">Dagen voltooid</div>
                    <div className="w-48 h-3 bg-[#3A4D23] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.completed_days / progress.total_days) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700]"
                      />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      Gestart: {new Date(progress.started_at).toLocaleDateString('nl-NL')}
                  </div>
                </div>
              </div>
            )}
          </div>
          </motion.div>

        {/* Training Days */}
        {days && days.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Trainingsdagen</h2>
                <button
                  onClick={viewSchemaDetails}
                  className="flex items-center px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Bekijk Schema Details
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {days.sort((a, b) => a.day_number - b.day_number).map((day, index) => {
                  // Use day-specific completion status if available, otherwise fall back to progress-based calculation
                  const isCompleted = day.isCompleted !== undefined ? day.isCompleted : (progress ? day.day_number <= progress.completed_days : false);
                const isCurrentDay = day.day_number === selectedDay;
                const isNextDay = progress ? day.day_number === progress.current_day : false;
                  const exerciseCount = day.training_schema_exercises?.length || 0;

                return (
                    <motion.div
                    key={day.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isCurrentDay
                          ? 'border-[#8BAE5A] bg-[#232D1A] shadow-lg'
                        : isCompleted
                          ? 'border-green-500 bg-green-900/20 shadow-green-500/20 shadow-lg'
                          : 'border-[#3A4D23] bg-[#1A1A1A] hover:border-[#5A6D43] hover:shadow-md'
                    }`}
                    onClick={() => setSelectedDay(day.day_number)}
                  >
                    {isCompleted && (
                        <div className="absolute top-4 right-4 flex flex-col items-end">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckIcon className="w-5 h-5 text-white" />
                          </div>
                          {day.completedAt && (
                            <div className="text-xs text-green-400 mt-1 font-medium text-right">
                              <div>Voltooid</div>
                              <div className="text-green-300/80 text-[10px] mt-0.5">
                                {new Date(day.completedAt).toLocaleDateString('nl-NL', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </div>
                              <div className="text-green-300/80 text-[10px]">
                                {new Date(day.completedAt).toLocaleTimeString('nl-NL', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                    
                      <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">Dag {day.day_number}</h3>
                      {isNextDay && (
                            <span className="text-xs bg-[#8BAE5A] text-[#232D1A] px-3 py-1 rounded-full font-semibold">
                          Volgende
                        </span>
                      )}
                    </div>
                        <h4 className="text-[#8BAE5A] font-semibold text-lg mb-2">{day.name}</h4>
                        {day.focus_area && (
                    <p className="text-sm text-gray-400 mb-3">{day.focus_area}</p>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <FireIcon className="w-4 h-4 mr-1" />
                          <span>{exerciseCount} oefeningen</span>
                        </div>
                      </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startWorkout(day.day_number);
                      }}
                        className={`w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] hover:from-[#7A9D4A] hover:to-[#e0903f]'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckIcon className="w-5 h-5 mr-2" />
                            Opnieuw Doen
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-5 h-5 mr-2" />
                      Start Training
                          </>
                        )}
                    </button>
                    </motion.div>
                );
              })}
            </div>
            </motion.div>
        )}

        </div>
      </div>

      {/* Week Overview Table - Always visible */}
      {trainingData?.hasActiveSchema && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Week Overzicht</h3>
              <div className="flex items-center gap-4">
                <span className="text-[#8BAE5A] font-semibold">
                  Huidige Week: {completedWeeks.length + 1}/8
                </span>
                <span className="text-gray-400">
                  Voltooide weken: {completedWeeks.length}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3A4D23]">
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Week</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Voltooid Op</th>
                    {days?.map((day) => (
                      <th key={day.day_number} className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">
                        Dag {day.day_number}
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedWeeks.map((week, index) => (
                    <tr key={week.week} className="border-b border-[#3A4D23]/50 hover:bg-[#1A1A1A]/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white font-semibold">Week {week.week}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {new Date(week.completedAt).toLocaleDateString('nl-NL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      {days?.map((day) => {
                        const dayData = week.days.find(d => d.day === day.day_number);
                        return (
                          <td key={day.day_number} className="py-4 px-4">
                            {dayData ? (
                              <div className="flex items-center gap-2">
                                <CheckIcon className="w-4 h-4 text-green-400" />
                                <div className="text-xs text-gray-300">
                                  {dayData.name}
                                  <br />
                                  <span className="text-green-400">
                                    {new Date(dayData.completedAt).toLocaleTimeString('nl-NL', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-500/20">
                          Voltooid
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Show current week row if not completed */}
                  {completedWeeks.length < 8 && (
                    <tr className="border-b border-[#3A4D23]/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                            <span className="text-[#181F17] font-bold text-sm">{completedWeeks.length + 1}</span>
                          </div>
                          <span className="text-white font-semibold">Week {completedWeeks.length + 1}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">-</td>
                      {days?.map((day) => {
                        return (
                          <td key={day.day_number} className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {day.isCompleted ? (
                                <>
                                  <CheckIcon className="w-4 h-4 text-green-400" />
                                  <div className="text-xs text-gray-300">
                                    {day.name}
                                    <br />
                                    <span className="text-green-400">
                                      {day.completedAt && new Date(day.completedAt).toLocaleTimeString('nl-NL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-4 h-4 border-2 border-[#8BAE5A] rounded-full"></div>
                                  <span className="text-xs text-gray-400">{day.name}</span>
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#8BAE5A]/20 text-[#8BAE5A] border border-[#8BAE5A]/20">
                          In Progress
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
        </div>
            
            {completedWeeks.length >= 8 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#8BAE5A]/10 to-[#FFD700]/10 rounded-lg border border-[#8BAE5A]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center">
                    <span className="text-[#181F17] font-bold">🏆</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Gefeliciteerd!</h4>
                    <p className="text-gray-300">Je hebt alle 8 weken van dit schema voltooid. Tijd voor het volgende niveau!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Pre-Workout Modal */}
      <AnimatePresence>
        {showPreWorkoutModal && trainingData?.schema && (
        <PreWorkoutModal
          isOpen={showPreWorkoutModal}
          onClose={() => setShowPreWorkoutModal(false)}
          schemaId={trainingData.schema.id}
          dayNumber={selectedDayForWorkout}
          schemaName={trainingData.schema.name}
          focusArea={trainingData.days?.find(d => d.day_number === selectedDayForWorkout)?.focus_area || 'Training'}
          estimatedDuration={trainingData.schema.estimated_duration}
        />
      )}
      </AnimatePresence>
    </PageLayout>
  );
} 