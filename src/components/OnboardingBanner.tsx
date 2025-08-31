'use client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon, PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function OnboardingBanner() {
  const { isOnboarding, currentStep, steps, completeCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Always show banner if onboarding is active
    setIsVisible(isOnboarding);
  }, [isOnboarding]);

  // Don't render if not onboarding
  if (!isOnboarding) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Debug info
  console.log('🎯 OnboardingBanner Debug:', {
    isOnboarding,
    currentStep,
    isVisible,
    progress: `${progress}%`
  });

  const handleCompleteStep = async () => {
    setIsCompleting(true);
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await completeCurrentStep();
    
    // Only navigate to next step's target page if it's different from current
    // AND if we're not staying on the same page for multiple steps
    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];
      const currentPage = window.location.pathname;
      
      // Check if next step is on a different page
      if (nextStep.targetPage !== currentPage) {
        router.push(nextStep.targetPage);
      }
      // If next step is on the same page (like training center), stay put
    }
    
    setIsCompleting(false);
  };

  const handleSkipToOnboarding = () => {
    router.push('/dashboard/onboarding');
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 0: return '🎬';
      case 1: return '🎯';
      case 2: return '🔥';
      case 3: return '💪';
      case 4: return '🥗';
      case 5: return '💬';
      default: return '📋';
    }
  };

  const getStepInstructions = (step: number) => {
    switch (step) {
      case 0: return 'Bekijk de welkomstvideo om het platform te leren kennen';
      case 1: return 'Beschrijf je hoofddoel - wat wil je bereiken?';
      case 2: return 'Selecteer 3-5 missies die je dagelijks wilt voltooien';
      case 3: return 'Kies een trainingsschema dat bij je past';
      case 4: return 'Selecteer je voedingsplan en een challenge';
      case 5: return 'Stel je voor aan de community in het forum';
      default: return 'Voltooi de huidige stap om door te gaan';
    }
  };

  const { getCurrentStepInstructions } = useOnboarding();

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`} style={{ display: isVisible ? 'block' : 'none' }}>
      <div className="bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white shadow-lg border-b-2 border-[#FFD700] min-h-[80px]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Progress and Step Info */}
            <div className="flex items-center space-x-6">
              {/* Step Progress */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-white">
                  Stap {currentStep + 1} van {steps.length}
                </span>
                <div className="w-32 h-3 bg-[#181F17] rounded-full overflow-hidden border border-[#FFD700]">
                  <div 
                    className="h-full bg-[#FFD700] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Current Step Info */}
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStepIcon(currentStep)}</span>
                <div>
                  <h3 className="font-bold text-sm text-white">{currentStepData?.title}</h3>
                  <p className="text-xs text-[#FFD700]">{currentStepData?.description}</p>
                </div>
              </div>
            </div>

            {/* Instructions and Actions */}
            <div className="flex items-center space-x-4">
              {/* Instructions */}
              <div className="flex items-center space-x-2 bg-[#181F17]/80 px-4 py-2 rounded-lg border border-[#FFD700]/30">
                <InformationCircleIcon className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm text-white font-medium">
                  {getCurrentStepInstructions()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {currentStep === 0 ? (
                  <button
                    onClick={handleSkipToOnboarding}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#FFD700] hover:bg-[#FFE55C] text-[#181F17] rounded-lg text-sm font-bold transition-all duration-200 shadow-lg"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>Start Onboarding</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteStep}
                    disabled={isCompleting}
                    className="flex items-center space-x-2 px-6 py-2 bg-[#FFD700] hover:bg-[#FFE55C] text-[#181F17] rounded-lg text-sm font-bold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin" />
                        <span>Bezig...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Stap Voltooien</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 