'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  PlayIcon, 
  PauseIcon, 
  ClockIcon,
  FireIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

interface WorkoutSession {
  id: string;
  schemaId: string;
  dayNumber: number;
  exerciseName: string;
  currentSet: number;
  totalSets: number;
  restTime: number;
  isRestActive: boolean;
  workoutTime: number;
  isActive: boolean;
}

interface FloatingWorkoutWidgetProps {
  session: WorkoutSession | null;
  onResume: () => void;
  onShowCompletion?: () => void; // Optional callback to show completion modal
}

export default function FloatingWorkoutWidget({ 
  session, 
  onResume,
  onShowCompletion 
}: FloatingWorkoutWidgetProps) {
  const router = useRouter();
  const { pauseWorkout, resumeWorkout, stopWorkout } = useWorkoutSession();
  const [restTime, setRestTime] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);

  // Update rest timer when session changes
  useEffect(() => {
    if (session) {
      setRestTime(session.restTime);
      setIsRestTimerRunning(session.isRestActive);
    }
  }, [session]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRestTimerRunning && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setIsRestTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestTimerRunning, restTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToWorkout = () => {
    if (session) {
      console.log('🔄 Navigating back to workout with session:', session);
      const url = `/dashboard/trainingscentrum/workout/${session.schemaId}/${session.dayNumber}?sessionId=${session.id}`;
      console.log('🔄 Navigation URL:', url);
      router.push(url);
    } else {
      console.log('❌ No session available for navigation');
    }
  };

  const handlePauseWorkout = () => {
    pauseWorkout();
  };

  const handleResumeWorkout = () => {
    resumeWorkout();
  };

  const handleStopWorkout = () => {
    // If we have a completion callback (we're on a workout page), show completion modal
    if (onShowCompletion) {
      onShowCompletion();
    } else {
      // Otherwise, just stop the workout (we're on a different page)
      stopWorkout();
    }
  };

  if (!session) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className={`bg-gradient-to-br ${session.isActive ? 'from-[#181F17] to-[#232D1A] border-[#3A4D23]' : 'from-[#2D1A0F] to-[#3D2415] border-[#D97706]'} border rounded-xl p-4 shadow-2xl min-w-[280px]`}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${session.isActive ? 'bg-gradient-to-r from-[#8BAE5A] to-[#7A9D4A]' : 'bg-gradient-to-r from-[#D97706] to-[#B45309]'} rounded-lg flex items-center justify-center`}>
                <FireIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{session.isActive ? 'Workout Actief' : 'Workout Gepauzeerd'}</h3>
                <p className="text-xs text-gray-400">{session.exerciseName}</p>
              </div>
            </div>
          </div>

          {/* Workout Timer */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Workout Tijd</span>
              <div className="flex items-center gap-1">
                {session.isActive ? (
                  <button
                    onClick={handlePauseWorkout}
                    className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
                  >
                    <PauseIcon className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={handleResumeWorkout}
                    className="text-[#D97706] hover:text-[#F59E0B] transition-colors"
                  >
                    <PlayIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-lg font-bold text-white">
              {formatTime(session.workoutTime)}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Voortgang</span>
              <span className="text-xs text-[#8BAE5A]">
                Set {session.currentSet}/{session.totalSets}
              </span>
            </div>
            <div className={`w-full h-2 ${session.isActive ? 'bg-[#3A4D23]' : 'bg-[#451A03]'} rounded-full`}>
              <div 
                className={`h-2 ${session.isActive ? 'bg-gradient-to-r from-[#8BAE5A] to-[#7A9D4A]' : 'bg-gradient-to-r from-[#D97706] to-[#B45309]'} rounded-full transition-all duration-300`}
                style={{ width: `${(session.currentSet / session.totalSets) * 100}%` }}
              />
            </div>
          </div>

          {/* Rest Timer */}
          {isRestTimerRunning && restTime > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 bg-[#8BAE5A]/10 border border-[#8BAE5A]/30 rounded-lg"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#8BAE5A]">Rust Tijd</span>
                <ClockIcon className="w-3 h-3 text-[#8BAE5A]" />
              </div>
              <div className="text-lg font-bold text-[#8BAE5A]">
                {formatTime(restTime)}
              </div>
            </motion.div>
          )}

          {/* Back to Workout Button */}
          <motion.button
            onClick={handleBackToWorkout}
            className={`w-full ${session.isActive ? 'bg-gradient-to-r from-[#8BAE5A] to-[#7A9D4A] hover:from-[#7A9D4A] hover:to-[#6B8D3A]' : 'bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E]'} text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowRightIcon className="w-4 h-4" />
            {isRestTimerRunning && restTime === 0 ? 'Terug naar Training' : 'Ga naar Training'}
          </motion.button>

          {/* Stop Workout Button */}
          <button
            onClick={handleStopWorkout}
            className="w-full mt-2 text-gray-400 hover:text-red-400 text-xs transition-colors"
          >
            Stop Workout
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
