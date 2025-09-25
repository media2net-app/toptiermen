'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  CheckIcon,
  ArrowLeftIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import ClientLayout from '../../../../../components/ClientLayout';
import WorkoutVideoModal from '@/components/WorkoutVideoModal';
import WorkoutCompletionModal from '@/components/WorkoutCompletionModal';
import FloatingWorkoutWidget from '@/components/FloatingWorkoutWidget';
// import WorkoutPlayerModal from '../../WorkoutPlayerModal'; // Removed - file doesn't exist
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  completed: boolean;
  currentSet: number;
  notes?: string;
  videoUrl?: string;
}

interface WorkoutSession {
  id: string;
  started_at: string;
  mode: string;
}

export default function WorkoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { 
    session: globalSession, 
    startWorkout, 
    updateSession, 
    updateRestTimer, 
    updateProgress,
    stopWorkout,
    pauseWorkout,
    resumeWorkout
  } = useWorkoutSession();
  
  const schemaId = params?.schemaId as string;
  const dayNumber = parseInt(params?.dayNumber as string);
  const sessionId = searchParams?.get('sessionId');

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [workoutEndTime, setWorkoutEndTime] = useState(0); // Store the final workout time when completed
  // const [showWorkoutPlayerModal, setShowWorkoutPlayerModal] = useState(false); // Removed - component doesn't exist

  // Sample exercises - in real app, fetch from API
  const sampleExercises: Exercise[] = [
    {
      id: '1',
      name: 'Bench Press',
      sets: 4,
      reps: '8-10',
      rest: '120s',
      completed: false,
      currentSet: 0,
      videoUrl: undefined // Will be fetched from exercises table
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      sets: 3,
      reps: '10-12',
      rest: '90s',
      completed: false,
      currentSet: 0,
      videoUrl: undefined // Will be fetched from exercises table
    },
    {
      id: '3',
      name: 'Tricep Dips',
      sets: 3,
      reps: '8-12',
      rest: '90s',
      completed: false,
      currentSet: 0,
      videoUrl: undefined // Will be fetched from exercises table
    },
    {
      id: '4',
      name: 'Tricep Pushdowns',
      sets: 3,
      reps: '12-15',
      rest: '60s',
      completed: false,
      currentSet: 0,
      videoUrl: undefined // Will be fetched from exercises table
    }
  ];

  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    console.log('🔄 useEffect triggered with:', { sessionId, schemaId, dayNumber, user: !!user });
    
    if (sessionId) {
      console.log('🔄 Loading session...');
      loadSession();
    } else {
      console.log('🔄 No sessionId, loading exercises from database...');
      // Load exercises from database for the current schema and day
      loadExercisesFromDatabase();
    }
  }, [sessionId, schemaId, dayNumber, user?.id]);

  const getVideoUrlForExercise = async (exerciseName: string): Promise<string | undefined> => {
    try {
      // Zoek de oefening in de exercises tabel om de video URL op te halen
      const { data: exercise, error } = await supabase
        .from('exercises')
        .select('video_url')
        .eq('name', exerciseName)
        .single();

      if (error) {
        console.log(`Geen video gevonden voor ${exerciseName}:`, error.message);
        return undefined;
      }

      return exercise?.video_url || undefined;
    } catch (error) {
      console.error(`Fout bij ophalen video voor ${exerciseName}:`, error);
      return undefined;
    }
  };

  const loadExercisesFromDatabase = async () => {
    console.log('🔄 loadExercisesFromDatabase called with:', { user: !!user, schemaId, dayNumber });
    
    if (!user || !schemaId || !dayNumber) {
      console.log('❌ Missing required data:', { user: !!user, schemaId, dayNumber });
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('🔄 Loading exercises from API:', { schemaId, dayNumber });
    console.log('🔍 User ID:', user.id);
    
    try {
      // Try the new workout-data API endpoint first
      console.log('🔄 Trying workout-data API endpoint...');
      const workoutResponse = await fetch(`/api/training/workout-data?schemaId=${schemaId}&dayNumber=${dayNumber}`);
      
      if (workoutResponse.ok) {
        const workoutData = await workoutResponse.json();
        console.log('✅ Workout data loaded:', workoutData);
        
        if (workoutData.success && workoutData.data && workoutData.data.exercises && workoutData.data.exercises.length > 0) {
          // Transform exercises from workout-data API
          const transformedExercises: Exercise[] = [];
          
          for (const ex of workoutData.data.exercises) {
            transformedExercises.push({
              id: ex.id,
              name: ex.name || 'Unknown Exercise',
              sets: ex.targetSets || 3,
              reps: ex.reps || '8-12',
              rest: ex.rest || '90s',
              completed: false,
              currentSet: 0,
              notes: ex.notes || undefined,
              videoUrl: ex.videoUrl || undefined
            });
          }

          setExercises(transformedExercises);
          console.log('✅ Exercises loaded from workout-data API:', transformedExercises.length);
          
          // Load saved set progress if sessionId exists
          if (sessionId) {
            await loadSavedSetProgress(transformedExercises);
          }
          
          setLoading(false);
          return;
        } else {
          console.log('⚠️ Workout-data API returned no exercises:', workoutData);
        }
      } else {
        console.log('⚠️ Workout-data API failed with status:', workoutResponse.status);
        const errorText = await workoutResponse.text();
        console.log('⚠️ Error response:', errorText);
      }

      console.log('⚠️ Workout-data API failed, trying user-training-schema API...');
      
      // Fallback to user-training-schema API
      const response = await fetch(`/api/user-training-schema?userId=${user.id}`);
      const data = await response.json();
      
      if (!data.success || !data.days) {
        console.error('❌ Error loading training data from API:', data);
        // Use sample exercises as fallback
        console.log('🔄 Using sample exercises as fallback');
        setExercises(sampleExercises);
        setLoading(false);
        return;
      }

      console.log('✅ Training data loaded from API:', data.days.length, 'days');

      // Find the specific day we need
      const targetDay = data.days.find((day: any) => day.day_number === dayNumber);
      
      if (!targetDay) {
        console.error('❌ Day not found:', dayNumber);
        console.error('❌ Available days:', data.days.map((d: any) => ({ day_number: d.day_number, name: d.name })));
        throw new Error(`Day ${dayNumber} not found`);
      }

      console.log('✅ Target day found:', targetDay.name, 'with', targetDay.training_schema_exercises?.length || 0, 'exercises');

      // Check if we have exercises
      if (!targetDay.training_schema_exercises || targetDay.training_schema_exercises.length === 0) {
        console.log('⚠️ No exercises found for this day, using fallback sample exercises');
        const sampleExercisesWithVideos = await Promise.all(
          sampleExercises.map(async (exercise) => {
            const videoUrl = await getVideoUrlForExercise(exercise.name);
            return { ...exercise, videoUrl };
          })
        );
        setExercises(sampleExercisesWithVideos);
        setLoading(false);
        return;
      }

      // Transform database exercises to our format and fetch video URLs
      const transformedExercises: Exercise[] = [];
      
      for (const ex of targetDay.training_schema_exercises) {
        const videoUrl = await getVideoUrlForExercise(ex.exercise_name);
        
        transformedExercises.push({
          id: ex.id,
          name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps.toString(),
          rest: `${ex.rest_time_seconds || ex.rest_time || 90}s`,
          completed: false,
          currentSet: 0,
          notes: ex.notes || undefined,
          videoUrl: videoUrl || undefined
        });
      }

      setExercises(transformedExercises);
      console.log('✅ Exercises transformed and set:', transformedExercises.length);
    } catch (error) {
      console.error('❌ Error loading exercises:', error);
      // Fallback to sample data with video URLs
      try {
        const sampleExercisesWithVideos = await Promise.all(
          sampleExercises.map(async (exercise) => {
            const videoUrl = await getVideoUrlForExercise(exercise.name);
            return { ...exercise, videoUrl };
          })
        );
        setExercises(sampleExercisesWithVideos);
        console.log('✅ Fallback exercises loaded:', sampleExercisesWithVideos.length);
      } catch (fallbackError) {
        console.error('❌ Error loading sample exercises with videos:', fallbackError);
        setExercises(sampleExercises);
        console.log('✅ Basic sample exercises loaded:', sampleExercises.length);
      }
    } finally {
      setLoading(false);
      console.log('✅ Loading completed');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Initialize WorkoutSessionContext when exercises are loaded
  useEffect(() => {
    if (exercises.length > 0 && !globalSession) {
      const currentExercise = exercises[currentExerciseIndex];
      const sessionIdToUse = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      startWorkout({
        id: sessionIdToUse,
        schemaId: schemaId,
        dayNumber: dayNumber,
        exerciseName: currentExercise.name,
        currentSet: currentExercise.currentSet,
        totalSets: currentExercise.sets,
        restTime: 0,
        isRestActive: false,
        currentExerciseIndex: currentExerciseIndex,
        totalExercises: exercises.length
      });
      setIsWorkoutActive(true);
      setIsTimerRunning(true);
    }
  }, [exercises.length, currentExerciseIndex, globalSession?.id, sessionId, schemaId, dayNumber]);

  // Sync local state with global session when returning to workout page
  useEffect(() => {
    if (globalSession && exercises.length > 0) {
      console.log('🔄 Syncing local state with global session:', globalSession);
      
      // Update current exercise index from global session
      if (globalSession.currentExerciseIndex !== undefined && globalSession.currentExerciseIndex !== currentExerciseIndex) {
        console.log('🔄 Updating current exercise index from', currentExerciseIndex, 'to', globalSession.currentExerciseIndex);
        setCurrentExerciseIndex(globalSession.currentExerciseIndex);
      }
      
      // Update workout timer from global session
      if (globalSession.workoutTime !== undefined && globalSession.workoutTime !== timer) {
        console.log('🔄 Updating timer from', timer, 'to', globalSession.workoutTime);
        setTimer(globalSession.workoutTime);
      }
      
      // Update workout active state
      if (globalSession.isActive !== isWorkoutActive) {
        console.log('🔄 Updating workout active state from', isWorkoutActive, 'to', globalSession.isActive);
        setIsWorkoutActive(globalSession.isActive);
        setIsTimerRunning(globalSession.isActive);
      }
      
      // Update exercise progress from global session
      if (globalSession.currentSet !== undefined && globalSession.exerciseName) {
        const exerciseIndex = exercises.findIndex(ex => ex.name === globalSession.exerciseName);
        if (exerciseIndex !== -1) {
          console.log('🔄 Updating exercise progress for', globalSession.exerciseName, 'set', globalSession.currentSet);
          setExercises(prev => prev.map((ex, index) => 
            index === exerciseIndex 
              ? { ...ex, currentSet: globalSession.currentSet || 0 }
              : ex
          ));
        }
      }
    }
  }, [globalSession?.id, globalSession?.currentExerciseIndex, globalSession?.workoutTime, globalSession?.isActive, globalSession?.currentSet, globalSession?.exerciseName, exercises.length, currentExerciseIndex, timer, isWorkoutActive]);

  const checkActiveSession = async () => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Checking for active workout sessions...');
      const response = await fetch(`/api/workout-sessions?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.sessions.length > 0) {
        // Find the most recent active session (not completed)
        const activeSession = data.sessions.find((s: any) => !s.completed_at);
        if (activeSession) {
          console.log('⚠️ Found active session:', activeSession.id);
          return activeSession;
        }
      }
      
      console.log('✅ No active sessions found');
      return null;
    } catch (error) {
      console.error('❌ Error checking active sessions:', error);
      return null;
    }
  };

  const loadSession = async () => {
    if (!sessionId) return;

    try {
      console.log('🔄 Loading session data...');
      const response = await fetch(`/api/workout-sessions?userId=${user?.id}&sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.sessions.length > 0) {
        console.log('✅ Session loaded:', data.sessions[0]);
        setSession(data.sessions[0]);
        
        // After loading session, also load exercises
        console.log('🔄 Loading exercises after session load...');
        await loadExercisesFromDatabase();
      } else {
        console.log('⚠️ No session found, loading exercises directly...');
        await loadExercisesFromDatabase();
      }
    } catch (error) {
      console.error('❌ Error loading session:', error);
      // Fallback to loading exercises directly
      console.log('🔄 Fallback: loading exercises directly...');
      await loadExercisesFromDatabase();
    }
  };

  const startWorkoutLocal = async () => {
    // First check if there's already an active session
    const activeSession = await checkActiveSession();
    if (activeSession) {
      console.log('⚠️ Active session found, redirecting to existing session...');
      toast.error('Er is al een actieve workout sessie. Ga naar de bestaande sessie.');
      router.push(`/dashboard/trainingscentrum/workout/${activeSession.schema_id}/${activeSession.day_number}?sessionId=${activeSession.id}`);
      return;
    }

    setIsWorkoutActive(true);
    setIsTimerRunning(true);
    
    // Start global workout session
    if (exercises.length > 0) {
      const currentExercise = exercises[currentExerciseIndex];
      startWorkout({
        id: sessionId || 'local-session',
        schemaId: schemaId,
        dayNumber: dayNumber,
        exerciseName: currentExercise.name,
        currentSet: currentExercise.currentSet,
        totalSets: currentExercise.sets,
        restTime: 0,
        isRestActive: false,
        currentExerciseIndex: currentExerciseIndex,
        totalExercises: exercises.length
      });
    }
    
    toast.success('Workout gestart! 💪');
  };

  const pauseWorkoutLocal = () => {
    setIsTimerRunning(false);
    // Also pause the global session
    pauseWorkout();
    toast('Workout gepauzeerd');
  };

  const resumeWorkoutLocal = () => {
    setIsTimerRunning(true);
    // Also resume the global session
    resumeWorkout();
    toast.success('Workout hervat!');
  };

  const loadSavedSetProgress = async (exercises: Exercise[]) => {
    if (!user || !sessionId) return;
    
    try {
      console.log('📊 Loading saved set progress for session:', sessionId);
      const response = await fetch(`/api/training/save-set-progress?userId=${user.id}&sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Loaded set progress:', data.data);
        
        // Update exercises with saved progress
        const updatedExercises = exercises.map(exercise => {
          const savedSets = data.data.filter((set: any) => set.exercise_id === exercise.id);
          const completedSets = savedSets.length;
          const isCompleted = completedSets >= exercise.sets;
          
          return {
            ...exercise,
            currentSet: completedSets,
            completed: isCompleted
          };
        });
        
        setExercises(updatedExercises);
        console.log('✅ Exercises updated with saved progress');
      }
    } catch (error) {
      console.error('❌ Error loading saved set progress:', error);
    }
  };

  const saveSetProgress = async (exerciseId: string, setNumber: number, reps?: string, weight?: string) => {
    if (!user || !sessionId) return;
    
    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (!exercise) return;
      
      console.log('💾 Saving set progress:', { exerciseId, setNumber, reps, weight });
      
      const response = await fetch('/api/training/save-set-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sessionId: sessionId,
          exerciseId: exerciseId,
          exerciseName: exercise.name,
          setNumber: setNumber,
          reps: reps,
          weight: weight,
          completedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log('✅ Set progress saved successfully');
      } else {
        console.error('❌ Failed to save set progress');
      }
    } catch (error) {
      console.error('❌ Error saving set progress:', error);
    }
  };

  const completeSet = (exerciseId: string) => {
    setExercises(prev => {
      const updatedExercises = prev.map(exercise => {
        if (exercise.id === exerciseId) {
          const newCurrentSet = exercise.currentSet + 1;
          const isCompleted = newCurrentSet >= exercise.sets;
          
          // Save set progress to database
          saveSetProgress(exerciseId, newCurrentSet, exercise.reps);
          
          // Start rest timer after every set (not just when exercise is completed)
          if (!isCompleted) {
            // Still more sets to do - start rest timer for current exercise
            let restTime: number;
            if (exercise.rest.includes('min')) {
              restTime = parseInt(exercise.rest.split(' ')[0]) * 60; // Convert minutes to seconds
            } else if (exercise.rest.includes('s')) {
              restTime = parseInt(exercise.rest.replace('s', '')); // Already in seconds
            } else {
              restTime = parseInt(exercise.rest) || 120; // Default to 2 minutes
            }
            // Update global session with rest timer
            updateRestTimer(restTime, true);
          } else {
            // Exercise completed - move to next exercise and start rest timer
            if (currentExerciseIndex < exercises.length - 1) {
              const nextExerciseIndex = currentExerciseIndex + 1;
              const nextExercise = exercises[nextExerciseIndex];
              
              // Update current exercise index
              setCurrentExerciseIndex(nextExerciseIndex);
              
              // Parse rest time correctly - handle both "2 min" and "120s" formats
              let restTime: number;
              if (nextExercise.rest.includes('min')) {
                restTime = parseInt(nextExercise.rest.split(' ')[0]) * 60; // Convert minutes to seconds
              } else if (nextExercise.rest.includes('s')) {
                restTime = parseInt(nextExercise.rest.replace('s', '')); // Already in seconds
              } else {
                restTime = parseInt(nextExercise.rest) || 120; // Default to 2 minutes
              }
              
              // Update global session with next exercise and rest timer
              updateProgress(0, nextExercise.name, nextExerciseIndex);
              updateRestTimer(restTime, true);
            }
          }
          
          // Update global session with progress
          updateProgress(newCurrentSet, exercise.name, currentExerciseIndex);
          
          return {
            ...exercise,
            currentSet: newCurrentSet,
            completed: isCompleted
          };
        }
        return exercise;
      });

      // Check if all exercises are completed
      const allCompleted = updatedExercises.every(exercise => exercise.completed);
      if (allCompleted && isWorkoutActive) {
        // All exercises completed - stop workout timer and show completion modal
        const finalTime = globalSession?.workoutTime || timer; // Use global session time or local timer
        setWorkoutEndTime(finalTime); // Store the final workout time
        stopWorkout(); // Stop the global workout timer
        setIsTimerRunning(false); // Stop local timer
        setIsWorkoutActive(false); // Mark workout as inactive
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 1000); // Small delay to let the last set completion animation finish
      }

      return updatedExercises;
    });

    toast.success('Set voltooid! 🔥');
  };

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      const newIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(newIndex);
      
      // Update global session with new exercise
      const nextExercise = exercises[newIndex];
      if (nextExercise) {
        updateProgress(0, nextExercise.name, newIndex);
      }
      
      // Update global session
      updateRestTimer(0, false);
    }
  };

  const skipRest = () => {
    // Update global session
    updateRestTimer(0, false);
    
    toast.success('Rust overgeslagen! 💪');
  };

  const showWorkoutCompletion = () => {
    // Store the current workout time when manually completing
    const currentTime = globalSession?.workoutTime || timer;
    setWorkoutEndTime(currentTime);
    
    // Stop the workout timers
    stopWorkout();
    setIsTimerRunning(false);
    setIsWorkoutActive(false);
    
    // Show completion modal
    setShowCompletionModal(true);
  };

  const completeWorkout = async () => {
    // Use sessionId from URL params or global session
    const currentSessionId = sessionId || globalSession?.id;
    if (!currentSessionId) {
      console.error('❌ No session ID available for completion');
      return;
    }

    try {
      console.log('🏁 Starting workout completion for session:', currentSessionId);
      
      const response = await fetch('/api/workout-sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          userId: user?.id,
          schemaId: schemaId,
          dayNumber: parseInt(dayNumber as unknown as string),
          rating: 5,
          notes: `Completed workout in ${Math.floor((workoutEndTime || globalSession?.workoutTime || 0) / 60)}:${((workoutEndTime || globalSession?.workoutTime || 0) % 60).toString().padStart(2, '0')}`,
          exercises: exercises.map(ex => ({
            name: ex.name,
            sets: ex.currentSet,
            reps: ex.reps,
            notes: ex.notes
          }))
        })
      });

      const responseData = await response.json();
      console.log('🏁 Workout completion response:', responseData);

      if (response.ok && responseData.success) {
        console.log('✅ Workout completed successfully, stopping session and navigating...');
        
        // Stop the global workout session completely
        stopWorkout();
        
        // Close completion modal
        setShowCompletionModal(false);
        
        toast.success('Workout voltooid! 🎉');
        
        // Navigate to training overview
        router.push('/dashboard/mijn-trainingen');
        
        // Force refresh to show updated progress
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        console.error('❌ Workout completion failed:', responseData);
        toast.error('Fout bij voltooien workout: ' + (responseData.error || 'Onbekende fout'));
      }
    } catch (error) {
      console.error('❌ Error completing workout:', error);
      toast.error('Fout bij voltooien workout: ' + error.message);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[currentExerciseIndex];
  const completedExercises = exercises.filter(ex => ex.completed).length;
  const totalExercises = exercises.length;

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mb-4"></div>
            <p className="text-white text-lg mb-2">Workout laden...</p>
            <p className="text-gray-400 text-sm">Schema: {schemaId}</p>
            <p className="text-gray-400 text-sm">Dag: {dayNumber}</p>
            <p className="text-gray-400 text-sm">Exercises: {exercises.length}</p>
            <p className="text-gray-400 text-sm">User: {user ? 'Logged in' : 'Not logged in'}</p>
            <p className="text-gray-400 text-sm">SessionId: {sessionId || 'None'}</p>
          </div>
        </div>

        {/* Workout Video Modal */}
        <WorkoutVideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          exerciseName={currentExercise?.name || 'Oefening'}
          videoUrl={currentExercise?.videoUrl}
          exerciseDetails={currentExercise ? {
            sets: currentExercise.sets,
            reps: currentExercise.reps,
            rest: currentExercise.rest,
            notes: currentExercise.notes
          } : undefined}
        />
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[#8BAE5A] hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Terug
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Dag {dayNumber} Training</h1>
              <p className="text-[#8BAE5A]">Interactive Workout</p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-[#FFD700]">
                {formatTime(globalSession?.workoutTime || 0)}
              </div>
              <div className="text-sm text-gray-400">Workout tijd</div>
            </div>
          </div>

          {/* Workout Controls */}
          {!isWorkoutActive ? (
            <div className="text-center mb-8 space-y-4">
              <button
                onClick={startWorkoutLocal}
                className="px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200"
              >
                <PlayIcon className="w-6 h-6 inline mr-2" />
                Start Workout
              </button>
              
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    console.log('🎥 Video modal button clicked!');
                    console.log('Current exercise:', currentExercise);
                    console.log('Video URL:', currentExercise?.videoUrl);
                    setShowVideoModal(true);
                  }}
                  className="px-6 py-3 bg-[#232D1A] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#3A4D23] transition-all duration-200 border border-[#3A4D23] hover:border-[#8BAE5A]"
                >
                  <VideoCameraIcon className="w-5 h-5 inline mr-2" />
                  Bekijk Workout Video
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center gap-4 mb-8">
              {globalSession?.isActive ? (
                <button
                  onClick={pauseWorkoutLocal}
                  className="px-6 py-3 bg-[#f0a14f] text-white font-semibold rounded-lg hover:bg-[#e0903f] transition-colors"
                >
                  <PauseIcon className="w-5 h-5 inline mr-2" />
                  Pauzeer
                </button>
              ) : (
                <button
                  onClick={resumeWorkoutLocal}
                  className="px-6 py-3 bg-[#8BAE5A] text-white font-semibold rounded-lg hover:bg-[#7A9D4A] transition-colors"
                >
                  <PlayIcon className="w-5 h-5 inline mr-2" />
                  Hervat
                </button>
              )}
              
              <button
                onClick={showWorkoutCompletion}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#f0a14f] text-[#181F17] font-semibold rounded-lg hover:from-[#e0903f] hover:to-[#d0802f] transition-all duration-200"
              >
                <TrophyIcon className="w-5 h-5 inline mr-2" />
                Voltooi Workout
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Voortgang: {completedExercises}/{totalExercises} oefeningen</span>
              <span>{Math.round((completedExercises / totalExercises) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-[#3A4D23] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] transition-all duration-500"
                style={{ width: `${(completedExercises / totalExercises) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Rest Timer */}
          {globalSession?.isRestActive && globalSession?.restTime > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[#f0a14f]/10 border border-[#f0a14f]/30 rounded-lg text-center"
            >
              <div className="text-2xl font-bold text-[#f0a14f] mb-2">
                {formatTime(globalSession.restTime)}
              </div>
              <p className="text-[#f0a14f] mb-4">Rust voor volgende oefening</p>
              <button
                onClick={skipRest}
                className="px-4 py-2 bg-[#f0a14f] text-white font-semibold rounded-lg hover:bg-[#e0903f] transition-colors"
              >
                Rust Overslaan
              </button>
            </motion.div>
          )}

          {/* Current Exercise */}
          {currentExercise && (
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {currentExercise.name}
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="p-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
                    title="Bekijk oefening video"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Oefening {currentExerciseIndex + 1}/{totalExercises}</div>
                    <div className="text-lg font-semibold text-[#8BAE5A]">
                      Set {currentExercise.currentSet + 1}/{currentExercise.sets}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-[#0F1419]/50 rounded-lg">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{currentExercise.sets}</div>
                  <div className="text-sm text-gray-400">Sets</div>
                </div>
                <div className="text-center p-4 bg-[#0F1419]/50 rounded-lg">
                  <div className="text-2xl font-bold text-[#FFD700]">{currentExercise.reps}</div>
                  <div className="text-sm text-gray-400">Reps</div>
                </div>
                <div className="text-center p-4 bg-[#0F1419]/50 rounded-lg">
                  <div className="text-2xl font-bold text-[#f0a14f]">{currentExercise.rest}</div>
                  <div className="text-sm text-gray-400">Rust</div>
                </div>
              </div>

              {currentExercise.currentSet < currentExercise.sets && (
                <button
                  onClick={() => completeSet(currentExercise.id)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200"
                >
                  <CheckIcon className="w-6 h-6 inline mr-2" />
                  Voltooi Set {currentExercise.currentSet + 1}
                </button>
              )}

              {currentExercise.completed && currentExerciseIndex < exercises.length - 1 && (
                <button
                  onClick={nextExercise}
                  className="w-full mt-4 px-6 py-4 bg-[#3A4D23] text-[#8BAE5A] font-bold text-lg rounded-lg hover:bg-[#4A5D33] transition-colors"
                >
                  Volgende Oefening
                </button>
              )}
            </div>
          )}

          {/* Exercise List */}
          <div className="bg-[#181F17] border border-[#3A4D23]/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Alle Oefeningen</h3>
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    index === currentExerciseIndex
                      ? 'bg-[#232D1A] border border-[#8BAE5A]'
                      : exercise.completed
                      ? 'bg-[#1A1A1A] border border-green-500'
                      : 'bg-[#0F1419]/50 border border-[#3A4D23]'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      exercise.completed
                        ? 'bg-green-500'
                        : index === currentExerciseIndex
                        ? 'bg-[#8BAE5A]'
                        : 'bg-[#3A4D23]'
                    }`}>
                      {exercise.completed ? (
                        <CheckIcon className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{exercise.name}</div>
                      <div className="text-sm text-gray-400">
                        {exercise.currentSet}/{exercise.sets} sets voltooid
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-[#8BAE5A]">{exercise.reps} reps</div>
                    <div className="text-xs text-gray-400">{exercise.rest} rust</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workout Video Modal */}
      <WorkoutVideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        exerciseName={currentExercise?.name || ''}
        videoUrl={currentExercise?.videoUrl}
        exerciseDetails={currentExercise ? {
          sets: currentExercise.sets,
          reps: currentExercise.reps,
          rest: currentExercise.rest,
          notes: currentExercise.notes
        } : undefined}
      />

      {/* Workout Completion Modal */}
      <WorkoutCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={completeWorkout}
        workoutTime={workoutEndTime || globalSession?.workoutTime || 0}
        totalExercises={exercises.length}
        completedExercises={exercises.filter(ex => ex.completed).length}
      />

      {/* Workout Player Modal - Removed - component doesn't exist */}

      {/* Floating Workout Widget with completion callback */}
      {globalSession && (
        <FloatingWorkoutWidget
          session={globalSession}
          onResume={() => {}}
          onShowCompletion={showWorkoutCompletion}
        />
      )}
    </ClientLayout>
  );
} 