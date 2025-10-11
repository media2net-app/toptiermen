'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalBase from '@/components/ui/ModalBase';
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
  PencilIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import { useSubscription } from '@/hooks/useSubscription';
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
  schema_nummer?: number;
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
  const { stopWorkout } = useWorkoutSession();
  const { hasAccess, isBasic, loading: subscriptionLoading, isAdmin } = useSubscription();
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
  const weekCompletionRef = useRef<HTMLDivElement | null>(null);
  const [isStartingNewWeek, setIsStartingNewWeek] = useState(false);

  // Debug function to log current state
  const debugWeekState = () => {
    console.log('🔍 DEBUG WEEK STATE:');
    console.log('📊 completedWeeks:', completedWeeks);
    console.log('📊 completedWeeks.length:', completedWeeks.length);
    console.log('📊 weekCompletionData:', weekCompletionData);
    console.log('📊 showWeekCompletionModal:', showWeekCompletionModal);
    if (completedWeeks.length > 0) {
      const maxWeek = Math.max(...completedWeeks.map((week: any) => week.week || week.weekNumber || 0));
      console.log('📊 maxWeekNumber:', maxWeek);
      console.log('📊 nextWeekNumber would be:', maxWeek + 1);
    }
  };

  // Helper to mark current schema completed (Schema 2) and navigate focusing Schema 3
  const completeSchemaAndGoToSchema3 = async () => {
    if (!user || !trainingData?.schema?.id) {
      router.push('/dashboard/trainingsschemas');
      return;
    }
    try {
      // Mark schema as completed (8 weeks)
      await fetch('/api/schema-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          schemaId: trainingData.schema.id,
          completedWeeks: 8,
          completionDate: new Date().toISOString()
        })
      });
    } catch {}
    // Flag UI to highlight Schema 3 on trainingsschemas page
    try { localStorage.setItem('ttm_focus_schema_3', 'true'); } catch {}
    router.push('/dashboard/trainingsschemas');
  };

  // Helper to mark current schema completed (Schema 1) and navigate to Trainingsschemas (Schema 2 visible)
  const completeSchemaAndGoToSchema2 = async () => {
    if (!user || !trainingData?.schema?.id) {
      router.push('/dashboard/trainingsschemas');
      return;
    }
    try {
      // Mark schema as completed (8 weeks)
      await fetch('/api/schema-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          schemaId: trainingData.schema.id,
          completedWeeks: 8,
          completionDate: new Date().toISOString()
        })
      });
    } catch {}
    // Flag UI to highlight Schema 2 on trainingsschemas page
    try { localStorage.setItem('ttm_focus_schema_2', 'true'); } catch {}
    router.push('/dashboard/trainingsschemas');
  };

  // When the week completion modal opens, scroll to the top so the centered modal is fully visible
  useEffect(() => {
    if (showWeekCompletionModal) {
      // Give the modal a tick to mount before scrolling
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          weekCompletionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch {}
      }, 50);
    }
  }, [showWeekCompletionModal]);

  useEffect(() => {
    // Wait for subscription data to load
    if (subscriptionLoading) {
      return;
    }
    
    // For basic users, skip loading training data and just mark as not loading
    if (isBasic && !isAdmin) {
      console.log('🚫 Basic user detected, skipping training data load');
      setLoading(false);
      return;
    }
    
    // For premium/admin users, load training data
    if (user && (hasAccess('training') || isAdmin)) {
      loadTrainingData();
    } else if (user) {
      // User loaded but no access
      setLoading(false);
    }
  }, [user, subscriptionLoading, isBasic, isAdmin, hasAccess]);

  // Refresh data when page becomes visible (e.g., after returning from workout)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && (hasAccess('training') || isAdmin) && !subscriptionLoading) {
        console.log('🔄 Page became visible, refreshing training data');
        loadTrainingData();
      }
    };

    const handleFocus = () => {
      if (user && (hasAccess('training') || isAdmin) && !subscriptionLoading) {
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
  }, [user, hasAccess, isAdmin, subscriptionLoading]);

  const loadTrainingData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🔄 Loading training data for user:', user.id);
      console.log('📊 Current completedWeeks before load:', completedWeeks.length);
      
      // Add timestamp for cache busting + no-store option
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/user-training-schema?userId=${user.id}&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      
      console.log('📊 Training data received:', data);
      console.log('📊 Days from API:', data.days?.map((d: any) => ({ 
        day: d.day_number, 
        name: d.name, 
        completed: d.isCompleted 
      })));
      setTrainingData(data);
      
      if (data.hasActiveSchema && data.progress) {
        setSelectedDay(data.progress.current_day);
        console.log('✅ Active schema found, current day:', data.progress.current_day);
      }

      // Load week completions from database (with fallback for missing tables)
      let effectiveCompletedWeeks: any[] | null = null;
      if (data.hasActiveSchema && data.schema?.id) {
        try {
          console.log('📅 Loading week completions...');
          const weekTimestamp = new Date().getTime();
          const weekResponse = await fetch(`/api/week-completion?userId=${user.id}&schemaId=${data.schema.id}&t=${weekTimestamp}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          const weekData = await weekResponse.json();
          
          if (weekData.success && weekData.completions) {
            console.log('✅ Week completions loaded from database:', weekData.completions.length);
            console.log('📊 Raw week completions from database:', weekData.completions);
            
            // Convert database completions to local format
            const loadedCompletedWeeksRaw = weekData.completions.map((completion: any) => ({
              week: completion.week_number,
              completedAt: completion.completed_at,
              days: completion.completed_days || []
            }));
            // Dedupe by week number
            const loadedCompletedWeeks = Object.values(
              (loadedCompletedWeeksRaw || []).reduce((acc: any, item: any) => {
                acc[item.week] = item; return acc;
              }, {})
            ).sort((a: any, b: any) => a.week - b.week);
            console.log('📊 Converted & deduped completedWeeks:', loadedCompletedWeeks);
            setCompletedWeeks(loadedCompletedWeeks);
            effectiveCompletedWeeks = loadedCompletedWeeks;
          } else {
            console.log('⚠️ No week completions found in database, using local storage');
            // Try to load from localStorage as fallback
            const localCompletedWeeks = localStorage.getItem(`completedWeeks_${user.id}_${data.schema.id}`);
            if (localCompletedWeeks) {
              try {
                const parsedWeeksRaw = JSON.parse(localCompletedWeeks);
                // Dedupe by week number
                const parsedWeeks = Object.values(
                  (parsedWeeksRaw || []).reduce((acc: any, item: any) => {
                    acc[item.week || item.weekNumber] = {
                      week: item.week || item.weekNumber,
                      completedAt: item.completedAt,
                      days: item.days || []
                    };
                    return acc;
                  }, {})
                ).sort((a: any, b: any) => a.week - b.week);
                console.log('📊 Raw localStorage completedWeeks:', parsedWeeksRaw);
                setCompletedWeeks(parsedWeeks);
                console.log('✅ Week completions loaded from localStorage (deduped):', parsedWeeks.length);
                effectiveCompletedWeeks = parsedWeeks;
              } catch (parseError) {
                console.log('⚠️ Could not parse localStorage week completions');
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Week completions database not available (tables missing), using localStorage fallback');
          // Try to load from localStorage as fallback
          const localCompletedWeeks = localStorage.getItem(`completedWeeks_${user.id}_${data.schema.id}`);
          if (localCompletedWeeks) {
            try {
              const parsedWeeksRaw = JSON.parse(localCompletedWeeks);
              const parsedWeeks = Object.values(
                (parsedWeeksRaw || []).reduce((acc: any, item: any) => {
                  acc[item.week || item.weekNumber] = {
                    week: item.week || item.weekNumber,
                    completedAt: item.completedAt,
                    days: item.days || []
                  };
                  return acc;
                }, {})
              ).sort((a: any, b: any) => a.week - b.week);
              console.log('📊 Raw localStorage completedWeeks (fallback):', parsedWeeksRaw);
              setCompletedWeeks(parsedWeeks);
              console.log('✅ Week completions loaded from localStorage (deduped):', parsedWeeks.length);
              effectiveCompletedWeeks = parsedWeeks;
            } catch (parseError) {
              console.log('⚠️ Could not parse localStorage week completions');
            }
          }
        }
      }

      // Sync DB progress with week completions (only increase) - OPTIMIZED: No reload, just update locally
      try {
        if (data.hasActiveSchema && data.schema?.id) {
          const weeksArr = (effectiveCompletedWeeks || completedWeeks) as any[];
          const weeksCount = Array.isArray(weeksArr) ? weeksArr.length : 0;
          const freqFromDays = Math.max(1, (data.days?.length || 0) || 1);
          const targetCompletedDays = weeksCount * freqFromDays;
          const currentCompletedDays = Number(data?.progress?.completed_days || 0);
          if (targetCompletedDays > currentCompletedDays && user?.email) {
            // Fire and forget - update in background without blocking UI
            fetch('/api/admin/set-training-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                completedDays: targetCompletedDays,
                training_frequency: freqFromDays,
              })
            }).catch(err => console.log('⚠️ Background sync failed:', err));
            
            // Update local state immediately for better UX
            if (data.progress) {
              data.progress.completed_days = targetCompletedDays;
            }
          }
        }
      } catch (syncErr) {
        console.log('⚠️ Could not sync DB progress with completed weeks:', syncErr);
      }

      // Check if all days are completed and handle week progression (only if modal is not open and not starting new week)
      if (data.hasActiveSchema && data.days && !showWeekCompletionModal && !isStartingNewWeek) {
        console.log('📊 Checking week completion with:', {
          daysCount: data.days.length,
          completedDaysCount: data.days.filter((d: any) => d.isCompleted).length,
          effectiveCompletedWeeksLength: (effectiveCompletedWeeks || completedWeeks).length
        });
        checkWeekCompletion(data.days, effectiveCompletedWeeks || completedWeeks);
      } else {
        console.log('⏸️ Skipping week completion check:', {
          hasActiveSchema: data.hasActiveSchema,
          hasDays: !!data.days,
          modalOpen: showWeekCompletionModal,
          isStartingNewWeek: isStartingNewWeek
        });
      }
    } catch (error) {
      console.error('❌ Error loading training data:', error);
      toast.error('Fout bij het laden van trainingsgegevens');
    } finally {
      setLoading(false);
    }
  };

  // Function to check if all days are completed and handle week progression
  const checkWeekCompletion = async (days: any[], overrideCompletedWeeks?: any[]) => {
    console.log('🔍 checkWeekCompletion called with:', {
      daysCount: days.length,
      overrideCompletedWeeksLength: overrideCompletedWeeks?.length,
      modalOpen: showWeekCompletionModal
    });
    
    // Don't check if modal is already open
    if (showWeekCompletionModal) {
      console.log('⏸️ Week completion modal already open, skipping check');
      return;
    }
    
    const allDaysCompleted = days.every(day => day.isCompleted);
    console.log('📊 All days completed?', allDaysCompleted);
    
    if (allDaysCompleted) {
      // Ensure any running workout session is stopped to avoid dangling timers
      try {
        stopWorkout();
      } catch (e) {
        console.log('ℹ️ Could not stop workout (possibly no session):', e);
      }
      console.log('🎉 All days completed! Checking if week completion exists...');
      const effectiveCompletedWeeks = Array.isArray(overrideCompletedWeeks) ? overrideCompletedWeeks : completedWeeks;
      console.log('📊 Using completedWeeks length:', effectiveCompletedWeeks?.length || 0);
      // Calculate the current week number based on the freshest list of completed weeks
      const nextWeekNumber = (effectiveCompletedWeeks?.length || 0) + 1;
      console.log('📊 Calculated nextWeekNumber:', nextWeekNumber);
      
      // Check if modal should be shown (not already closed) - with fallback for missing tables
      if (user && trainingData?.schema?.id) {
        try {
          const modalResponse = await fetch(`/api/week-completion-modal-views?userId=${user.id}&schemaId=${trainingData.schema.id}&weekNumber=${nextWeekNumber}`);
          const modalData = await modalResponse.json();
          
          if (modalData.success && !modalData.canShow) {
            console.log('📋 Modal was already closed for this week, skipping modal');
            return;
          }
          
          // Record that modal is being shown (with error handling for missing tables)
          try {
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
          } catch (modalError) {
            console.log('⚠️ Modal tracking not available (tables missing), continuing anyway');
          }
        } catch (error) {
          console.log('⚠️ Modal tracking not available (tables missing), continuing anyway');
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
      
      // Debug log the state
      console.log('🎉 Week completion modal shown with data:', weekData);
      debugWeekState();
    }
  };

  // Function to start a new week
  const startNewWeek = async () => {
    if (!user || !trainingData?.schema?.id || !days) return;
    
    try {
      console.log('🔄 Starting new week...');
      console.log('📊 Current state:', {
        schemaId: trainingData.schema.id,
        schemaNummer: trainingData.schema.schema_nummer,
        completedWeeksLength: completedWeeks.length,
        completedWeeks: completedWeeks,
        currentWeek: currentWeek,
        daysCount: days?.length
      });
      
      // Set flag to prevent checkWeekCompletion from running during reload
      setIsStartingNewWeek(true);
      
      // Also make sure any lingering workout session is stopped when starting a new week
      try { stopWorkout(); } catch {}
      
      // Create week completion data from current days
      // Use the same robust calculation as in checkWeekCompletion
      let currentWeekNumber = 1;
      if (completedWeeks.length > 0) {
        const maxWeekNumber = Math.max(...completedWeeks.map((week: any) => week.week || week.weekNumber || 0));
        currentWeekNumber = maxWeekNumber + 1;
      }
      console.log('📊 Calculated currentWeekNumber:', currentWeekNumber);
      
      const weekCompletionData = {
        week: currentWeekNumber,
        completedAt: new Date().toISOString(),
        days: days.map(day => ({
          day: day.day_number,
          name: day.name,
          completedAt: day.completedAt
        }))
      };
      console.log('📊 Week completion data to save:', weekCompletionData);
      
      // Record modal close and save week completion to database (with fallback for missing tables)
      try {
        console.log('💾 Recording modal close and saving week completion...');
        
        // Record that modal was closed (via Start New Week button) - with error handling
        try {
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
        } catch (modalError) {
          console.log('⚠️ Modal tracking not available (tables missing), continuing anyway');
        }
        
        // Save week completion to database - with error handling
        try {
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
            console.log('✅ Week completion recorded in database');
          } else {
            console.log('⚠️ Week completion database save failed, continuing with local storage');
          }
        } catch (dbError) {
          console.log('⚠️ Week completion database not available (tables missing), using local storage only');
        }
      } catch (error) {
        console.log('⚠️ Database operations not available, continuing with local storage');
      }

      // Also log this completed week as 1 trainingdag in DB for admin tracking
      try {
        const payload = {
          email: user.email,
          schemaNumber: trainingData.schema.schema_nummer ?? 1,
          incrementDays: 1,
        };
        console.log('📤 Logging training day to admin endpoint:', payload);
        await fetch('/api/admin/log-training', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (logErr) {
        console.log('⚠️ Could not log training day to admin endpoint:', logErr);
      }
      
      // Add completed week to the list - IMPORTANT: Do this BEFORE reloading data
      const newCompletedWeeks = await new Promise<any[]>((resolve) => {
        setCompletedWeeks(prev => {
          // Dedupe: remove any existing same week number, then add
          const base = (prev || []).filter((w: any) => (w.week || w.weekNumber) !== weekCompletionData.week);
          const updated = [...base, weekCompletionData].sort((a: any, b: any) => a.week - b.week);
          
          // Save to localStorage as backup
          try {
            if (trainingData?.schema?.id) {
              localStorage.setItem(`completedWeeks_${user.id}_${trainingData.schema.id}`, JSON.stringify(updated));
              console.log('✅ Week completions saved to localStorage');
            }
          } catch (storageError) {
            console.log('⚠️ Could not save to localStorage:', storageError);
          }
          
          console.log('📊 Updated completedWeeks:', updated.map(w => w.week));
          resolve(updated);
          return updated;
        });
      });
      
      // Update current week first
      const nextWeekNumber = weekCompletionData.week + 1;
      if (nextWeekNumber <= 8) {
        setCurrentWeek(nextWeekNumber);
      } else {
        console.log('🏆 All 8 weeks completed! Congratulations!');
        setCurrentWeek(8);
        
        // Check if this is Schema 1 completion and unlock Schema 2
        if (trainingData?.schema?.schema_nummer === 1) {
          console.log('🎉 Schema 1 completed! Unlocking Schema 2...');
          
          try {
            // Update user's schema progress to mark Schema 1 as completed
            const schemaCompletionResponse = await fetch('/api/schema-completion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                schemaId: trainingData.schema.id,
                completedWeeks: 8,
                completionDate: new Date().toISOString()
              })
            });
            
            if (schemaCompletionResponse.ok) {
              console.log('✅ Schema 1 marked as completed');
              toast.success('🎉 Schema 1 voltooid! Schema 2 is nu beschikbaar!');
            } else {
              console.log('⚠️ Could not mark schema as completed, but continuing');
            }
          } catch (error) {
            console.log('⚠️ Schema completion tracking not available, but continuing');
          }
        }
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
        console.log('📊 State before reload:', {
          currentWeek: currentWeek,
          completedWeeksLength: completedWeeks.length,
          nextWeekNumber: weekCompletionData.week + 1
        });
        
        // Reload data after a short delay to ensure API call is processed
        setTimeout(async () => {
          console.log('🔄 Reloading training data after week reset...');
          await loadTrainingData();
          
          // Reset the flag after data has been reloaded and a bit more time for UI to settle
          setTimeout(() => {
            console.log('✅ Resetting isStartingNewWeek flag');
            setIsStartingNewWeek(false);
          }, 500);
        }, 500);
        
        toast.success(`Week ${weekCompletionData.week} voltooid! Nieuwe week gestart.`);
      } else {
        // Reset flag on error
        setIsStartingNewWeek(false);
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
      // Reset flag on error
      setIsStartingNewWeek(false);
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

  // Show loading only while subscription is loading
  if (loading || subscriptionLoading) {
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

  // Show upgrade screen for basic users (without loading delay)
  if (isBasic && !isAdmin) {
    return (
      <PageLayout title="Mijn Trainingen">
        <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Mijn Trainingen</h1>
              <p className="text-[#8BAE5A] text-lg">Persoonlijke trainingsschema's en gepersonaliseerde begeleiding</p>
            </div>

            {/* Upgrade Required */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border-2 border-[#E33412]/30 rounded-2xl p-12 text-center shadow-2xl"
            >
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#E33412]/20 to-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <SparklesIcon className="w-12 h-12 text-[#E33412]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Upgrade naar Premium</h2>
                <p className="text-gray-300 text-lg mb-4 max-w-2xl mx-auto">
                  Persoonlijke trainingsschema's zijn alleen beschikbaar voor Premium leden
                </p>
                <p className="text-gray-400 text-base max-w-2xl mx-auto">
                  Krijg toegang tot gepersonaliseerde 8-week trainingsschema's, voortgang tracking, en professionele workout begeleiding
                </p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={() => router.push('/pakketten')}
                  className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-[#E33412] to-[#8BAE5A] text-white font-bold text-xl rounded-xl hover:from-[#c72d10] hover:to-[#7A9D4A] transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <SparklesIcon className="w-6 h-6 mr-3" />
                  Upgrade naar Premium
                </button>
                
                <div className="text-sm text-gray-400">
                  <p>Krijg direct toegang tot alle premium features</p>
                </div>
              </div>
            </motion.div>

            {/* Premium Benefits */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#181F17] border border-[#8BAE5A]/30 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">8-Week Schema's</h3>
                <p className="text-gray-400 text-sm">Volledige trainingsschema's afgestemd op jouw doel</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#181F17] border border-[#8BAE5A]/30 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Voortgang Tracking</h3>
                <p className="text-gray-400 text-sm">Volg je prestaties en progressie realtime</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#181F17] border border-[#E33412]/30 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-[#E33412]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoCameraIcon className="w-6 h-6 text-[#E33412]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Video Uitleg</h3>
                <p className="text-gray-400 text-sm">Professionele demonstraties per oefening</p>
              </motion.div>
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
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-3 sm:p-6 overflow-x-hidden">
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 md:gap-8 min-w-0">
            <div className="flex-1">
                <div className="flex items-start justify-between mb-3 sm:mb-4 min-w-0">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">{schema?.name}</h2>
                      {typeof schema?.schema_nummer !== 'undefined' && schema?.schema_nummer !== null && (
                        <span className="inline-flex items-center px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-md bg-[#8BAE5A]/15 text-[#8BAE5A] border border-[#8BAE5A]/30">
                          Schema {schema?.schema_nummer}
                        </span>
                      )}
                    </div>
                    {/* Description hidden per request */}
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
              {/* Week voltooid banner removed per request; action is now in the modal */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Trainingsdagen</h2>
                  <p className="text-[#8BAE5A] text-xs sm:text-sm mt-1 flex items-center gap-2">
                    <span>Huidige Week: {completedWeeks.length + 1}/8</span>
                    {typeof schema?.schema_nummer !== 'undefined' && schema?.schema_nummer !== null && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-[#8BAE5A]/15 text-[#8BAE5A] border border-[#8BAE5A]/30">
                        Schema {schema?.schema_nummer}
                      </span>
                    )}
                  </p>
                </div>
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
                        isCompleted
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
                    
                    {/* Only allow starting this day if previous day is completed (fallback to progress) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Guard: don't allow starting future days until previous completed
                        const prevDay = days?.find(d => d.day_number === day.day_number - 1);
                        const prevCompleted = day.day_number === 1 ? true : (prevDay?.isCompleted ?? false);
                        const progressAllows = progress ? progress.completed_days >= (day.day_number - 1) : day.day_number === 1;
                        const canStart = prevCompleted || progressAllows;
                        if (!canStart) return;
                        startWorkout(day.day_number);
                      }}
                        className={`w-full px-3 py-2 sm:px-4 sm:py-3 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center text-xs sm:text-sm md:text-base ${
                          isCompleted
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : (() => { const prevDay = days?.find(d => d.day_number === day.day_number - 1); const prevCompleted = day.day_number === 1 ? true : (prevDay?.isCompleted ?? false); return prevCompleted || (progress && progress.completed_days >= (day.day_number - 1)) || day.day_number === 1; })()
                              ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] hover:from-[#7A9D4A] hover:to-[#e0903f]'
                              : 'bg-[#2a2f28] text-gray-400 cursor-not-allowed'
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

        {/* (Removed large bottom 'Week voltooid' card in favor of compact top banner) */}

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
            
            <div className="overflow-x-auto mx-0 w-full max-w-full">
              <table className="w-full min-w-[420px] sm:min-w-[560px]">
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
            
            {/* Bottom 'Start Nieuwe Week' section removed per request */}

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
          <ModalBase
            isOpen={showWeekCompletionModal}
            onClose={() => setShowWeekCompletionModal(false)}
            className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 w-full max-w-lg md:max-w-xl shadow-2xl mx-2 sm:mx-4"
          >
              <div className="text-center">
                {/* Success Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#181F17]" />
                </div>
                
                {/* Title */}
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-2 md:mb-3">
                  🎉 Week {weekCompletionData.week} Voltooid!
                </h2>
                
                {/* Description */}
                <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-3 sm:mb-3 md:mb-4">
                  Gefeliciteerd! Je hebt alle trainingsdagen van week {weekCompletionData.week} succesvol voltooid.
                </p>
                
                {/* Week Stats */}
                <div className="bg-[#0F1419]/50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 mb-3 sm:mb-3 md:mb-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-2 md:gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-[#8BAE5A] font-semibold text-xs sm:text-sm">Voltooide Dagen</span>
                      <p className="text-white text-base sm:text-lg md:text-xl font-bold">{weekCompletionData.days.length}</p>
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
                <div className="mb-3 sm:mb-4 md:mb-5">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-2 sm:mb-2">Voltooide Trainingen</h3>
                  <div className="space-y-1 sm:space-y-2">
                    {weekCompletionData.days.map((day: any) => (
                      <div key={day.day} className="flex items-center justify-between bg-[#0F1419]/30 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-2">
                          <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 text-green-400" />
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
                <div className="bg-[#8BAE5A]/10 rounded-lg p-2 sm:p-2 md:p-3 mb-3 sm:mb-4 md:mb-5">
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
                  {trainingData?.schema?.schema_nummer === 1 && weekCompletionData?.week >= 8 ? (
                    <button
                      onClick={completeSchemaAndGoToSchema2}
                      className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#FFD700] to-[#8BAE5A] text-[#181F17] font-bold text-sm sm:text-base md:text-base rounded-lg sm:rounded-xl hover:from-[#FFE55C] hover:to-[#A6C97B] transition-all duration-200 shadow-lg"
                    >
                      Ga naar Schema 2
                    </button>
                  ) : trainingData?.schema?.schema_nummer === 2 && weekCompletionData?.week >= 8 ? (
                    <button
                      onClick={completeSchemaAndGoToSchema3}
                      className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#FFD700] to-[#8BAE5A] text-[#181F17] font-bold text-sm sm:text-base md:text-base rounded-lg sm:rounded-xl hover:from-[#FFE55C] hover:to-[#A6C97B] transition-all duration-200 shadow-lg"
                    >
                      Bekijk Schema 3
                    </button>
                  ) : (
                    <button
                      onClick={startNewWeek}
                      className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base md:text-base rounded-lg sm:rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg"
                    >
                      Start Nieuwe Week
                    </button>
                  )}
                </div>
              </div>
          </ModalBase>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}