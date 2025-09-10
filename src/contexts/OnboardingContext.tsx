'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/hooks/useSubscription';

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
  const { hasAccess } = useSubscription();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);

  // Define all possible steps
  const allSteps: OnboardingStep[] = [
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
      title: 'Uitdagingen selecteren',
      description: 'Kies je dagelijkse uitdagingen',
      targetPage: '/dashboard/mijn-missies',
      targetMenuLabel: 'Mijn Uitdagingen',
      completed: false,
      icon: '🔥',
      instructions: 'Voeg je eerste uitdagingen toe door op "Nieuwe Uitdaging Toevoegen" te klikken of gebruik de "Uitdaging Bibliotheek"'
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
      title: 'Challenge selecteren',
      description: 'Kies een challenge om jezelf uit te dagen',
      targetPage: '/dashboard/challenges',
      targetMenuLabel: 'Challenges',
      completed: false,
      icon: '🏆',
      instructions: 'Selecteer een challenge die past bij je doelen en voorkeuren'
    },
    {
      id: 6,
      title: 'Forum introductie',
      description: 'Stel je voor aan de community',
      targetPage: '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden',
      targetMenuLabel: 'Forum',
      completed: false,
      icon: '💬',
      instructions: 'Ga naar het "Voorstellen - Nieuwe Leden" topic in de Algemeen categorie en maak je eerste forum post om je voor te stellen aan de community'
    }
  ];

  // Filter steps based on subscription tier
  const steps: OnboardingStep[] = allSteps.filter(step => {
    // Basic tier users skip training and nutrition steps
    if (!hasAccess('training') && (step.id === 3)) {
      return false; // Skip training schema step
    }
    if (!hasAccess('nutrition') && (step.id === 4)) {
      return false; // Skip nutrition plan step
    }
    return true;
  });

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
      
      // Find the step index based on the current page
      const stepIndex = steps.findIndex(step => step.targetPage === currentPage);
      if (stepIndex !== -1) {
        pageBasedStep = stepIndex;
      } else {
        // Fallback to original logic for specific pages
        switch (currentPage) {
          case '/dashboard/onboarding':
            pageBasedStep = steps.findIndex(step => step.id === 1); // Main goal step
            break;
          case '/dashboard/mijn-missies':
            pageBasedStep = steps.findIndex(step => step.id === 2); // Missions step
            break;
          case '/dashboard/trainingsschemas':
            pageBasedStep = steps.findIndex(step => step.id === 3); // Training schema step
            break;
          case '/dashboard/voedingsplannen':
            pageBasedStep = steps.findIndex(step => step.id === 4); // Nutrition plan step
            break;
          case '/dashboard/challenges':
            pageBasedStep = steps.findIndex(step => step.id === 5); // Challenge step
            break;
          case '/dashboard/brotherhood/forum':
          case '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden':
            pageBasedStep = steps.findIndex(step => step.id === 6); // Forum step
            break;
          default:
            pageBasedStep = currentStep; // Keep current step if page doesn't match
        }
      }
      
      if (pageBasedStep !== currentStep && pageBasedStep !== -1) {
        console.log('🔄 Updating current step based on page:', pageBasedStep);
        setCurrentStep(pageBasedStep);
      }
    }
  }, [isOnboarding, steps]); // Added steps to dependencies

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
        
        console.log('🔍 Onboarding check:', {
          onboarding_completed: data.onboarding_completed,
          isChiel,
          shouldBeInOnboarding,
          current_step: data.current_step
        });
        
        if (shouldBeInOnboarding) {
          setIsOnboarding(true);
          
          // Use the current_step from database directly
          setCurrentStep(data.current_step);
          
          console.log('✅ Onboarding active:', {
            current_step: data.current_step,
            onboarding_completed: data.onboarding_completed,
            isOnboarding: true
          });
        } else {
          setIsOnboarding(false);
          console.log('❌ Onboarding inactive:', {
            onboarding_completed: data.onboarding_completed,
            isChiel,
            isOnboarding: false
          });
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
        return 'Voeg je eerste uitdagingen toe door op "Nieuwe Uitdaging Toevoegen" te klikken of gebruik de "Uitdaging Bibliotheek"';
      case '/dashboard/trainingsschemas':
        return 'Bekijk de beschikbare trainingsschema\'s en selecteer er één die bij je past';
      case '/dashboard/voedingsplannen':
        return 'Vul je dagelijkse behoefte in en selecteer een voedingsplan dat bij je doel past';
      case '/dashboard/challenges':
        return 'Selecteer een challenge die past bij je doelen en voorkeuren';
      case '/dashboard/brotherhood/forum':
      case '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden':
        return 'Ga naar het "Voorstellen - Nieuwe Leden" topic in de Algemeen categorie en maak je eerste forum post om je voor te stellen aan de community';
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