"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FireIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

interface MobileWorkoutBarProps {
  session: {
    id: string;
    schemaId: string;
    dayNumber: number;
    exerciseName: string;
    isActive: boolean;
    startTime: string;
    restTime: number;
    isRestActive: boolean;
    workoutTime: number;
    currentSet: number;
    totalSets: number;
    totalExercises: number;
    completedExercises: number;
  } | null;
  onResume?: () => void;
  onShowCompletion?: () => void;
}

export default function MobileWorkoutBar({ 
  session, 
  onResume,
  onShowCompletion 
}: MobileWorkoutBarProps) {
  
  const { pauseWorkout, resumeWorkout, stopWorkout } = useWorkoutSession();
  const router = useRouter();
  const [restTime, setRestTime] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);

  // Update rest timer when session changes
  useEffect(() => {
    if (session) {
      setRestTime(session.restTime);
      setIsRestTimerRunning(session.isRestActive);
      setWorkoutTime(session.workoutTime);
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

  // Workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session?.isActive) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session?.isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToWorkout = () => {
    if (session) {
      const url = `/dashboard/trainingscentrum/workout/${session.schemaId}/${session.dayNumber}?sessionId=${session.id}`;
      router.push(url);
    }
  };

  const handlePauseWorkout = () => {
    pauseWorkout();
  };

  const handleResumeWorkout = () => {
    resumeWorkout();
  };

  const handleStopWorkout = () => {
    if (onShowCompletion) {
      onShowCompletion();
    } else {
      stopWorkout();
    }
  };

  // Only show widget if there's an active session
  if (!session || !session.isActive) return null;

  const workoutProgress = session.totalExercises > 0 ? Math.round((session.completedExercises / session.totalExercises) * 100) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      >
        <div className="bg-gradient-to-r from-[#3A4D23] to-[#4A5D33] border-t border-[#8BAE5A] shadow-2xl">
          <div className="px-4 py-3">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                  <FireIcon className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Workout Actief
                  </h3>
                  <p className="text-xs text-gray-300 truncate max-w-[200px]">{session.exerciseName}</p>
                </div>
              </div>
              
              {/* Workout Time */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <ClockIcon className="w-3 h-3" />
                  <span>Workout Tijd</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {formatTime(workoutTime)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Voortgang</span>
                <span className="text-xs text-[#8BAE5A]">
                  Set {session.currentSet}/{session.totalSets}
                </span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23] rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#7A9D4A] rounded-full transition-all duration-300"
                  style={{ width: `${(session.currentSet / session.totalSets) * 100}%` }}
                />
              </div>
            </div>

            {/* Rest Timer */}
            {isRestTimerRunning && restTime > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Rusttijd</span>
                  <span className="text-xs text-[#D97706]">
                    {formatTime(restTime)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#451A03] rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#D97706] to-[#B45309] rounded-full transition-all duration-300"
                    style={{ width: `${(restTime / 90) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {session.isActive ? (
                  <button
                    onClick={handlePauseWorkout}
                    className="p-2 bg-[#8BAE5A] text-white rounded-full hover:bg-[#7A9D4A] transition-colors"
                  >
                    <PauseIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleResumeWorkout}
                    className="p-2 bg-[#D97706] text-white rounded-full hover:bg-[#B45309] transition-colors"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleStopWorkout}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <StopIcon className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleBackToWorkout}
                className="px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9D4A] transition-colors flex items-center gap-2"
              >
                <span className="text-sm font-medium">Ga naar Training</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
