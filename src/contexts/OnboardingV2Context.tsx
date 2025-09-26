'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  
  // Loading overlay state
  showLoadingOverlay: boolean;
  loadingText: string;
  loadingProgress: number;
  
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
  
  // Loading overlay state
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Access control
  const [hasTrainingAccess, setHasTrainingAccess] = useState(false);
  const [hasNutritionAccess, setHasNutritionAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBasic, setIsBasic] = useState(false);

  // Loading sequence function - optimized for smoother experience
  const startLoadingSequence = (stepNumber: number, stepTitle: string) => {
    console.log(`🎬 Starting loading sequence for step ${stepNumber}: ${stepTitle}`);
    setShowLoadingOverlay(true);
    setLoadingText(`Stap ${stepNumber} laden...`);
    setLoadingProgress(0);
    
    // Faster, smoother loading sequence
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15; // Increased from 10 to 15 for faster progress
      if (progress <= 90) {
        setLoadingProgress(progress);
        if (progress < 30) {
          setLoadingText(`Stap ${stepNumber} laden...`);
        } else if (progress < 60) {
          setLoadingText(`${stepTitle} voorbereiden...`);
        } else if (progress < 90) {
          setLoadingText(`Bijna klaar...`);
        }
      } else {
        clearInterval(interval);
      }
    }, 200); // Reduced from 300ms to 200ms for smoother animation
    
    // Cleanup interval after 2.5 seconds (reduced from 4 seconds)
    setTimeout(() => clearInterval(interval), 2500);
  };

  const hideLoadingOverlay = () => {
    console.log('🎬 Hiding loading overlay');
    setShowLoadingOverlay(false);
    setLoadingText('');
    setLoadingProgress(0);
  };

  // Load onboarding status with enhanced loading state management
  const loadOnboardingStatus = async () => {
    if (!user?.email) {
      console.log('🔍 No user email, setting loading to false');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Starting onboarding status load for:', user.email);
      setIsLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Onboarding status load timeout, forcing completion');
        setIsLoading(false);
      }, 10000); // 10 second timeout
      
      const response = await fetch(`/api/onboarding-v2?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();

      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      if (data.success) {
        const isCompletedValue = data.onboarding.isCompleted;
        const currentStepValue = data.onboarding.currentStep;
        
        console.log('✅ Onboarding V2 status loaded:', {
          currentStep: currentStepValue,
          isCompleted: isCompletedValue,
          hasTrainingAccess: data.access.hasTrainingAccess,
          hasNutritionAccess: data.access.hasNutritionAccess
        });
        
        // Set all states atomically to prevent race conditions
        setIsCompleted(isCompletedValue);
        setCurrentStep(currentStepValue);
        setAvailableSteps(data.onboarding.availableSteps || []);
        setStepMapping(data.onboarding.stepMapping || {});
        
        setHasTrainingAccess(data.access.hasTrainingAccess);
        setHasNutritionAccess(data.access.hasNutritionAccess);
        setIsAdmin(data.access.isAdmin);
        setIsBasic(data.access.isBasic);
        
        // Ensure loading is set to false after all state updates
        setTimeout(() => {
          console.log('🏁 Onboarding status load completed, setting loading to false');
          setIsLoading(false);
        }, 100); // Small delay to ensure state updates are processed
      } else {
        console.error('❌ Failed to load onboarding status:', data.error);
        // Set default values on error
        setIsCompleted(false);
        setCurrentStep(1);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error loading onboarding status:', error);
      // Set default values on error
      setIsCompleted(false);
      setCurrentStep(1);
      setIsLoading(false);
    }
  };

  // Complete a step
  const completeStep = async (step: number, data?: any): Promise<boolean> => {
    if (!user?.email) return false;

    try {
      // Start loading sequence
      const stepTitle = getStepTitle(step);
      startLoadingSequence(step, stepTitle);

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
        
        // Hide loading overlay after a longer delay to ensure smooth transition
        setTimeout(() => {
          hideLoadingOverlay();
        }, 2000);
        
        return true;
      } else {
        console.error('❌ Failed to complete step:', result.error);
        hideLoadingOverlay();
        return false;
      }
    } catch (error) {
      console.error('❌ Error completing step:', error);
      hideLoadingOverlay();
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

  // Refresh status (memoized to prevent infinite loops)
  const refreshStatus = useCallback(async () => {
    await loadOnboardingStatus();
  }, [user?.email]);

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

  // Load status when user changes - ENHANCED with reset on user change
  useEffect(() => {
    if (user?.email) {
      console.log('🔄 User changed, loading onboarding status for:', user.email);
      // Reset states first to prevent flash
      setIsLoading(true);
      setIsCompleted(false);
      setCurrentStep(null);
      loadOnboardingStatus();
    } else {
      console.log('🔍 No user, resetting onboarding states');
      // Reset all states when user logs out
      setIsLoading(false);
      setIsCompleted(false);
      setCurrentStep(null);
      setAvailableSteps([]);
      setStepMapping({});
      setHasTrainingAccess(false);
      setHasNutritionAccess(false);
      setIsAdmin(false);
      setIsBasic(false);
    }
  }, [user?.email]);

  const contextValue: OnboardingV2ContextType = {
    // State
    isLoading,
    isCompleted,
    currentStep,
    availableSteps,
    stepMapping,
    
    // Loading overlay state
    showLoadingOverlay,
    loadingText,
    loadingProgress,
    
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
