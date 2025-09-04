'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  targetPage: string;
  targetMenuLabel: string;
  completed: boolean;
  icon: string;
  instructions: string;
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
  getCurrentStepInstructions: () => string;
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
      icon: '🎬',
      instructions: 'Bekijk de welkomstvideo om het platform te leren kennen'
    },
    {
      id: 1,
      title: 'Hoofddoel bepalen',
      description: 'Wat wil je bereiken?',
      targetPage: '/dashboard/onboarding',
      targetMenuLabel: 'Onboarding',
      completed: false,
      icon: '🎯',
      instructions: 'Beschrijf je hoofddoel - wat wil je bereiken?'
    },
    {
      id: 2,
      title: 'Missies selecteren',
      description: 'Kies je dagelijkse uitdagingen',
      targetPage: '/dashboard/mijn-missies',
      targetMenuLabel: 'Mijn Missies',
      completed: false,
      icon: '🔥',
      instructions: 'Voeg je eerste missies toe door op "Nieuwe Missie Toevoegen" te klikken of gebruik de "Missie Bibliotheek"'
    },
    {
      id: 3,
      title: 'Trainingsschema kiezen',
      description: 'Selecteer je workout plan',
      targetPage: '/dashboard/trainingsschemas',
      targetMenuLabel: 'Trainingsschemas',
      completed: false,
      icon: '💪',
      instructions: 'Bekijk de beschikbare trainingsschema\'s en selecteer er één die bij je past'
    },
    {
      id: 4,
      title: 'Voedingsplan kiezen',
      description: 'Selecteer je voedingsplan',
      targetPage: '/dashboard/voedingsplannen',
      targetMenuLabel: 'Voedingsplannen',
      completed: false,
      icon: '🥗',
      instructions: 'Vul je dagelijkse behoefte in en selecteer een voedingsplan dat bij je doel past'
    },
    {
      id: 5,
      title: 'Forum introductie',
      description: 'Stel je voor aan de community',
      targetPage: '/dashboard/brotherhood/forum/nieuwe-leden',
      targetMenuLabel: 'Forum',
      completed: false,
      icon: '💬',
      instructions: 'Ga naar het "Nieuwe Leden" topic en maak je eerste forum post om je voor te stellen aan de community'
    }
  ];

  // Fetch onboarding status on mount
  useEffect(() => {
    if (user) {
      fetchOnboardingStatus();
    }
  }, [user]);

  // Update current step when navigating to different pages
  useEffect(() => {
    if (isOnboarding) {
      const currentPage = window.location.pathname;
      let pageBasedStep = currentStep;
      
      switch (currentPage) {
        case '/dashboard/onboarding':
          pageBasedStep = 1; // Step 1: Main goal
          break;
        case '/dashboard/mijn-missies':
          pageBasedStep = 2; // Step 2: Add missions
          break;
        case '/dashboard/trainingsschemas':
          pageBasedStep = 3; // Step 3: Select training schema
          break;
        case '/dashboard/voedingsplannen':
          pageBasedStep = 4; // Step 4: Select nutrition plan
          break;
        case '/dashboard/brotherhood/forum':
          pageBasedStep = 5; // Step 5: Forum introduction
          break;
        default:
          pageBasedStep = currentStep; // Keep current step if page doesn't match
      }
      
      if (pageBasedStep !== currentStep) {
        console.log('🔄 Updating current step based on page:', pageBasedStep);
        setCurrentStep(pageBasedStep);
      }
    }
  }, [isOnboarding]); // Removed currentStep from dependencies to avoid infinite loop

  const fetchOnboardingStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/onboarding?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setOnboardingStatus(data);
        
        // Check if user is in onboarding
        // Temporary fix: Mark Chiel as completed since he's an admin
        const isChiel = user?.email === 'chiel@media2net.nl';
        const shouldBeInOnboarding = !data.onboarding_completed && !isChiel;
        
        if (shouldBeInOnboarding) {
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
          } else {
            // All steps completed but onboarding not marked as complete
            setCurrentStep(5);
          }
        } else {
          setIsOnboarding(false);
        }
        
        // Log the onboarding status for debugging
        console.log('🔍 Onboarding status:', {
          user: user?.email,
          isChiel,
          shouldBeInOnboarding,
          isOnboarding: shouldBeInOnboarding ? true : false,
          onboarding_completed: data.onboarding_completed
        });
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

  const getCurrentStepInstructions = () => {
    const currentPage = window.location.pathname;
    
    // Return page-specific instructions if available
    switch (currentPage) {
      case '/dashboard/mijn-missies':
        return 'Voeg je eerste missies toe door op "Nieuwe Missie Toevoegen" te klikken of gebruik de "Missie Bibliotheek"';
      case '/dashboard/trainingsschemas':
        return 'Bekijk de beschikbare trainingsschema\'s en selecteer er één die bij je past';
      case '/dashboard/voedingsplannen':
        return 'Vul je dagelijkse behoefte in en selecteer een voedingsplan dat bij je doel past';
      case '/dashboard/brotherhood/forum':
      case '/dashboard/brotherhood/forum/nieuwe-leden':
        return 'Ga naar het "Nieuwe Leden" topic en maak je eerste forum post om je voor te stellen aan de community';
      default:
        return steps[currentStep]?.instructions || 'Voltooi de huidige stap om door te gaan';
    }
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
    getCurrentStepInstructions,
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