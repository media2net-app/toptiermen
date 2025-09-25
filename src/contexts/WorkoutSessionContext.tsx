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
  const [restTime, setRestTime] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);

  // Workout timer - only depends on isWorkoutTimerRunning, not session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWorkoutTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWorkoutTimerRunning]);

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

  // Update session with current workout time and rest time
  useEffect(() => {
    if (session) {
      setSession(prev => {
        if (!prev) return null;
        
        // Only update if values actually changed to prevent infinite loops
        if (prev.workoutTime !== workoutTime || 
            prev.restTime !== restTime || 
            prev.isRestActive !== isRestTimerRunning) {
          return { 
            ...prev, 
            workoutTime,
            restTime,
            isRestActive: isRestTimerRunning
          };
        }
        return prev;
      });
    }
  }, [workoutTime, restTime, isRestTimerRunning, session]);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('activeWorkoutSession');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        
        // Check if session is too old (more than 24 hours)
        const sessionAge = Date.now() - new Date(parsedSession.started_at).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge > maxAge) {
          console.log('🕐 Workout session is too old, clearing...');
          localStorage.removeItem('activeWorkoutSession');
          return;
        }
        
        setSession(parsedSession);
        setWorkoutTime(parsedSession.workoutTime || 0);
        setIsWorkoutTimerRunning(parsedSession.isActive || false);
        setRestTime(parsedSession.restTime || 0);
        setIsRestTimerRunning(parsedSession.isRestActive || false);
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
      // Pause both workout timer and rest timer
      setIsWorkoutTimerRunning(false);
      setIsRestTimerRunning(false);
    }
  };

  const resumeWorkout = () => {
    if (session) {
      setSession(prev => prev ? { ...prev, isActive: true } : null);
      // Resume workout timer and rest timer if there's rest time
      setIsWorkoutTimerRunning(true);
      if (restTime > 0) {
        setIsRestTimerRunning(true);
      }
    }
  };

  const stopWorkout = () => {
    console.log('🛑 Stopping workout session completely...');
    setSession(null);
    setWorkoutTime(0);
    setIsWorkoutTimerRunning(false);
    setRestTime(0);
    setIsRestTimerRunning(false);
    // Clear localStorage
    localStorage.removeItem('activeWorkoutSession');
  };

  const updateSession = (updates: Partial<WorkoutSession>) => {
    if (session) {
      setSession(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const updateRestTimer = (newRestTime: number, isActive: boolean) => {
    setRestTime(newRestTime);
    setIsRestTimerRunning(isActive);
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

  // Add global function for debugging - clear workout session manually
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).clearWorkoutSession = () => {
        console.log('🧹 Manual workout session clear triggered');
        stopWorkout();
      };
    }
  }, []);

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
