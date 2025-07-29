'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  targetPage: string;
  targetMenuLabel: string;
  completed: boolean;
  icon: string;
}

interface OnboardingContextType {
  isOnboarding: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  highlightedMenu: string | null;
  isTransitioning: boolean;
  completeCurrentStep: () => Promise<void>;
  completeStep: (stepNumber: number) => Promise<void>;
  setCurrentStep: (step: number) => void;
  resetOnboarding: () => void;
  goToStep: (step: number) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welkomstvideo bekijken',
      description: 'Maak kennis met het platform',
      targetPage: '/dashboard/onboarding',
      targetMenuLabel: 'Onboarding',
      completed: false,
      icon: '🎬'
    },
    {
      id: 1,
      title: 'Hoofddoel bepalen',
      description: 'Wat wil je bereiken?',
      targetPage: '/dashboard/onboarding',
      targetMenuLabel: 'Onboarding',
      completed: false,
      icon: '🎯'
    },
    {
      id: 2,
      title: 'Missies selecteren',
      description: 'Kies je dagelijkse uitdagingen',
      targetPage: '/dashboard/mijn-missies',
      targetMenuLabel: 'Mijn Missies',
      completed: false,
      icon: '🔥'
    },
    {
      id: 3,
      title: 'Trainingsschema kiezen',
      description: 'Selecteer je workout plan',
      targetPage: '/dashboard/trainingscentrum',
      targetMenuLabel: 'Trainingscentrum',
      completed: false,
      icon: '💪'
    },
    {
      id: 4,
      title: 'Voeding & Challenge',
      description: 'Voedingsplan en uitdaging',
      targetPage: '/dashboard/trainingscentrum',
      targetMenuLabel: 'Trainingscentrum',
      completed: false,
      icon: '🥗'
    },
    {
      id: 5,
      title: 'Forum introductie',
      description: 'Stel je voor aan de community',
      targetPage: '/dashboard/brotherhood/forum',
      targetMenuLabel: 'Forum',
      completed: false,
      icon: '💬'
    }
  ];

  // Fetch onboarding status on mount
  useEffect(() => {
    if (user) {
      fetchOnboardingStatus();
    }
  }, [user]);

  const fetchOnboardingStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/onboarding?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setOnboardingStatus(data);
        
        // Check if user is in onboarding
        if (!data.onboarding_completed) {
          setIsOnboarding(true);
          
          // Determine current step based on completion status
          if (!data.welcome_video_watched) {
            setCurrentStep(0);
          } else if (!data.step_1_completed) {
            setCurrentStep(1);
          } else if (!data.step_2_completed) {
            setCurrentStep(2);
          } else if (!data.step_3_completed) {
            setCurrentStep(3);
          } else if (!data.step_4_completed) {
            setCurrentStep(4);
          } else if (!data.step_5_completed) {
            setCurrentStep(5);
          }
        } else {
          setIsOnboarding(false);
        }
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
    }
  };

  const goToStep = async (step: number) => {
    if (step < 0 || step >= steps.length) return;
    
    setIsTransitioning(true);
    
    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCurrentStep(step);
    setIsTransitioning(false);
  };

  const completeStep = async (stepNumber: number) => {
    if (!user || !onboardingStatus || stepNumber < 0 || stepNumber >= steps.length) return;

    setIsTransitioning(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: stepNumber === 0 ? 'watch_welcome_video' : 'complete_step',
          step: stepNumber === 0 ? 0 : stepNumber,
        }),
      });

      if (response.ok) {
        // Update local state
        const updatedSteps = [...steps];
        updatedSteps[stepNumber].completed = true;
        
        // Smooth transition delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If this was the current step, move to next
        if (stepNumber === currentStep && stepNumber < steps.length - 1) {
          setCurrentStep(stepNumber + 1);
        }
        
        // Refresh onboarding status
        await fetchOnboardingStatus();
      }
    } catch (error) {
      console.error('Error completing step:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const completeCurrentStep = async () => {
    await completeStep(currentStep);
  };

  const resetOnboarding = () => {
    setIsOnboarding(true);
    setCurrentStep(0);
  };

  // Get the highlighted menu item for the current step
  const highlightedMenu = isOnboarding ? steps[currentStep]?.targetMenuLabel || null : null;

  const value: OnboardingContextType = {
    isOnboarding,
    currentStep,
    steps,
    highlightedMenu,
    isTransitioning,
    completeCurrentStep,
    completeStep,
    setCurrentStep,
    resetOnboarding,
    goToStep,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 