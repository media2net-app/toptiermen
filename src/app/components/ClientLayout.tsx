"use client";
import MobileNav from "./MobileNav";
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Mobile sticky footer is completely removed
  return (
    <div>
      {children}
    </div>
  );
} 