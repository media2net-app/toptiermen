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
  const [showWeekCompletionModal, setShowWeekCompletionModal] = useState(false);
  const [weekCompletionData, setWeekCompletionData] = useState<any>(null);

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

      // Load week completions from database
      if (data.hasActiveSchema && data.schema?.id) {
        try {
          console.log('📅 Loading week completions...');
          const weekResponse = await fetch(`/api/week-completion?userId=${user.id}&schemaId=${data.schema.id}`);
          const weekData = await weekResponse.json();
          
          if (weekData.success && weekData.completions) {
            console.log('✅ Week completions loaded:', weekData.completions.length);
            
            // Convert database completions to local format
            const loadedCompletedWeeks = weekData.completions.map((completion: any) => ({
              week: completion.week_number,
              completedAt: completion.completed_at,
              days: completion.completed_days || []
            }));
            
            setCompletedWeeks(loadedCompletedWeeks);
          }
        } catch (error) {
          console.error('❌ Error loading week completions:', error);
        }
      }

      // Check if all days are completed and handle week progression (only if modal is not open)
      if (data.hasActiveSchema && data.days && !showWeekCompletionModal) {
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
  const checkWeekCompletion = async (days: any[]) => {
    // Don't check if modal is already open
    if (showWeekCompletionModal) {
      console.log('⏸️ Week completion modal already open, skipping check');
      return;
    }
    
    const allDaysCompleted = days.every(day => day.isCompleted);
    
    if (allDaysCompleted) {
      console.log('🎉 All days completed! Checking if week completion exists...');
      
      // Calculate the correct week number based on completed weeks
      const nextWeekNumber = completedWeeks.length + 1;
      
      // Check if modal should be shown (not already closed)
      if (user && trainingData?.schema?.id) {
        try {
          const modalResponse = await fetch(`/api/week-completion-modal-views?userId=${user.id}&schemaId=${trainingData.schema.id}&weekNumber=${nextWeekNumber}`);
          const modalData = await modalResponse.json();
          
          if (modalData.success && !modalData.canShow) {
            console.log('📋 Modal was already closed for this week, skipping modal');
            return;
          }
          
          // Record that modal is being shown
          await fetch('/api/week-completion-modal-views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              schemaId: trainingData.schema.id,
              weekNumber: nextWeekNumber,
              action: 'shown'
            })
          });
        } catch (error) {
          console.error('❌ Error checking modal view status:', error);
        }
      }
      
      console.log('🎉 Showing week completion modal...');
      
      // Prepare week completion data
      const weekData = {
        week: nextWeekNumber,
        completedAt: new Date().toISOString(),
        days: days.map(day => ({
          day: day.day_number,
          name: day.name,
          completedAt: day.completedAt
        }))
      };
      
      // Show the completion modal instead of automatically progressing
      setWeekCompletionData(weekData);
      setShowWeekCompletionModal(true);
    }
  };

  // Function to start a new week
  const startNewWeek = async () => {
    if (!user || !trainingData?.schema?.id || !days) return;
    
    try {
      console.log('🔄 Starting new week...');
      
      // Create week completion data from current days
      const currentWeekNumber = completedWeeks.length + 1;
      const weekCompletionData = {
        week: currentWeekNumber,
        completedAt: new Date().toISOString(),
        days: days.map(day => ({
          day: day.day_number,
          name: day.name,
          completedAt: day.completedAt
        }))
      };
      
      // Record modal close and save week completion to database
      try {
        console.log('💾 Recording modal close and saving week completion...');
        
        // Record that modal was closed (via Start New Week button)
        await fetch('/api/week-completion-modal-views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            schemaId: trainingData.schema.id,
            weekNumber: weekCompletionData.week,
            action: 'closed'
          })
        });
        
        // Save week completion to database
        const response = await fetch('/api/week-completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            schemaId: trainingData.schema.id,
            weekNumber: weekCompletionData.week,
            completedAt: weekCompletionData.completedAt,
            completedDays: weekCompletionData.days
          })
        });

        if (response.ok) {
          console.log('✅ Week completion and modal close recorded');
        } else {
          console.error('❌ Failed to save week completion:', response.status);
        }
      } catch (error) {
        console.error('❌ Error saving week completion:', error);
      }
      
      // Add completed week to the list
      setCompletedWeeks(prev => [...prev, weekCompletionData]);
      
      // Update current week first
      const nextWeekNumber = weekCompletionData.week + 1;
      if (nextWeekNumber <= 8) {
        setCurrentWeek(nextWeekNumber);
      } else {
        console.log('🏆 All 8 weeks completed! Congratulations!');
        setCurrentWeek(8);
      }
      
      // Close modal immediately to prevent re-triggering
      setShowWeekCompletionModal(false);
      setWeekCompletionData(null);
      
      // Call API to reset all days
      const requestBody = {
        userId: user.id,
        schemaId: trainingData.schema.id
      };
      
      console.log('🔍 [FRONTEND] Sending reset request:', {
        userId: requestBody.userId,
        schemaId: requestBody.schemaId,
        userIdType: typeof requestBody.userId,
        schemaIdType: typeof requestBody.schemaId
      });
      
      const response = await fetch('/api/reset-training-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        console.log('✅ Days reset for new week');
        
        // Reload data after a short delay to ensure API call is processed
        setTimeout(() => {
        loadTrainingData();
        }, 500);
        
        toast.success(`Week ${weekCompletionData.week} voltooid! Nieuwe week gestart.`);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to reset days for new week:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        toast.error(`Fout bij het starten van nieuwe week: ${errorData.error || 'Onbekende fout'}`);
      }
    } catch (error) {
      console.error('❌ Error starting new week:', error);
      toast.error('Fout bij het starten van nieuwe week');
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
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <p className="text-[#8BAE5A] text-xs sm:text-sm md:text-base lg:text-lg">Jouw actieve trainingsschema en voortgang</p>
          </div>

        {/* Schema Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 md:gap-8">
            <div className="flex-1">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 leading-tight">{schema?.name}</h2>
                    <p className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 leading-relaxed">{schema?.description}</p>
              </div>
                  {schema?.cover_image && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[#3A4D23] rounded-lg sm:rounded-xl overflow-hidden ml-2 sm:ml-3 md:ml-4 flex-shrink-0">
                      <img 
                        src={schema.cover_image} 
                        alt={schema.name}
                        className="w-full h-full object-cover"
                      />
            </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="bg-[#0F1419]/50 rounded-lg p-2 sm:p-3">
                    <span className="text-[#8BAE5A] font-semibold text-xs sm:text-sm">Categorie</span>
                    <p className="text-white text-xs sm:text-sm md:text-base">{schema?.category}</p>
                  </div>
                  <div className="bg-[#0F1419]/50 rounded-lg p-2 sm:p-3">
                    <span className="text-[#8BAE5A] font-semibold text-xs sm:text-sm">Doel</span>
                    <p className="text-white text-xs sm:text-sm md:text-base">{schema?.training_goal || 'Algemeen'}</p>
                  </div>
                </div>
              </div>
              
              {progress && (
                <div className="text-center lg:text-right mt-4 lg:mt-0">
                  <div className="bg-[#0F1419]/50 rounded-xl p-3 sm:p-4 md:p-6">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#8BAE5A] mb-1 sm:mb-2">
                      {progress.completed_days}/{progress.total_days}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Dagen voltooid</div>
                    <div className="w-full sm:w-40 md:w-48 h-2 sm:h-3 bg-[#3A4D23] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.completed_days / progress.total_days) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700]"
                      />
                    </div>
                    <div className="mt-3 sm:mt-4 text-xs text-gray-500">
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
              className="mb-4 sm:mb-6 md:mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Trainingsdagen</h2>
                  <p className="text-[#8BAE5A] text-xs sm:text-sm mt-1">
                    Huidige Week: {completedWeeks.length + 1}/8
                  </p>
                </div>
                <button
                  onClick={viewSchemaDetails}
                  className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors text-xs sm:text-sm"
                >
                  <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Bekijk Schema Details</span>
                  <span className="sm:hidden">Details</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
                      className={`relative p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isCurrentDay
                          ? 'border-[#8BAE5A] bg-[#232D1A] shadow-lg'
                        : isCompleted
                          ? 'border-green-500 bg-green-900/20 shadow-green-500/20 shadow-lg'
                          : 'border-[#3A4D23] bg-[#1A1A1A] hover:border-[#5A6D43] hover:shadow-md'
                    }`}
                    onClick={() => setSelectedDay(day.day_number)}
                  >
                    {isCompleted && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 flex flex-col items-end">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckIcon className="w-2 h-2 sm:w-3 sm:h-3 md:w-5 md:h-5 text-white" />
                          </div>
                          {day.completedAt && (
                            <div className="text-xs text-green-400 mt-1 font-medium text-right hidden sm:block">
                              <div className="text-xs">Voltooid</div>
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
                    
                      <div className="mb-3 sm:mb-4">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Dag {day.day_number}</h3>
                      {isNextDay && (
                            <span className="text-xs bg-[#8BAE5A] text-[#232D1A] px-2 py-1 rounded-full font-semibold">
                          Volgende
                        </span>
                      )}
                    </div>
                        <h4 className="text-[#8BAE5A] font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{day.name}</h4>
                        {day.focus_area && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">{day.focus_area}</p>
                        )}
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <FireIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{exerciseCount} oefeningen</span>
                        </div>
                      </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startWorkout(day.day_number);
                      }}
                        className={`w-full px-3 py-2 sm:px-4 sm:py-3 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center text-xs sm:text-sm md:text-base ${
                          isCompleted
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] hover:from-[#7A9D4A] hover:to-[#e0903f]'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Opnieuw Doen</span>
                            <span className="sm:hidden">Opnieuw</span>
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Start Training</span>
                            <span className="sm:hidden">Start</span>
                          </>
                        )}
                    </button>
                    </motion.div>
                );
              })}
            </div>
            </motion.div>
        )}

        {/* Start New Week Button - Show when all days are completed */}
        {trainingData?.hasActiveSchema && days && days.every(day => day.isCompleted) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 border border-[#8BAE5A]/30 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="w-8 h-8 text-[#181F17]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Week {completedWeeks.length + 1} Voltooid! 🎉</h3>
                <p className="text-gray-300">Alle trainingsdagen zijn succesvol afgerond. Klaar voor de volgende week?</p>
              </div>
              
              <button
                onClick={startNewWeek}
                className="px-8 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Nieuwe Week
              </button>
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
          className="mt-4 sm:mt-6 md:mt-8"
        >
          <div className="bg-[#232D1A] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-[#3A4D23]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Week Overzicht</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 md:gap-4">
                <span className="text-[#8BAE5A] font-semibold text-xs sm:text-sm md:text-base">
                  Huidige Week: {completedWeeks.length + 1}/8
                </span>
                <span className="text-gray-400 text-xs sm:text-sm md:text-base">
                  Voltooide weken: {completedWeeks.length}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-[500px] sm:min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#3A4D23]">
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-[#8BAE5A] font-semibold text-xs sm:text-sm">Week</th>
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-[#8BAE5A] font-semibold text-xs sm:text-sm hidden md:table-cell">Voltooid Op</th>
                    {days?.map((day) => (
                      <th key={day.day_number} className="text-left py-2 sm:py-3 px-1 text-[#8BAE5A] font-semibold text-xs sm:text-sm">
                        <span className="hidden sm:inline">Dag {day.day_number}</span>
                        <span className="sm:hidden">D{day.day_number}</span>
                      </th>
                    ))}
                    <th className="text-left py-2 sm:py-3 px-1 sm:px-2 md:px-4 text-[#8BAE5A] font-semibold text-xs sm:text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedWeeks.map((week, index) => (
                    <tr key={`completed-week-${week.week}-${index}`} className="border-b border-[#3A4D23]/50 hover:bg-[#1A1A1A]/50">
                      <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-2 h-2 sm:w-3 sm:h-3 md:w-5 md:h-5 text-white" />
                          </div>
                          <span className="text-white font-semibold text-xs sm:text-sm md:text-base">Week {week.week}</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-4 text-gray-300 text-xs sm:text-sm md:text-base hidden md:table-cell">
                        {new Date(week.completedAt).toLocaleDateString('nl-NL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      {days?.map((day) => {
                        const dayData = week.days.find(d => d.day === day.day_number);
                        return (
                          <td key={day.day_number} className="py-2 sm:py-3 md:py-4 px-1">
                            {dayData ? (
                              <div className="flex items-center gap-1 sm:gap-2">
                                <CheckIcon className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-green-400" />
                                <div className="text-xs text-gray-300 hidden sm:block">
                                  {dayData.name}
                                  <br />
                                  <span className="text-green-400">
                                    {new Date(dayData.completedAt).toLocaleTimeString('nl-NL', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div className="sm:hidden">
                                  <div className="text-green-400 text-xs">
                                    {new Date(dayData.completedAt).toLocaleTimeString('nl-NL', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs sm:text-sm md:text-base">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-4">
                        <span className="inline-flex items-center px-1 sm:px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-500/20">
                          Voltooid
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Show current week row if not completed */}
                  {completedWeeks.length < 8 && (
                    <tr key={`current-week-${completedWeeks.length + 1}`} className="border-b border-[#3A4D23]/50">
                      <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                            <span className="text-[#181F17] font-bold text-xs sm:text-sm md:text-base">{completedWeeks.length + 1}</span>
                          </div>
                          <span className="text-white font-semibold text-xs sm:text-sm md:text-base">Week {completedWeeks.length + 1}</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-4 text-gray-500 text-xs sm:text-sm md:text-base hidden md:table-cell">-</td>
                      {days?.map((day) => {
                        return (
                          <td key={day.day_number} className="py-2 sm:py-3 md:py-4 px-1">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {day.isCompleted ? (
                                <>
                                  <CheckIcon className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-green-400" />
                                  <div className="text-xs text-gray-300 hidden sm:block">
                                    {day.name}
                                    <br />
                                    <span className="text-green-400">
                                      {day.completedAt && new Date(day.completedAt).toLocaleTimeString('nl-NL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <div className="sm:hidden">
                                    <div className="text-green-400 text-xs">
                                      {day.completedAt && new Date(day.completedAt).toLocaleTimeString('nl-NL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 border-2 border-[#8BAE5A] rounded-full"></div>
                                  <span className="text-xs text-gray-400 hidden sm:inline">{day.name}</span>
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-4">
                        <span className="inline-flex items-center px-1 sm:px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-[#8BAE5A]/20 text-[#8BAE5A] border border-[#8BAE5A]/20">
                          In Progress
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
        </div>
            
            {/* Start New Week Button - Show when current week is completed */}
            {days && days.every(day => day.isCompleted) && completedWeeks.length < 8 && !showWeekCompletionModal && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-[#8BAE5A]/10 to-[#FFD700]/10 rounded-lg border border-[#8BAE5A]/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center">
                      <span className="text-[#181F17] font-bold text-sm sm:text-base">🎉</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white">Week {completedWeeks.length + 1} Voltooid!</h4>
                      <p className="text-gray-300 text-sm sm:text-base">Alle trainingsdagen zijn voltooid. Klaar voor de volgende week?</p>
                    </div>
                  </div>
                  <button
                    onClick={startNewWeek}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg"
                  >
                    Start Nieuwe Week
                  </button>
                </div>
              </div>
            )}

            {completedWeeks.length >= 8 && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-[#8BAE5A]/10 to-[#FFD700]/10 rounded-lg border border-[#8BAE5A]/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center">
                    <span className="text-[#181F17] font-bold text-sm sm:text-base">🏆</span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">Gefeliciteerd!</h4>
                    <p className="text-gray-300 text-sm sm:text-base">Je hebt alle 8 weken van dit schema voltooid. Tijd voor het volgende niveau!</p>
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
          estimatedDuration="30 min"
          user={user}
        />
      )}
      </AnimatePresence>

      {/* Week Completion Modal */}
      <AnimatePresence>
        {showWeekCompletionModal && weekCompletionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl mx-2 sm:mx-4"
            >
              <div className="text-center">
                {/* Success Icon */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                  <TrophyIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#181F17]" />
                </div>
                
                {/* Title */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
                  🎉 Week {weekCompletionData.week} Voltooid!
                </h2>
                
                {/* Description */}
                <p className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 md:mb-6">
                  Gefeliciteerd! Je hebt alle trainingsdagen van week {weekCompletionData.week} succesvol voltooid.
                </p>
                
                {/* Week Stats */}
                <div className="bg-[#0F1419]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-[#8BAE5A] font-semibold text-xs sm:text-sm">Voltooide Dagen</span>
                      <p className="text-white text-lg sm:text-xl md:text-2xl font-bold">{weekCompletionData.days.length}</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] font-semibold text-xs sm:text-sm">Voltooid Op</span>
                      <p className="text-white text-xs sm:text-sm">
                        {new Date(weekCompletionData.completedAt).toLocaleDateString('nl-NL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Completed Days List */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-2 sm:mb-3">Voltooide Trainingen</h3>
                  <div className="space-y-1 sm:space-y-2">
                    {weekCompletionData.days.map((day: any) => (
                      <div key={day.day} className="flex items-center justify-between bg-[#0F1419]/30 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                          <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" />
                          <span className="text-white font-medium text-xs sm:text-sm">Dag {day.day}: {day.name}</span>
                        </div>
                        <span className="text-green-400 text-xs sm:text-sm">
                          {day.completedAt && new Date(day.completedAt).toLocaleTimeString('nl-NL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Progress Info */}
                <div className="bg-[#8BAE5A]/10 rounded-lg p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6">
                  <p className="text-[#8BAE5A] font-semibold text-xs sm:text-sm md:text-base">
                    Voortgang: {completedWeeks.length + 1}/8 weken
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    {completedWeeks.length + 1 < 8 
                      ? `Nog ${8 - (completedWeeks.length + 1)} weken te gaan!`
                      : 'Je hebt alle weken voltooid! 🏆'
                    }
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-center">
                  <button
                    onClick={async () => {
                      // Record modal close and save week completion to database
                      if (user && trainingData?.schema?.id && weekCompletionData) {
                        try {
                          console.log('💾 Recording modal close and saving week completion...');
                          
                          // Record that modal was closed
                          await fetch('/api/week-completion-modal-views', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userId: user.id,
                              schemaId: trainingData.schema.id,
                              weekNumber: weekCompletionData.week,
                              action: 'closed'
                            })
                          });
                          
                          // Save week completion to database
                          const response = await fetch('/api/week-completion', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userId: user.id,
                              schemaId: trainingData.schema.id,
                              weekNumber: weekCompletionData.week,
                              completedAt: weekCompletionData.completedAt,
                              completedDays: weekCompletionData.days
                            })
                          });

                          if (response.ok) {
                            console.log('✅ Week completion and modal close recorded');
                          } else {
                            console.error('❌ Failed to save week completion:', response.status);
                          }
                        } catch (error) {
                          console.error('❌ Error saving week completion:', error);
                        }
                      }

                      // Close modal
                      setShowWeekCompletionModal(false);
                      setWeekCompletionData(null);
                    }}
                    className="px-8 py-3 sm:px-12 sm:py-4 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
    </PageLayout>
  );
} 