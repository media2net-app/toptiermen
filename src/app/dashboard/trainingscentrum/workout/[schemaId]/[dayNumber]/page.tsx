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
import { useSupabaseAuth } from '../../../../../../contexts/SupabaseAuthContext';
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
  
  const schemaId = params?.schemaId as string;
  const dayNumber = parseInt(params?.dayNumber as string);
  const sessionId = searchParams?.get('sessionId');

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Sample exercises - in real app, fetch from API
  const sampleExercises: Exercise[] = [
    {
      id: '1',
      name: 'Bench Press',
      sets: 4,
      reps: '8-10',
      rest: '2 min',
      completed: false,
      currentSet: 0,
      videoUrl: 'workout-videos/exercises/bench-press-tutorial.mp4'
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      sets: 3,
      reps: '10-12',
      rest: '90 sec',
      completed: false,
      currentSet: 0,
      videoUrl: 'workout-videos/exercises/incline-dumbbell-press-tutorial.mp4'
    },
    {
      id: '3',
      name: 'Tricep Dips',
      sets: 3,
      reps: '8-12',
      rest: '90 sec',
      completed: false,
      currentSet: 0,
      videoUrl: 'workout-videos/exercises/tricep-dips-tutorial.mp4'
    },
    {
      id: '4',
      name: 'Tricep Pushdowns',
      sets: 3,
      reps: '12-15',
      rest: '60 sec',
      completed: false,
      currentSet: 0,
      videoUrl: '/videos/tricep-extensions-tutorial.mp4'
    }
  ];

  useEffect(() => {
    if (sessionId) {
      loadSession();
    } else {
      // Load exercises from database for the current schema and day
      loadExercisesFromDatabase();
    }
  }, [sessionId, schemaId, dayNumber]);

  const getVideoUrlForExercise = (exerciseName: string): string | undefined => {
    const videoUrls: { [key: string]: string } = {
      'Bench Press': 'workout-videos/exercises/bench-press-tutorial.mp4',
      'Incline Dumbbell Press': 'workout-videos/exercises/incline-dumbbell-press-tutorial.mp4',
      'Overhead Press': 'workout-videos/exercises/overhead-press-tutorial.mp4',
      'Lateral Raises': 'workout-videos/exercises/lateral-raises-tutorial.mp4',
      'Tricep Dips': 'workout-videos/exercises/tricep-dips-tutorial.mp4',
      'Tricep Pushdowns': 'workout-videos/exercises/tricep-pushdowns-tutorial.mp4',
      'Squat': 'workout-videos/exercises/squat-tutorial.mp4',
      'Leg Press': 'workout-videos/exercises/leg-press-tutorial.mp4',
      'Romanian Deadlift': 'workout-videos/exercises/romanian-deadlift-tutorial.mp4',
      'Leg Extensions': 'workout-videos/exercises/leg-extensions-tutorial.mp4',
      'Leg Curls': 'workout-videos/exercises/leg-curls-tutorial.mp4',
      'Standing Calf Raises': 'workout-videos/exercises/standing-calf-raises-tutorial.mp4',
      'Deadlift': 'workout-videos/exercises/deadlift-tutorial.mp4',
      'Pull-ups': 'workout-videos/exercises/pull-ups-tutorial.mp4',
      'Barbell Row': 'workout-videos/exercises/barbell-row-tutorial.mp4',
      'Lat Pulldown': 'workout-videos/exercises/lat-pulldown-tutorial.mp4',
      'Bicep Curls': 'workout-videos/exercises/bicep-curls-tutorial.mp4',
      'Hammer Curls': 'workout-videos/exercises/hammer-curls-tutorial.mp4',
      'Front Squat': 'workout-videos/exercises/front-squat-tutorial.mp4',
      'Walking Lunges': 'workout-videos/exercises/walking-lunges-tutorial.mp4',
      'Hip Thrusts': 'workout-videos/exercises/hip-thrusts-tutorial.mp4',
      'Good Mornings': 'workout-videos/exercises/good-mornings-tutorial.mp4',
      'Seated Calf Raises': 'workout-videos/exercises/seated-calf-raises-tutorial.mp4',
      'Planks': 'workout-videos/exercises/planks-tutorial.mp4'
    };
    
    return videoUrls[exerciseName];
  };

  const loadExercisesFromDatabase = async () => {
    if (!user || !schemaId || !dayNumber) return;

    setLoading(true);
    try {
      // Get the day for this schema and day number
      const { data: dayData, error: dayError } = await supabase
        .from('training_schema_days')
        .select('*')
        .eq('schema_id', schemaId)
        .eq('day_number', dayNumber)
        .single();

      if (dayError) {
        console.error('Error loading day:', dayError);
        // Fallback to sample data
        setExercises(sampleExercises);
        setLoading(false);
        return;
      }

      // Get exercises for this day
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('training_schema_exercises')
        .select('*')
        .eq('schema_day_id', dayData.id)
        .order('order_index');

      if (exercisesError) {
        console.error('Error loading exercises:', exercisesError);
        // Fallback to sample data
        setExercises(sampleExercises);
        setLoading(false);
        return;
      }

      // Transform database exercises to our format
      const transformedExercises: Exercise[] = exercisesData.map((ex, index) => ({
        id: ex.id,
        name: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps.toString(),
        rest: `${ex.rest_time}s`,
        completed: false,
        currentSet: 0,
        notes: ex.notes || undefined,
        videoUrl: getVideoUrlForExercise(ex.exercise_name) || undefined
      }));

      setExercises(transformedExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      // Fallback to sample data
      setExercises(sampleExercises);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRestTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsRestTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRestTimerRunning, restTimer]);

  const loadSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/workout-sessions?userId=${user?.id}&sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.sessions.length > 0) {
        setSession(data.sessions[0]);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setIsTimerRunning(true);
    toast.success('Workout gestart! 💪');
  };

  const pauseWorkout = () => {
    setIsTimerRunning(false);
    toast('Workout gepauzeerd');
  };

  const resumeWorkout = () => {
    setIsTimerRunning(true);
    toast.success('Workout hervat!');
  };

  const completeSet = (exerciseId: string) => {
    setExercises(prev => 
      prev.map(exercise => {
        if (exercise.id === exerciseId) {
          const newCurrentSet = exercise.currentSet + 1;
          const isCompleted = newCurrentSet >= exercise.sets;
          
          if (isCompleted) {
            // Start rest timer for next exercise
            if (currentExerciseIndex < exercises.length - 1) {
              const nextExercise = exercises[currentExerciseIndex + 1];
              const restTime = parseInt(nextExercise.rest.split(' ')[0]) * 60; // Convert to seconds
              setRestTimer(restTime);
              setIsRestTimerRunning(true);
            }
          }
          
          return {
            ...exercise,
            currentSet: newCurrentSet,
            completed: isCompleted
          };
        }
        return exercise;
      })
    );

    toast.success('Set voltooid! 🔥');
  };

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setIsRestTimerRunning(false);
      setRestTimer(0);
    }
  };

  const completeWorkout = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/workout-sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          rating: 5,
          notes: `Completed workout in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`,
          exercises: exercises.map(ex => ({
            name: ex.name,
            sets: ex.currentSet,
            reps: ex.reps,
            notes: ex.notes
          }))
        })
      });

      if (response.ok) {
        toast.success('Workout voltooid! 🎉');
        router.push('/dashboard/mijn-trainingen');
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      toast.error('Fout bij voltooien workout');
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]">          </div>
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
                {formatTime(timer)}
              </div>
              <div className="text-sm text-gray-400">Workout tijd</div>
            </div>
          </div>

          {/* Workout Controls */}
          {!isWorkoutActive ? (
            <div className="text-center mb-8 space-y-4">
              <button
                onClick={startWorkout}
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
              {isTimerRunning ? (
                <button
                  onClick={pauseWorkout}
                  className="px-6 py-3 bg-[#f0a14f] text-white font-semibold rounded-lg hover:bg-[#e0903f] transition-colors"
                >
                  <PauseIcon className="w-5 h-5 inline mr-2" />
                  Pauzeer
                </button>
              ) : (
                <button
                  onClick={resumeWorkout}
                  className="px-6 py-3 bg-[#8BAE5A] text-white font-semibold rounded-lg hover:bg-[#7A9D4A] transition-colors"
                >
                  <PlayIcon className="w-5 h-5 inline mr-2" />
                  Hervat
                </button>
              )}
              
              <button
                onClick={completeWorkout}
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
          {isRestTimerRunning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[#f0a14f]/10 border border-[#f0a14f]/30 rounded-lg text-center"
            >
              <div className="text-2xl font-bold text-[#f0a14f] mb-2">
                {formatTime(restTimer)}
              </div>
              <p className="text-[#f0a14f]">Rust voor volgende oefening</p>
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
    </ClientLayout>
  );
} 