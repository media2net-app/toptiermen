"use client";
import MobileNav from "./MobileNav";
import MobileWorkoutBar from "@/components/MobileWorkoutBar";
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { session } = useWorkoutSession();
  
  return (
    <div>
      {children}
      {/* Mobile Workout Bar - Only shows on mobile when workout is active */}
      <MobileWorkoutBar 
        session={session ? {
          id: session.id,
          schemaId: session.schemaId,
          dayNumber: session.dayNumber,
          exerciseName: session.exerciseName,
          isActive: session.isActive,
          startTime: new Date().toISOString(),
          restTime: session.restTime,
          isRestActive: session.isRestActive,
          workoutTime: session.workoutTime || 0,
          currentSet: session.currentSet,
          totalSets: session.totalSets,
          totalExercises: session.totalExercises,
          completedExercises: 0
        } : null}
        onResume={() => {}}
        onShowCompletion={() => {}}
      />
    </div>
  );
} 