'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface OnboardingStep {
  id: number;
  title: string;
  requiresAccess: string | null;
}

interface OnboardingV2ContextType {
  // State
  isLoading: boolean;
  isCompleted: boolean;
  currentStep: number | null;
  availableSteps: OnboardingStep[];
  stepMapping: Record<number, number>;
  
  // Access control
  hasTrainingAccess: boolean;
  hasNutritionAccess: boolean;
  isAdmin: boolean;
  isBasic: boolean;
  
  // Actions
  completeStep: (step: number, data?: any) => Promise<boolean>;
  skipStep: (step: number) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  
  // Navigation
  getNextStep: () => number | null;
  getStepTitle: (stepId: number) => string;
  isStepAvailable: (stepId: number) => boolean;
}

const OnboardingV2Context = createContext<OnboardingV2ContextType | undefined>(undefined);

export function OnboardingV2Provider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [availableSteps, setAvailableSteps] = useState<OnboardingStep[]>([]);
  const [stepMapping, setStepMapping] = useState<Record<number, number>>({});
  
  // Access control
  const [hasTrainingAccess, setHasTrainingAccess] = useState(false);
  const [hasNutritionAccess, setHasNutritionAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBasic, setIsBasic] = useState(false);

  // Load onboarding status
  const loadOnboardingStatus = async () => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/onboarding-v2?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (data.success) {
        setIsCompleted(data.onboarding.isCompleted);
        setCurrentStep(data.onboarding.currentStep);
        setAvailableSteps(data.onboarding.availableSteps || []);
        setStepMapping(data.onboarding.stepMapping || {});
        
        setHasTrainingAccess(data.access.hasTrainingAccess);
        setHasNutritionAccess(data.access.hasNutritionAccess);
        setIsAdmin(data.access.isAdmin);
        setIsBasic(data.access.isBasic);
        
        console.log('✅ Onboarding V2 status loaded:', {
          currentStep: data.onboarding.currentStep,
          isCompleted: data.onboarding.isCompleted,
          hasTrainingAccess: data.access.hasTrainingAccess,
          hasNutritionAccess: data.access.hasNutritionAccess
        });
      } else {
        console.error('❌ Failed to load onboarding status:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete a step
  const completeStep = async (step: number, data?: any): Promise<boolean> => {
    if (!user?.email) return false;

    try {
      const response = await fetch('/api/onboarding-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          step,
          action: 'complete_step',
          data
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Step completed:', step);
        await loadOnboardingStatus(); // Refresh status
        return true;
      } else {
        console.error('❌ Failed to complete step:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error completing step:', error);
      return false;
    }
  };

  // Skip a step
  const skipStep = async (step: number): Promise<boolean> => {
    if (!user?.email) return false;

    try {
      const response = await fetch('/api/onboarding-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          step,
          action: 'skip_step'
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Step skipped:', step);
        await loadOnboardingStatus(); // Refresh status
        return true;
      } else {
        console.error('❌ Failed to skip step:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error skipping step:', error);
      return false;
    }
  };

  // Refresh status
  const refreshStatus = async () => {
    await loadOnboardingStatus();
  };

  // Get next step
  const getNextStep = (): number | null => {
    if (isCompleted) return null;
    
    const currentIndex = currentStep !== null ? stepMapping[currentStep] : -1;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < availableSteps.length) {
      return availableSteps[nextIndex].id;
    }
    
    return null;
  };

  // Get step title
  const getStepTitle = (stepId: number): string => {
    const step = availableSteps.find(s => s.id === stepId);
    return step?.title || 'Onbekende stap';
  };

  // Check if step is available
  const isStepAvailable = (stepId: number): boolean => {
    return availableSteps.some(s => s.id === stepId);
  };

  // Load status when user changes
  useEffect(() => {
    loadOnboardingStatus();
  }, [user?.email]);

  const contextValue: OnboardingV2ContextType = {
    // State
    isLoading,
    isCompleted,
    currentStep,
    availableSteps,
    stepMapping,
    
    // Access control
    hasTrainingAccess,
    hasNutritionAccess,
    isAdmin,
    isBasic,
    
    // Actions
    completeStep,
    skipStep,
    refreshStatus,
    
    // Navigation
    getNextStep,
    getStepTitle,
    isStepAvailable
  };

  return (
    <OnboardingV2Context.Provider value={contextValue}>
      {children}
    </OnboardingV2Context.Provider>
  );
}

export function useOnboardingV2(): OnboardingV2ContextType {
  const context = useContext(OnboardingV2Context);
  if (context === undefined) {
    throw new Error('useOnboardingV2 must be used within an OnboardingV2Provider');
  }
  return context;
}
