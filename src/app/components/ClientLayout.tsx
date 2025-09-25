"use client";
import MobileNav from "./MobileNav";
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isCompleted, currentStep } = useOnboardingV2();
  const { session } = useWorkoutSession();
  
  // Hide mobile nav during onboarding (when not completed and has current step)
  // But allow navigation during workout sessions (timer pop-up will remain visible)
  const shouldHideNav = !isLoading && !isCompleted && currentStep !== null;
  
  // Don't hide navigation during workouts - users should be able to navigate
  // The FloatingWorkoutWidget will remain visible to show workout progress
  
  return (
    <div className={shouldHideNav ? "pb-0" : "pb-24 sm:pb-20 lg:pb-0"}>
      {children}
      {!shouldHideNav && <MobileNav />}
    </div>
  );
} 