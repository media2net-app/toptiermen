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
    if (isOnboarding) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOnboarding]);

  if (!isOnboarding) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

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
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Progress and Step Info */}
            <div className="flex items-center space-x-4">
              {/* Step Progress */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  Stap {currentStep + 1} van {steps.length}
                </span>
                <div className="w-24 h-2 bg-green-500 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Current Step Info */}
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStepIcon(currentStep)}</span>
                <div>
                  <h3 className="font-semibold text-sm">{currentStepData?.title}</h3>
                  <p className="text-xs text-green-100">{currentStepData?.description}</p>
                </div>
              </div>
            </div>

            {/* Instructions and Actions */}
            <div className="flex items-center space-x-4">
              {/* Instructions */}
              <div className="flex items-center space-x-2 bg-green-800/50 px-3 py-1 rounded-lg">
                <InformationCircleIcon className="w-4 h-4" />
                <span className="text-sm text-green-100">
                  {getCurrentStepInstructions()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {currentStep === 0 ? (
                  <button
                    onClick={handleSkipToOnboarding}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-800 hover:bg-green-900 rounded-lg text-sm font-medium transition-colors"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>Start Onboarding</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteStep}
                    disabled={isCompleting}
                    className="flex items-center space-x-1 px-4 py-1.5 bg-white text-green-700 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
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