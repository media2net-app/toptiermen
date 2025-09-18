'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
  currentExerciseIndex: number;
  totalExercises: number;
}

interface WorkoutSessionContextType {
  session: WorkoutSession | null;
  setSession: (session: WorkoutSession | null) => void;
  updateSession: (updates: Partial<WorkoutSession>) => void;
  startWorkout: (sessionData: Omit<WorkoutSession, 'workoutTime' | 'isActive'>) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  stopWorkout: () => void;
  updateRestTimer: (restTime: number, isActive: boolean) => void;
  updateProgress: (currentSet: number, exerciseName: string, currentExerciseIndex: number) => void;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextType | undefined>(undefined);

export function WorkoutSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] = useState(false);

  // Workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWorkoutTimerRunning && session) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutTimerRunning, session]);

  // Update session with current workout time
  useEffect(() => {
    if (session) {
      setSession(prev => prev ? { ...prev, workoutTime } : null);
    }
  }, [workoutTime, session]);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('activeWorkoutSession');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setSession(parsedSession);
        setWorkoutTime(parsedSession.workoutTime || 0);
        setIsWorkoutTimerRunning(parsedSession.isActive || false);
      } catch (error) {
        console.error('Error loading saved workout session:', error);
        localStorage.removeItem('activeWorkoutSession');
      }
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('activeWorkoutSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('activeWorkoutSession');
    }
  }, [session]);

  const startWorkout = (sessionData: Omit<WorkoutSession, 'workoutTime' | 'isActive'>) => {
    const newSession: WorkoutSession = {
      ...sessionData,
      workoutTime: 0,
      isActive: true
    };
    setSession(newSession);
    setWorkoutTime(0);
    setIsWorkoutTimerRunning(true);
  };

  const pauseWorkout = () => {
    if (session) {
      setSession(prev => prev ? { ...prev, isActive: false } : null);
      setIsWorkoutTimerRunning(false);
    }
  };

  const resumeWorkout = () => {
    if (session) {
      setSession(prev => prev ? { ...prev, isActive: true } : null);
      setIsWorkoutTimerRunning(true);
    }
  };

  const stopWorkout = () => {
    setSession(null);
    setWorkoutTime(0);
    setIsWorkoutTimerRunning(false);
  };

  const updateSession = (updates: Partial<WorkoutSession>) => {
    if (session) {
      setSession(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const updateRestTimer = (restTime: number, isActive: boolean) => {
    if (session) {
      setSession(prev => prev ? { 
        ...prev, 
        restTime, 
        isRestActive: isActive 
      } : null);
    }
  };

  const updateProgress = (currentSet: number, exerciseName: string, currentExerciseIndex: number) => {
    if (session) {
      setSession(prev => prev ? { 
        ...prev, 
        currentSet, 
        exerciseName, 
        currentExerciseIndex 
      } : null);
    }
  };

  const value: WorkoutSessionContextType = {
    session,
    setSession,
    updateSession,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    stopWorkout,
    updateRestTimer,
    updateProgress
  };

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext);
  if (context === undefined) {
    throw new Error('useWorkoutSession must be used within a WorkoutSessionProvider');
  }
  return context;
}
